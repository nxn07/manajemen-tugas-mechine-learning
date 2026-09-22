#!/bin/bash

echo "=============================================="
echo "🔧 FIXING: Creating ML Tables & Seeding Data"
echo "=============================================="
echo ""

cd /mnt/c/Users/Microsoft/Documents/Ngoding/KP

echo "Step 1: Running Migrations..."
podman exec simkap_backend php artisan migrate --force 2>&1 | grep -E "(Migrating|Rolled back|Migrated)" || echo "Migrations completed (no errors found)"

echo ""
echo "Step 2: Waiting for database ready..."
sleep 3

echo ""
echo "Step 3: Verifying tables created..."
if podman exec simkap_backend php artisan tinker --execute="
    try {
        \$tables = DB::connection()->getSchemaBuilder()->listTables();
        echo 'Created tables:';
        foreach (\$tables as \$table) {
            if (strpos(\$table->name, 'ml_') !== false || 
                strpos(\$table->name, 'employee') !== false ||
                strpos(\$table->name, 'task') !== false) {
                echo ' ✓ ' . \$table->name;
            }
        }
    } catch(Exception \$e) {
        echo 'Error: ' . \$e->getMessage();
    }
" 2>&1 | grep -v "INFO\|Executing"; then
    echo ""
    echo "✓ Database structure looks good!"
else
    echo "⚠️ Check migration output above for errors"
fi

echo ""
echo "Step 4: Running Employee Seeder..."
SEED_OUTPUT=$(podman exec simkap_backend php artisan db:seed \
    --class=EmployeesWithMlFeaturesSeeder \
    --force 2>&1)

# Check seeding result
if echo "$SEED_OUTPUT" | grep -qi "completed\|created employee #"; then
    echo "✅ SEEDER SUCCESSFUL!"
    echo ""
    
    # Show final count
    FINAL_COUNT=$(podman exec simkap_backend php artisan tinker \
        --execute="echo DB::table('employees')->count();" \
        2>&1 | tail -1 | tr -d ' ')
    
    echo "📊 Total Employees Now: $FINAL_COUNT"
    
    # Verify ML features exist
    ML_FEATURE_COUNT=$(podman exec simkap_backend php artisan tinker \
        --execute="echo DB::table('ml_employee_feature_data')->count();" \
        2>&1 | tail -1 | tr -d ' ')
    
    echo "🔬 ML Features Ready: $ML_FEATURE_COUNT records"
    
    echo ""
    echo "================================================"
    echo "✨ ALL DONE! Test Frontend Now:"
    echo "================================================"
    echo ""
    echo "URL: http://localhost:3000/users"
    echo "Expected: Total 33 Users ✅"
    echo ""
    echo "Then test ML Clustering:"
    echo "URL: http://localhost:3000/ml-clustering"
    echo "Expected: Can extract features immediately! 🎯"
    echo ""
    echo "Clear browser cache first: Ctrl+Shift+R"
    echo ""
else
    echo "⚠️ Seeding had issues"
    echo ""
    echo "Full output:"
    echo "$SEED_OUTPUT"
    echo ""
    echo "Manual troubleshooting:"
    echo "1. Run migrations again:"
    echo "   podman exec simkap_backend php artisan migrate:fresh --seed"
    echo ""
    echo "2. Check error logs:"
    echo "   podman logs simkap_backend --tail 50"
fi

echo ""
echo "=============================================="
echo "FINISHED!"
echo "=============================================="
