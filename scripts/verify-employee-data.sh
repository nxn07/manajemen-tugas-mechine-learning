#!/bin/bash

echo "=============================================="
echo "🔍 VERIFIKASI DATA KARYAWAN - REAL CHECK"
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

echo "Using: $CONTAINER_CMD"
echo ""

# Step 1: Check containers running
echo "Step 1: Checking if backend container is running..."
BACKEND_EXISTS=$($CONTAINER_CMD ps --format "{{.Names}}" 2>/dev/null | grep -c simkap_backend)

if [ "$BACKEND_EXISTS" -eq 0 ]; then
    echo "⚠️ Backend container NOT RUNNING!"
    echo ""
    echo "Starting containers..."
    cd "/mnt/c/Users/Microsoft/Documents/Ngoding/KP" && podman-compose up -d 2>/dev/null
    sleep 10
    
    # Verify started
    BACKEND_EXISTS=$($CONTAINER_CMD ps --format "{{.Names}}" 2>/dev/null | grep -c simkap_backend)
    if [ "$BACKEND_EXISTS" -eq 0 ]; then
        echo "❌ Failed to start backend container!"
        exit 1
    fi
fi

echo "✅ Backend container running"
echo ""

# Step 2: Get actual employee count from database
echo "Step 2: Getting EMPLOYEE COUNT from Database..."
echo ""

# Method 1: Using Laravel Tinker (most reliable)
echo "   Running: php artisan tinker --execute=\"DB::table('employees')->count();\""
EMPLOYEE_COUNT=$($CONTAINER_CMD exec -t simkap_backend php artisan tinker --execute="echo DB::table('employees')->count();" 2>&1 | grep -E "^\s*[0-9]+" | tail -1 | tr -d ' \n')

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 ACTUAL EMPLOYEE COUNT IN DATABASE:"
echo ""
echo "   Total Employees: ${EMPLOYEE_COUNT:-0}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# If count is 0, explain clearly
if [ "$EMPLOYEE_COUNT" -eq 0 ] || [ -z "$EMPLOYEE_COUNT" ]; then
    echo "⚠️ WARNING: NO EMPLOYEES FOUND IN DATABASE!"
    echo ""
    echo "This means you HAVE NEVER RUN the seeder script."
    echo ""
    echo "To create 33 sample employees with ML features:"
    echo ""
    echo "   ./run-seed-employees.sh"
    echo ""
    echo "Expected output: 33"
    echo ""
    
    # Show detailed breakdown
    echo "Database Table Status:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Check table exists
    TABLE_EXISTS=$($CONTAINER_CMD exec -t simkap_backend php artisan tinker --execute="
        \$exists = DB::connection()->getSchemaBuilder()->hasTable('employees');
        echo \$exists ? 'TABLE EXISTS' : 'TABLE DOES NOT EXIST';
    " 2>&1 | grep -oE "(EXISTS|NOT)" | head -1)
    
    if [ "$TABLE_EXISTS" = "EXISTS" ]; then
        echo "✓ Table 'employees' EXISTS in database"
        
        # Show some columns
        COLUMNS=$($CONTAINER_CMD exec -t simkap_backend php artisan tinker --execute="
            \$columns = DB::connection()->getSchemaBuilder()->getColumnListing('employees');
            print_r(\$columns);
        " 2>&1 | grep -E "\[0\]|\[1\]|\[2\]|\[3\]|\[4\]" | head -5)
        
        echo "Columns found: $(echo "$COLUMNS" | grep -oE "[a-z_]+" | wc -w)"
        echo ""
        echo "Sample SQL Query:"
        echo "SELECT id, name, email, position, division_id FROM employees LIMIT 3;"
        echo ""
        
        # Try to fetch sample data
        echo "Attempting to fetch sample data..."
        SAMPLE_DATA=$($CONTAINER_CMD exec -t simkap_backend php artisan tinker --execute="
            \$data = DB::table('employees')->limit(3)->get();
            foreach (\$data as \$emp) {
                echo \"ID: {\$emp->id}, Name: {\$emp->name}, Email: {\$emp->email}\";
            }
        " 2>&1)
        
        if [ ! -z "$SAMPLE_DATA" ] && ! echo "$SAMPLE_DATA" | grep -q "Exception"; then
            echo "$SAMPLE_DATA"
        else
            echo "No employee records found"
        fi
        
    else
        echo "✗ Table 'employees' DOES NOT EXIST yet"
        echo "Run migrations first!"
        echo ""
        echo "Command: podman exec -t simkap_backend php artisan migrate"
    fi
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "TO FIX THIS ISSUE:"
    echo ""
    echo "Run this command to create 33 employees:"
    echo "   ./run-seed-employees.sh"
    echo ""
    echo "Or manually:"
    echo "   podman exec -it simkap_backend php artisan db:seed --class=EmployeesWithMlFeaturesSeeder"
    echo ""
    echo "After seeding, employee count should be: 33"
    echo ""
    
else
    echo "✅ EMPLOYEES FOUND! Now checking details..."
    echo ""
    
    # Show distribution by division
    echo "👥 Employee Distribution by Division:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    $CONTAINER_CMD exec -t simkap_backend php artisan tinker --execute="
        \$distribution = DB::table('employees')
            ->join('divisions', 'employees.division_id', '=', 'divisions.id')
            ->select('divisions.name as division', DB::raw('COUNT(*) as count'))
            ->groupBy('divisions.name')
            ->orderBy('count', 'desc')
            ->get();
            
        foreach (\$distribution as \$item) {
            echo str_pad(''.\$item->division, 30) . ': ' . \$item->count . ' employees';
        }
    " 2>&1 | grep -E "^[A-Z].*" | while read line; do
        echo "   $line"
    done
    
    echo ""
    
    # Check performance data (ML features)
    echo "📊 Checking ML Feature Data for Each Employee:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    FEATURES_COUNT=$($CONTAINER_CMD exec -t simkap_backend php artisan tinker --execute="echo DB::table('ml_employee_feature_data')->count();" 2>&1 | grep -oE "^\s*[0-9]+" | tail -1 | tr -d ' ')
    
    echo "   Employees WITH ML Features: ${FEATURES_COUNT:-0}/$EMPLOYEE_COUNT"
    echo ""
    
    if [ "$FEATURES_COUNT" -lt "$EMPLOYEE_COUNT" ]; then
        MISSING=$((EMPLOYEE_COUNT - FEATURES_COUNT))
        echo "⚠️ WARNING: $MISSING employees don't have ML feature data!"
        echo "These employees cannot be used for clustering."
        echo ""
        echo "To extract ML features:"
        echo "   curl -X POST http://localhost:8000/api/v1/ml/extract-features \\"
        echo "     -H \"Content-Type: application/json\" \\"
        echo "     -d '{\"period\": \"'"$(date +%Y-%m)"'\"}'"
        echo ""
    else
        echo "✅ All employees have ML features ready!"
    fi
    
    echo ""
    
    # Show sample employee data structure
    echo "📋 Sample Employee Record Structure:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    $CONTAINER_CMD exec -t simkap_backend php artisan tinker --execute="
        \$sample = DB::table('employees')->first();
        if (\$sample) {
            echo \"Employee ID: {\$sample->id}\";
            echo \"Name: {\$sample->name}\";
            echo \"Email: {\$sample->email}\";
            echo \"Position: {\$sample->position}\";
            echo \"Division ID: {\$sample->division_id}\";
            echo \"Created At: {\$sample->created_at}\";
        }
    " 2>&1 | grep -E "^(Employee|Name|Email|Position|Division|Created)" | while read line; do
        echo "   $line"
    done
    
    echo ""
    
    # Verify API endpoint
    echo "🌐 Testing API Endpoint Response:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if command -v curl &> /dev/null; then
        API_TEST=$(curl -sf http://localhost:8000/api/v1/users?page=1&per_page=1 2>/dev/null)
        
        if [ -n "$API_TEST" ]; then
            API_TOTAL=$(echo "$API_TEST" | jq -r '.meta.total // 0' 2>/dev/null)
            echo "   ✅ API responding correctly!"
            echo "   From API endpoint: $API_TOTAL users"
            
            if [ "$API_TOTAL" -ne "$EMPLOYEE_COUNT" ]; then
                echo "   ⚠️ Mismatch: API shows $API_TOTAL but DB has $EMPLOYEE_COUNT"
            fi
        else
            echo "   ❌ API not responding (status code might be non-2xx)"
            echo "   Possible causes:"
            echo "   - Backend unhealthy"
            echo "   - Database connection failed"
            echo "   - Middleware blocking request"
        fi
    fi
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ SUMMARY:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Total Employees in Database: $EMPLOYEE_COUNT"
    echo "Employees with ML Features:  $FEATURES_COUNT"
    echo "Status: ${FEATURES_COUNT -eq $EMPLOYEE_COUNT && echo '✅ READY FOR CLUSTERING' || echo '⚠️ Need feature extraction'}"
    echo ""
    echo "Test Frontend:"
    echo "   http://localhost:3000/users"
    echo "   Should display $EMPLOYEE_COUNT employees"
    echo ""
    echo "Test ML Clustering:"
    echo "   http://localhost:3000/ml-clustering"
    echo "   'Total Karyawan' should show: $EMPLOYEE_COUNT"
    echo ""
fi

echo "=============================================="
echo ""
echo "VERIFICATION COMPLETE!"
echo ""
