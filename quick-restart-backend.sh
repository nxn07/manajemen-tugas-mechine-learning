#!/bin/bash

echo "=============================================="
echo "🚀 QUICK RESTART - OPTIMIZED BACKEND"
echo "=============================================="
echo ""

# Check if podman is available
if ! command -v podman &> /dev/null; then
    echo "❌ Error: Podman not found!"
    exit 1
fi

# Stop only backend, keep other services
echo "🛑 Stopping backend only..."
podman stop simkap_backend
podman rm simkap_backend || true

# Clear Laravel cache from inside container before removal
echo "🧹 Clearing application cache..."
podman exec -t simkap_backend php artisan config:clear 2>/dev/null || true
podman exec -t simkap_backend php artisan route:clear 2>/dev/null || true
podman exec -t simkap_backend php artisan cache:clear 2>/dev/null || true

# Rebuild just backend (fast rebuild with layer caching)
echo "🔨 Rebuilding backend with optimized config..."
cd backend
podman-compose build --no-cache backend 2>&1 | grep -E "(Step|Successfully)" || true
cd ..

# Start fresh with new config
echo "🚀 Starting backend..."
podman-compose up -d backend

# Wait for health check (faster timeout)
echo "⏳ Waiting for backend to become healthy..."
for i in {1..6}; do
    sleep 5
    
    # Check if container is running AND responding
    if podman exec -t simkap_backend curl -sf http://localhost:8000/api/v1/health > /dev/null 2>&1; then
        echo "✅ Backend is HEALTHY! (${i} attempts)"
        
        echo ""
        echo "📊 Checking database connection..."
        DB_STATUS=$(podman exec -t simkap_backend php artisan db:connection --force 2>&1 | grep -c "Connected")
        if [ "$DB_STATUS" -gt 0 ]; then
            echo "   ✅ Database connected"
        else
            echo "   ⚠️ Database connection issue detected"
        fi
        
        echo ""
        echo "📊 Checking employees count..."
        EMP_COUNT=$(podman exec -t simkap_backend php artisan tinker --execute="echo DB::table('employees')->count();" 2>/dev/null | tail -1 | tr -d '[]')
        echo "   Found $EMP_COUNT employees"
        
        echo ""
        echo "=============================================="
        echo "✨ BACKEND READY!"
        echo "=============================================="
        echo ""
        echo "Test your app:"
        echo "• Users page: http://localhost:3000/users"
        echo "• KPI page: http://localhost:3000/kpis"
        echo "• ML Clustering: http://localhost:3000/ml-clustering"
        echo ""
        
        # Show last few log lines
        echo "Last backend log entries:"
        podman logs simkap_backend --tail 10
        
        exit 0
    fi
    
    echo "   Attempt $i/6 - Backend still starting..."
done

echo ""
echo "❌ Backend failed to become healthy after 30 seconds"
echo "Checking logs..."
podman logs simkap_backend --tail 50

exit 1
