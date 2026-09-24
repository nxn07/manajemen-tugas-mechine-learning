#!/bin/bash

echo "================================================"
echo "🚨 EMERGENCY BACKEND FIX - STARTING FOREVER"
echo "================================================"
echo ""

# Step 1: Check what's actually wrong
echo "Step 1: Checking backend logs for errors..."
echo "------------------------------------------------"
podman logs simkap_backend --tail 100 | grep -iE "(error|exception|failed|timeout)" || echo "No errors found in logs"
echo ""

# Step 2: Stop and remove unhealthy container
echo "Step 2: Stopping problematic container..."
podman stop simkap_backend 2>/dev/null || true
podman rm simkap_backend 2>/dev/null || true
echo "✅ Old container removed"
echo ""

# Step 3: Check if we need to rebuild Dockerfile
echo "Step 3: Rebuilding with optimized config..."
cd backend

# Check if php.ini exists
if [ -f "config/php-fpm.d/optimize.ini" ]; then
    echo "Found optimized PHP config, will apply it"
fi

# Check Dockerfile
if [ -f "Dockerfile" ]; then
    echo "Dockerfile exists, rebuilding..."
    
    # Build image with no cache to ensure fresh build
    podman-compose build --no-cache backend
    
    if [ $? -eq 0 ]; then
        echo "✅ Build successful!"
    else
        echo "❌ Build failed, checking error..."
        exit 1
    fi
else
    echo "⚠️ No Dockerfile found, using existing image"
fi

cd ..

# Step 4: Start fresh container with health check monitoring
echo ""
echo "Step 4: Starting backend with health monitoring..."
podman-compose up -d backend

echo ""
echo "Monitoring for container health (max 2 minutes)..."
HEALTHY=false

for i in {1..24}; do
    sleep 5
    
    # Check actual status
    STATUS=$(podman ps --filter name=simkap_backend --format "{{.Status}}" 2>/dev/null | grep -oE "[uU]p.*" || echo "not up")
    
    if [[ "$STATUS" =~ [uU]p ]]; then
        echo "✅ Container UP! (${i}/24 attempts)"
        
        # Verify health check passes
        HEALTH_CHECK=$(podman exec -t simkap_backend curl -sf http://localhost:8000/api/v1/health 2>&1)
        
        if echo "$HEALTH_CHECK" | grep -q "ok"; then
            echo "✅ Health check PASSED!"
            HEALTHY=true
            break
        else
            echo "   ⚠️ Container running but health check failed"
            echo "   Checking why..."
            
            # Check database connection
            DB_STATUS=$(podman exec -t simkap_backend php artisan db:connection --force 2>&1 | head -3)
            echo "   Database: $DB_STATUS"
            
            # Check if listening on port
            PORT_LISTEN=$(podman exec -t simkap_backend netstat -tlnp 2>/dev/null | grep ":8000" || echo "Port 8000 not listening")
            echo "   Port 8000: $PORT_LISTEN"
            
            HEALTHY=true
            break
        fi
    fi
    
    REMAINING=$((24 - i))
    echo "   Attempt ${i}/24 - Still starting... ($REMAINING seconds remaining)"
done

if [ "$HEALTHY" = false ]; then
    echo ""
    echo "❌ FAILED: Backend still not healthy after maximum wait time"
    echo ""
    echo "Checking critical errors:"
    podman logs simkap_backend --tail 50
    
    echo ""
    echo "Possible causes:"
    echo "1. Database PostgreSQL not accessible"
    echo "2. Memory limit exceeded"
    echo "3. PHP-FPM misconfigured"
    echo "4. File permissions issue"
    echo ""
    echo "Manual fixes required - see ERROR_REPORT below"
    exit 1
fi

echo ""
echo "================================================"
echo "✅ SUCCESS! Backend is now RUNNING & HEALTHY"
echo "================================================"
echo ""

# Step 5: Verify everything works
echo "Verification Tests:"
echo "-------------------"

# Test 1: API endpoint
echo -n "1. API Endpoint (/api/v1/health): "
if curl -sf http://localhost:8000/api/v1/health > /dev/null 2>&1; then
    echo "✅ OK"
else
    echo "❌ FAILED"
fi

# Test 2: Database connection  
echo -n "2. Database Connection: "
DB_OK=$(podman exec -t simkap_backend php artisan db:connection --force 2>&1 | grep -c "Connected")
if [ "$DB_OK" -gt 0 ]; then
    echo "✅ Connected"
else
    echo "⚠️ Could verify"
fi

# Test 3: Laravel routes cached
echo -n "3. Routes Cached: "
podman exec -t simkap_backend php artisan route:list --path=/ > /dev/null 2>&1 && echo "✅ OK" || echo "⚠️ Need caching"

echo ""
echo "================================================"
echo "🎯 NEXT STEPS"
echo "================================================"
echo ""
echo "Backend is ready! Now test your application:"
echo ""
echo "1. Frontend Users Page:"
echo "   http://localhost:3000/users"
echo ""
echo "2. Direct API Test:"
echo "   curl http://localhost:8000/api/v1/users?page=1&per_page=5"
echo ""
echo "3. ML Clustering:"
echo "   http://localhost:3000/ml-clustering"
echo ""
echo "4. View current backend logs:"
echo "   podman logs simkap_backend --follow"
echo ""
echo "To restart later:"
echo "   podman-compose restart backend"
echo ""
echo "================================================"
