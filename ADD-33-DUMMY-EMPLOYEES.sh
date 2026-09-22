#!/bin/bash
echo "=============================================="
echo "👥 ADDING 33 DUMMY EMPLOYEES TO DATABASE"
echo "=============================================="
echo ""

cd /mnt/c/Users/Microsoft/Documents/Ngoding/KP

# Check containers
podman-compose up -d >/dev/null 2>&1
sleep 5

# Run seeder
echo "Running Employee Seeder..."
podman exec simkap_backend php artisan db:seed --class=EmployeesWithMlFeaturesSeeder

# Wait for seeding
sleep 5

# Show final count
echo ""
echo "Verifying employee count..."
FINAL_COUNT=$(podman exec simkap_backend php artisan tinker --execute="echo DB::table('employees')->count();" 2>&1 | tail -1 | tr -d ' ')

echo "✅ Total Employees Now: $FINAL_COUNT"
echo ""
echo "Test Frontend:"
echo "http://localhost:3000/users"
echo "(Clear cache: Ctrl+Shift+R)"
echo "=============================================="
