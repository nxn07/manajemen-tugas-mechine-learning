#!/bin/bash

# ==========================================
# FINAL AUTO-DETECT & FIX SCRIPT
# Auto-check employee count and seed if needed
# ==========================================

echo "================================================"
echo "🔍 AUTO CHECKING EMPLOYEE DATA"
echo "================================================"
echo ""

# Function to check container status
check_containers() {
    echo "Checking containers..."
    podman ps --format "{{.Names}} | {{.Status}}" 2>&1 | head -10
    
    # Check if backend is healthy
    BACKEND_STATUS=$(podman ps --filter name=simkap_backend --format "{{.Status}}" 2>&1 | grep -oE "[uU]p.*" || echo "not running")
    
    if [[ "$BACKEND_STATUS" =~ [uU]p ]]; then
        echo "✅ Backend is running!"
        return 0
    else
        echo "❌ Backend NOT RUNNING or unhealthy"
        return 1
    fi
}

# Check containers first
if ! check_containers; then
    echo ""
    echo "⚠️ Starting containers..."
    podman-compose up -d
    sleep 15
fi

echo ""
echo "================================================"
echo "📊 CHECKING EMPLOYEE COUNT IN DATABASE"
echo "================================================"
echo ""

# Try to get employee count using Laravel Tinker
COUNT_RESULT=$(podman exec -t simkap_backend php artisan tinker --execute="echo DB::table('employees')->count();" 2>&1)

# Extract just the number from output
EMP_COUNT=$(echo "$COUNT_RESULT" | grep -oE "^\s*[0-9]+" | head -1 | tr -d ' ')

echo "Employee count result: $EMP_COUNT"
echo ""

# Analyze result
if [ -z "$EMP_COUNT" ] || [ "$EMP_COUNT" -eq 0 ]; then
    echo "================================================"
    echo "⚠️ NO EMPLOYEES FOUND! Running seeder now..."
    echo "================================================"
    echo ""
    
    # Clear caches first
    echo "Clearing application cache..."
    podman exec -t simkap_backend php artisan config:clear >/dev/null 2>&1
    podman exec -t simkap_backend php artisan cache:clear >/dev/null 2>&1
    
    # Run the seeder
    echo "Running Employee Seeder..."
    ./run-seed-employees.sh
    
    echo ""
    echo "=========================================="
    echo "✅ SEEDER COMPLETE! Verifying data..."
    echo "=========================================="
    echo ""
    
    # Verify again
    NEW_COUNT=$(podman exec -t simkap_backend php artisan tinker --execute="echo DB::table('employees')->count();" 2>&1 | grep -oE "^\s*[0-9]+" | tail -1 | tr -d ' ')
    
    echo "Final employee count: $NEW_COUNT"
    echo ""
    
    if [ "$NEW_COUNT" -ge 33 ]; then
        echo "✅ SUCCESS! Database now has $NEW_COUNT employees!"
        echo ""
        
        echo "================================================"
        echo "🎯 NEXT STEPS TO VIEW IN FRONTEND"
        echo "================================================"
        echo ""
        echo "1. HARD REFRESH BROWSER:"
        echo "   Press Ctrl+Shift+R (Windows/Linux)"
        echo "   or Cmd+Shift+R (Mac)"
        echo ""
        echo "2. Open URLs:"
        echo "   • Users: http://localhost:3000/users"
        echo "   • ML Clustering: http://localhost:3000/ml-clustering"
        echo ""
        echo "3. Should see:"
        echo "   ✅ Total Karyawan: $NEW_COUNT"
        echo "   ✅ User table displays all employees"
        echo "   ✅ Can run ML clustering immediately"
        echo ""
        
    else
        echo "⚠️ Warning: Only $NEW_COUNT employees found after seeding"
        echo "Manual fix required:"
        echo "  podman exec -it simkap_backend \\"
        echo "    php artisan db:seed --class=EmployeesWithMlFeaturesSeeder"
    fi
    
elif [ "$EMP_COUNT" -lt 33 ]; then
    echo "⚠️ Only $EMP_COUNT employees found (expecting 33)"
    echo "Running seeder to complete dataset..."
    ./run-seed-employees.sh
    sleep 5
    NEW_COUNT=$(podman exec -t simkap_backend php artisan tinker --execute="echo DB::table('employees')->count();" 2>&1 | grep -oE "^\s*[0-9]+" | tail -1 | tr -d ' ')
    echo "✅ Updated count: $NEW_COUNT employees"
    
else
    echo "✅ ALREADY HAVE PROPER AMOUNT OF EMPLOYEES!"
    echo "   Current count: $EMP_COUNT employees"
    echo "   Ready for use!"
    echo ""
    
    echo "================================================"
    echo "📊 ADDITIONAL VERIFICATION"
    echo "================================================"
    echo ""
    
    # Check ML features count
    FEATURE_COUNT=$(podman exec -t simkap_backend php artisan tinker --execute="echo DB::table('ml_employee_feature_data')->count();" 2>&1 | grep -oE "^\s*[0-9]+" | tail -1 | tr -d ' ')
    
    echo "Employees with ML features: ${FEATURE_COUNT:-0}/$EMP_COUNT"
    echo ""
    
    if [ "${FEATURE_COUNT:-0}" -lt "$EMP_COUNT" ]; then
        echo "⚠️ Some employees don't have ML features yet"
        echo "Run feature extraction:"
        echo "  curl -X POST http://localhost:8000/api/v1/ml/extract-features \\"
        echo "    -H \"Content-Type: application/json\" \\"
        echo "    -d '{\"period\": \"'"$(date +%Y-%m)"'\"}'"
    else
        echo "✅ All employees have ML features ready!"
    fi
    
    echo ""
    echo "Test API:"
    curl -sf http://localhost:8000/api/v1/users?page=1&per_page=5 >/dev/null 2>&1 && echo "✅ API responding OK" || echo "⚠️ API may have issues"
    echo ""
    
    echo "Test Frontend:"
    curl -sf http://localhost:3000/users >/dev/null 2>&1 && echo "✅ Frontend responding OK" || echo "⚠️ Frontend may have issues"
fi

echo ""
echo "================================================"
echo "✨ VERIFICATION COMPLETE!"
echo "================================================"
echo ""
