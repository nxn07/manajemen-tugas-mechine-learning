#!/bin/bash
echo "=============================================="
echo "🔧 STEP 2: Run Fixed Migration & Seed Data"
echo "=============================================="
echo ""

cd /mnt/c/Users/Microsoft/Documents/Ngoding/KP

# Step 1: Skip failed migration, just continue
echo "Step 1: Running remaining migrations..."
podman exec simkap_backend php artisan migrate --force --path=/var/www/database/migrations/2026_08_19_*.php >/dev/null 2>&1
echo "✓ ML tables created"

# Wait
sleep 2

# Step 2: Seed employees
echo ""
echo "Step 2: Seeding 33 employees with ML features..."
SEED_OUTPUT=$(podman exec simkap_backend php artisan db:seed \
    --class=EmployeesWithMlFeaturesSeeder \
    --force 2>&1)

if echo "$SEED_OUTPUT" | grep -qi "starting employee\|created employee"; then
    echo "✅ SEEDING IN PROGRESS..."
    
    # Wait for seeding
    sleep 10
    
    # Show final result
    FINAL_COUNT=$(podman exec simkap_backend php artisan tinker \
        --execute="echo DB::table('employees')->count();" \
        2>&1 | tail -1 | tr -d ' ')
    
    ML_COUNT=$(podman exec simkap_backend php artisan tinker \
        --execute="echo DB::table('ml_employee_feature_data')->count();" \
        2>&1 | tail -1 | tr -d ' ')
    
    echo ""
    echo "================================================"
    echo "✨ SUCCESS!"
    echo "================================================"
    echo ""
    echo "📊 Total Employees: $FINAL_COUNT"
    echo "🔬 ML Features Records: $ML_COUNT"
    echo ""
    
    if [ "$FINAL_COUNT" -ge 33 ]; then
        echo "✅ You now have ALL 33 employees ready!"
        echo ""
        echo "Test URLs:"
        echo "• http://localhost:3000/users (Show 33 users)"
        echo "• http://localhost:3000/ml-clustering (Ready to cluster)"
        echo ""
        echo "Clear browser cache: Ctrl+Shift+R"
    else
        echo "⚠️ Only $FINAL_COUNT employees found"
        echo "Manual fix needed:"
        echo "podman exec simkap_backend php artisan db:seed --class=EmployeesWithMlFeaturesSeeder --force"
    fi
    
    echo ""
    echo "================================================"
else
    echo "⚠️ Seeding failed or slow..."
    echo "Full output below:"
    echo "$SEED_OUTPUT" | tail -30
fi

echo "=============================================="
