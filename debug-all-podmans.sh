#!/bin/bash

echo "=============================================="
echo "🔍 COMPREHENSIVE PODMAN SYSTEM DIAGNOSTIC"
echo "=============================================="
echo ""

# Function to check command availability
check_cmd() {
    if command -v $1 &> /dev/null; then
        echo "✅ $1 available"
        return 0
    else
        echo "❌ $1 NOT FOUND - trying alternative..."
        return 1
    fi
}

# Check which container runtime is available
if check_cmd podman; then
    RUNTIME="podman"
elif check_cmd docker; then
    RUNTIME="docker"
else
    echo "❌ No container runtime found!"
    exit 1
fi

echo ""
echo "=== CONTAINER STATUS ==="
echo "--- Checking all containers ---"
$RUNTIME ps --format "{{.Names}} | {{.Image}} | {{.Status}}"

echo ""
echo "=== BACKEND HEALTH CHECK ==="
# Check if backend is running
BACKEND_EXISTS=$($RUNTIME ps --filter name=simkap_backend --format "{{.Status}}" 2>/dev/null)

if [ -z "$BACKEND_EXISTS" ]; then
    echo "⚠️ Backend container NOT RUNNING"
    echo "Fix: $RUNTIME-compose start backend"
else
    echo "Backend status: $BACKEND_EXISTS"
    
    # Check health endpoint
    if curl -sf http://localhost:8000/api/v1/health > /dev/null 2>&1; then
        echo "✅ Health endpoint responding"
        
        # Get response time
        RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" http://localhost:8000/api/v1/health)
        echo "Response time: $(printf "%.2f" $(echo "$RESPONSE_TIME * 1000" | bc))ms"
    else
        echo "❌ Health endpoint NOT responding"
        echo "Checking logs..."
        $RUNTIME logs simkap_backend --tail 30
    fi
fi

echo ""
echo "=== DATABASE CONNECTION ==="
DB_STATUS=$($RUNTIME exec -t simkap_postgres psql -U postgres -d sim_kinerja -c "SELECT 1;" 2>&1 | grep -c "^1")
if [ "$DB_STATUS" -gt 0 ]; then
    echo "✅ PostgreSQL connected"
else
    echo "⚠️ Database connection issue"
fi

echo ""
echo "=== REDIS CACHE ==="
REDIS_PING=$($RUNTIME exec -t simkap_redis redis-cli ping 2>&1)
if [ "$REDIS_PING" = "PONG" ]; then
    echo "✅ Redis healthy"
else
    echo "⚠️ Redis status: $REDIS_PING"
fi

echo ""
echo "=== EMPLOYEE DATA CHECK ==="
EMP_COUNT=$($RUNTIME exec -t simkap_backend php artisan tinker --execute="echo DB::table('employees')->count();" 2>&1 | grep -oE "^\s*[0-9]+" | head -1 | tr -d ' ')
if [ -n "$EMP_COUNT" ] && [ "$EMP_COUNT" -gt 0 ]; then
    echo "✅ Employees in database: $EMP_COUNT"
else
    echo "⚠️ No employees or count unknown ($EMP_COUNT)"
fi

echo ""
echo "=== CACHES STATUS ==="
CONFIG_CACHE=$($RUNTIME exec -t simkap_backend ls -la bootstrap/cache/config.php 2>/dev/null | wc -l)
ROUTE_CACHE=$($RUNTIME exec -t simkap_backend ls -la bootstrap/cache/routes-v7.php 2>/dev/null | wc -l)

if [ "$CONFIG_CACHE" -gt 0 ]; then
    echo "✅ Config cached"
else
    echo "⚠️ Config NOT cached - run: php artisan config:cache"
fi

if [ "$ROUTE_CACHE" -gt 0 ]; then
    echo "✅ Routes cached"
else
    echo "⚠️ Routes NOT cached - run: php artisan route:cache"
fi

echo ""
echo "=== RECOMMENDED FIXES ==="

# Check for common issues
ISSUES_FOUND=false

# Issue 1: Backend unhealthy
if [[ "$BACKEND_EXISTS" =~ [uU]p.*starting|unhealthy ]]; then
    echo "⚠️ ISSUE 1: Backend stuck at starting"
    echo "   Fix: $RUNTIME-compose restart backend"
    ISSUES_FOUND=true
fi

# Issue 2: Not enough employees
if [ -z "$EMP_COUNT" ] || ([ "$EMP_COUNT" != "0" ] && [ "$EMP_COUNT" -lt 5 ]); then
    echo "⚠️ ISSUE 2: Insufficient employee data"
    echo "   Fix: ./run-seed-employees.sh"
    ISSUES_FOUND=true
fi

# Issue 3: Cache not configured
if [ "$CONFIG_CACHE" -eq 0 ] || [ "$ROUTE_CACHE" -eq 0 ]; then
    echo "⚠️ ISSUE 3: Optimizations not applied"
    echo "   Fix:"
    echo "   $RUNTIME exec simkap_backend php artisan config:cache"
    echo "   $RUNTIME exec simkap_backend php artisan route:cache"
    ISSUES_FOUND=true
fi

if [ "$ISSUES_FOUND" = false ]; then
    echo "✅ All systems appear healthy!"
    echo ""
    echo "🎯 NEXT STEPS:"
    echo "1. Test frontend: http://localhost:3000/users"
    echo "2. Clear browser cache: Ctrl+Shift+R"
    echo "3. If still slow: run optimizations below"
fi

echo ""
echo "================================================"
echo "DIAGNOSTIC COMPLETE"
echo "================================================"
