#!/bin/bash

echo "=============================================="
echo "🔄 RESTART ALL CONTAINERS - OPTIMIZED"
echo "=============================================="
echo ""

# Check which command works
if command -v podman-compose &> /dev/null; then
    CMD="podman-compose"
elif command -v docker-compose &> /dev/null; then
    CMD="docker-compose"
else
    echo "❌ Neither podman-compose nor docker-compose found!"
    echo "Trying alternative commands..."
    
    if command -v podman &> /dev/null; then
        CMD="podman"
        PODMAN_MODE=true
    else
        echo "❌ No container command available!"
        exit 1
    fi
fi

echo "Using: $CMD"
echo ""

# Step 1: Stop all containers
echo "Step 1: Stopping all containers..."
$CMD down

echo ""
echo "Step 2: Removing old containers..."
$CMD rm -f simkap_* 2>/dev/null || true
docker rm -f simkap_* 2>/dev/null || true

echo ""
echo "Step 3: Cleaning up (optional)..."
read -p "Clean volumes? (y/n): " clean_volumes
if [ "$clean_volumes" = "y" ]; then
    $CMD down -v
fi

echo ""
echo "Step 4: Starting fresh containers..."
$CMD up -d

echo ""
echo "Step 5: Waiting for health checks (20 seconds)..."
sleep 20

echo ""
echo "Step 6: Re-applying caches..."
$CMD exec simkap_backend php artisan config:cache > /dev/null 2>&1
$CMD exec simkap_backend php artisan route:cache > /dev/null 2>&1
echo "✅ Caches applied!"

echo ""
echo "Step 7: Checking status..."
$CMD ps --format "{{.Names}} | {{.Status}}"

echo ""
echo "================================================"
echo "✅ RESTART COMPLETE!"
echo "================================================"
echo ""
echo "Your containers are now running fresh!"
echo ""
echo "Test URLs:"
echo "• Backend: http://localhost:8000/api/v1/health"
echo "• Frontend: http://localhost:3000/users"
echo ""
echo "If anything seems off, see troubleshooting below:"
echo ""
echo "Troubleshooting:"
echo "1. Check logs: $CMD logs -f simkap_backend"
echo "2. View containers: $CMD ps -a"
echo "3. Restart specific: $CMD restart backend"
echo ""
