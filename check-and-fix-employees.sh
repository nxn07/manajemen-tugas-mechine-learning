#!/bin/bash

echo "=============================================="
echo "🔍 EMPLOYEE DATA VERIFICATION"
echo "=============================================="
echo ""

# Function to check container health
check_container_status() {
    echo "Checking container status..."
    if command -v podman &> /dev/null; then
        echo "Podman available"
        podman ps --format "{{.Names}} | {{.Status}}" 2>/dev/null || echo "No containers found"
    elif command -v docker &> /dev/null; then
        echo "Docker available"
        docker ps --format "{{.Names}} | {{.Status}}" 2>/dev/null || echo "No containers found"
    else
        echo "❌ No container runtime found (podman or docker)"
        exit 1
    fi
    echo ""
}

# Check containers
check_container_status

# Try to get employee count from backend
echo "📊 Checking Employee Count in Database..."
echo ""

if [ -n "$BACKEND_RUNNING" ]; then
    # Try different ways to check database
    BACKEND_CONTAINER=$(podman ps --filter name=simkap_backend --format {{.Names}} 2>/dev/null)
    
    if [ -n "$BACKEND_CONTAINER" ]; then
        echo "Found backend container: $BACKEND_CONTAINER"
        
        # Method 1: Using Laravel Tinker
        echo "Method 1: Using Laravel Tinker..."
        RESULT=$(podman exec -t "$BACKEND_CONTAINER" php artisan tinker --execute="echo 'Employees: ' . DB::table('employees')->count();" 2>&1)
        echo "$RESULT" | grep -E "(Employees|Employees:|error|Error)"
        
        # Method 2: Direct SQL query (if you know credentials)
        echo ""
        echo "Method 2: Direct PostgreSQL query (checking table exists)..."
        PG_CONTAINER=$(podman ps --filter name=simkap_postgres --format {{.Names}} 2>/dev/null)
        if [ -n "$PG_CONTAINER" ]; then
            COUNT=$(podman exec -t "$PG_CONTAINER" psql -U postgres -d sim_kinerja -c "SELECT COUNT(*) FROM employees;" 2>&1 | grep -E "^\s*[0-9]+" | tail -1 | tr -d ' ')
            echo "Direct count from PostgreSQL: $COUNT employees"
        else
            echo "PostgreSQL container not found"
        fi
        
        # Method 3: Check API response
        echo ""
        echo "Method 3: Testing API endpoint..."
        curl -sf http://localhost:8000/api/v1/users?page=1&per_page=1 2>/dev/null | jq '.meta.total // "Could not parse"' || echo "API not responding"
        
    else
        echo "Backend container not running!"
        echo "Try: ./quick-restart-backend.sh"
    fi
else
    echo "Please ensure containers are running first:"
    echo "  podman-compose up -d"
fi

echo ""
echo "=============================================="
echo "🔧 IF ZERO EMPLOYEES FOUND - RUN SEEDER"
echo "=============================================="
echo ""
echo "To create 33 sample employees with ML features:"
echo ""
echo "  Step 1: Ensure containers are running"
echo "  Running: $(podman ps --format '{{.Names}}' 2>/dev/null | grep -c simkap)"
echo ""
echo "  Step 2: Run seeder"
echo "  ./run-seed-employees.sh"
echo ""
echo "  Step 3: Verify"
echo "  podman exec simkap_backend php artisan tinker --execute=\"echo DB::table('employees')->count();\""
echo ""
echo "Expected output: 33"
echo ""

echo "=============================================="
echo "🐛 DEBUGGING TIPS"
echo "=============================================="
echo ""
echo "If employee count is 33 but Frontend shows 0:"
echo ""
echo "1. Clear browser cache:"
echo "   Ctrl+Shift+R (hard refresh)"
echo ""
echo "2. Check browser console:"
echo "   F12 → Console tab → Look for errors"
echo ""
echo "3. Test API directly:"
echo "   http://localhost:8000/api/v1/users?page=1&per_page=1"
echo "   Should return JSON with 'total': 33"
echo ""
echo "4. Check CORS settings:"
echo "   Backend: backend/config/cors.php"
echo "   Should include localhost:3000"
echo ""
echo "5. Restart frontend container:"
echo "   podman-compose restart frontend"
echo ""
echo "6. Check API client configuration:"
echo "   frontend/lib/api.ts should have baseURL pointing to localhost:8000"
echo ""

echo "=============================================="
echo "✅ COMPLETENESS CHECKLIST"
echo "=============================================="
echo ""
echo "[ ] Containers running (check with: podman ps)"
echo "[ ] Backend healthy (check with: curl http://localhost:8000/api/v1/health)"
echo "[ ] Database has employees (expecting 33+ records)"
echo "[ ] API responds correctly (GET /api/v1/users)"
echo "[ ] Frontend can fetch data (check Network tab)"
echo "[ ] No console errors (F12 → Console)"
echo ""

echo "Run './run-seed-employees.sh' if employee count is 0!"
