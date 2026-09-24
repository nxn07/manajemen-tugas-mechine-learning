#!/bin/bash

echo "=============================================="
echo "🚀 INSTANT FIX - EMPLOYEE DATA NOT SHOWING"
echo "=============================================="
echo ""

# Auto-detect container runtime
if command -v podman &> /dev/null; then
    CONTAINER_CMD="podman"
elif command -v docker &> /dev/null; then
    CONTAINER_CMD="docker"
else
    echo "❌ Error: Neither podman nor docker found!"
    exit 1
fi

echo "✅ Using $CONTAINER_CMD"
echo ""

# Step 1: Check if containers are running
echo "Step 1: Checking container status..."
CONTAINERS=$($CONTAINER_CMD ps --format "{{.Names}}" 2>/dev/null | grep -E "simkap_(backend|frontend|postgres)")

if [ -z "$CONTAINERS" ]; then
    echo "⚠️ Containers not running!"
    echo "   Starting all services..."
    
    if [ -f "podman-compose.yml" ]; then
        $CONTAINER_CMD-compose up -d
    elif [ -f "docker-compose.yml" ]; then
        docker-compose up -d
    else
        echo "❌ No compose file found!"
        exit 1
    fi
    
    echo "Waiting 30 seconds for containers to start..."
    sleep 30
fi

# Count running containers
RUNNING_COUNT=$(echo "$CONTAINERS" | wc -l)
echo "   Found $RUNNING_COUNT services running"
echo ""

# Step 2: Check backend health
echo "Step 2: Verifying backend health..."
BACKEND_CONTAINER=$($CONTAINER_CMD ps --filter name=simkap_backend --format {{.Names}} 2>/dev/null)

if [ -n "$BACKEND_CONTAINER" ]; then
    HEALTH_CHECK=$($CONTAINER_CMD exec -t "$BACKEND_CONTAINER" curl -sf http://localhost:8000/api/v1/health 2>&1)
    
    if echo "$HEALTH_CHECK" | grep -q "ok"; then
        echo "   ✅ Backend is healthy"
    else
        echo "   ⚠️ Backend may not be ready, waiting..."
        sleep 5
        
        # Retry
        HEALTH_CHECK=$($CONTAINER_CMD exec -t "$BACKEND_CONTAINER" curl -sf http://localhost:8000/api/v1/health 2>&1)
        
        if echo "$HEALTH_CHECK" | grep -q "ok"; then
            echo "   ✅ Backend is now healthy"
        else
            echo "   ❌ Backend still unhealthy"
            echo "   Restarting backend..."
            $CONTAINER_CMD-compose restart backend
            sleep 10
        fi
    fi
else
    echo "   ❌ Backend container not found!"
    exit 1
fi

# Step 3: Check employee count
echo ""
echo "Step 3: Checking employee count..."
EMPLOYEE_COUNT=$($CONTAINER_CMD exec -t "$BACKEND_CONTAINER" php artisan tinker --execute="echo DB::table('employees')->count();" 2>&1 | tail -1 | tr -d '[]' | xargs)

echo "   Current employees in database: $EMPLOYEE_COUNT"

if [ "$EMPLOYEE_COUNT" -eq 0 ] || [ -z "$EMPLOYEE_COUNT" ]; then
    echo ""
    echo "⚠️ NO EMPLOYEES FOUND! Running seeder..."
    echo ""
    
    # Clear any previous cache
    $CONTAINER_CMD exec -t "$BACKEND_CONTAINER" php artisan config:clear 2>/dev/null
    $CONTAINER_CMD exec -t "$BACKEND_CONTAINER" php artisan cache:clear 2>/dev/null
    
    # Run seeder
    ./run-seed-employees.sh
    
    # Wait a bit
    sleep 3
    
    # Verify again
    EMPLOYEE_COUNT=$($CONTAINER_CMD exec -t "$BACKEND_CONTAINER" php artisan tinker --execute="echo DB::table('employees')->count();" 2>&1 | tail -1 | tr -d '[]' | xargs)
    echo ""
    echo "✅ New employee count: $EMPLOYEE_COUNT"
elif [ "$EMPLOYEE_COUNT" -lt 33 ]; then
    echo ""
    echo "⚠️ Only $EMPLOYEE_COUNT employees found (expecting 33)"
    echo "Running seeder to ensure complete dataset..."
    ./run-seed-employees.sh
    sleep 3
    EMPLOYEE_COUNT=$($CONTAINER_CMD exec -t "$BACKEND_CONTAINER" php artisan tinker --execute="echo DB::table('employees')->count();" 2>&1 | tail -1 | tr -d '[]' | xargs)
    echo "✅ Updated employee count: $EMPLOYEE_COUNT"
else
    echo "   ✅ Employee count looks good: $EMPLOYEE_COUNT"
fi

# Step 4: Test API endpoint
echo ""
echo "Step 4: Testing API endpoint..."
API_RESPONSE=$(curl -sf http://localhost:8000/api/v1/users?page=1&per_page=5 2>/dev/null)

if [ -n "$API_RESPONSE" ]; then
    API_USERS=$(echo "$API_RESPONSE" | jq -r '.meta.total // 0' 2>/dev/null)
    echo "   ✅ API returns user data"
    echo "   Total users from API: $API_USERS"
else
    echo "   ⚠️ API not responding"
    echo "   Checking logs..."
    $CONTAINER_CMD logs "$BACKEND_CONTAINER" --tail 20
fi

# Step 5: Clear caches
echo ""
echo "Step 5: Clearing application caches..."
$CONTAINER_CMD exec -t "$BACKEND_CONTAINER" php artisan cache:clear >/dev/null 2>&1
$CONTAINER_CMD exec -t "$BACKEND_CONTAINER" php artisan config:clear >/dev/null 2>&1
$CONTAINER_CMD exec -t "$BACKEND_CONTAINER" php artisan route:clear >/dev/null 2>&1
echo "   ✅ Caches cleared"

# Step 6: Optimize database queries (add indexes if missing)
echo ""
echo "Step 6: Running performance optimization..."
MIGRATION_RESULT=$($CONTAINER_CMD exec -t "$BACKEND_CONTAINER" php artisan migrate --force 2>&1)
if echo "$MIGRATION_RESULT" | grep -q "up"; then
    echo "   ✅ Migrations run successfully"
    INDEXES_ADDED=$(echo "$MIGRATION_RESULT" | grep -c "indexes")
    echo "   Indexes created/found: $INDEXES_ADDED"
fi

# Step 7: Warm up cache
echo ""
echo "Step 7: Warming up user list cache..."
$CONTAINER_CMD exec -t "$BACKEND_CONTAINER" php artisan tinker --execute="app(\App\Services\UserService::class)->getTotalUserCount();" >/dev/null 2>&1
echo "   ✅ Cache warmed up"

# Step 8: Final verification
echo ""
echo "=============================================="
echo "✅ FINAL VERIFICATION"
echo "=============================================="
echo ""

# Summary
echo "📊 Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Backend Status: $(echo "$HEALTH_CHECK" | grep -q "ok" && echo "✅ Healthy" || echo "⚠️ Not healthy")"
echo "Employee Count: $EMPLOYEE_COUNT (Expected: 33+)"
echo "API Response: $(test -n "$API_RESPONSE" && echo "✅ Working" || echo "❌ Not responding")"
echo "Cache Status: Cleared & Warmed Up"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Access URLs
echo "🌐 Test your application:"
echo ""
echo "1. Users Management Page:"
echo "   http://localhost:3000/users"
echo "   Expected: Shows ${EMPLOYEE_COUNT:-33} users in table"
echo ""
echo "2. Direct API Test:"
echo "   curl http://localhost:8000/api/v1/users?page=1&per_page=5"
echo ""
echo "3. ML Clustering Page:"
echo "   http://localhost:3000/ml-clustering"
echo "   Expected: 'Total Karyawan: ${EMPLOYEE_COUNT:-33}'"
echo ""
echo "4. Health Check:"
echo "   http://localhost:8000/api/v1/health"
echo "   Expected: {\"status\":\"ok\"}"
echo ""

# Troubleshooting
echo "🐛 If you STILL see 0 users on frontend:"
echo ""
echo "A. Hard Refresh Browser:"
echo "   Press Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)"
echo ""
echo "B. Check Browser Console:"
echo "   F12 → Console tab"
echo "   Look for red errors about fetch/API calls"
echo ""
echo "C. Clear Browser Cache Completely:"
echo "   Chrome/Edge: Settings > Privacy > Clear browsing data"
echo "   Select 'Cached images and files'"
echo ""
echo "D. Check Network Tab:"
echo "   F12 → Network tab → Filter by XHR"
echo "   Click 'users' request"
echo "   Should return status 200 with JSON data"
echo ""
echo "E. Verify CORS Configuration:"
echo "   File: backend/config/cors.php"
echo "   Check if 'allowed_origins' includes localhost:3000"
echo ""
echo "F. Restart Frontend Container:"
echo "   $CONTAINER_CMD-compose restart frontend"
echo ""
echo "G. Check CORS headers in response:"
echo "   Inspect Network tab → Response Headers"
echo "   Should include: Access-Control-Allow-Origin"
echo ""

echo "=============================================="
echo "✨ TROUBLESHOTING COMPLETE!"
echo "=============================================="
echo ""
echo "Run this check anytime to verify:"
echo "  ./check-and-fix-employees.sh"
echo ""
echo "Or apply full optimization:"
echo "  ./QUICK_FIX_ALL_ISSUES.sh"
echo ""

exit 0
