#!/bin/bash

echo "=========================================="
echo "🌱 SEEDING EMPLOYEE DATA WITH ML FEATURES"
echo "=========================================="
echo ""

# Check if podman-compose is available
if ! command -v podman-compose &> /dev/null; then
    echo "❌ Error: podman-compose not found!"
    echo "Please install podman-compose first."
    exit 1
fi

# Verify containers are running
echo "Checking container status..."
podman-compose ps

BACKEND_RUNNING=$(podman-compose ps | grep simkap_backend | grep -q "Up" && echo "yes")

if [ "$BACKEND_RUNNING" != "yes" ]; then
    echo ""
    echo "⚠️ Backend container is not running!"
    echo "Starting backend container..."
    podman-compose start backend
    
    # Wait for backend to be ready
    echo "Waiting for backend to start (10 seconds)..."
    sleep 10
fi

echo ""
echo "Running seeder..."
echo ""

# Run the seeder inside the backend container
podman exec -it simkap_backend php artisan db:seed --class=EmployeesWithMlFeaturesSeeder

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Seeding completed successfully!"
    echo ""
    echo "=========================================="
    echo "📊 VERIFICATION STEPS:"
    echo "=========================================="
    echo ""
    echo "1. Open browser and go to:"
    echo "   http://localhost:3000/users"
    echo ""
    echo "2. Should now show:"
    echo "   • Total Users: 33"
    echo "   • All employees with their positions"
    echo ""
    echo "3. Then go to ML Clustering page:"
    echo "   http://localhost:3000/ml-clustering"
    echo ""
    echo "4. Should now see:"
    echo "   • Total Karyawan: 33 (not 0!)"
    echo "   • Can extract features immediately"
    echo "   • Can run K-Means clustering"
    echo ""
    echo "5. If Total Karyawan still shows 0:"
    echo "   • Hard refresh browser (Ctrl+Shift+R)"
    echo "   • Clear browser cache"
    echo "   • Restart frontend container:"
    echo "     podman-compose restart frontend"
    echo ""
    echo "=========================================="
else
    echo ""
    echo "❌ Seeder failed! Please check errors above."
    exit 1
fi
