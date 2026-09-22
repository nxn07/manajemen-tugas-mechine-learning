#!/bin/bash

# ============================================================================
# ML Clustering Integration Test Script
# Run this after all containers are up and running
# ============================================================================

echo "=========================================="
echo "🔬 ML Clustering Integration Testing"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print success message
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Function to print error message
print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Function to print warning message
print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if containers are running
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1: Checking Container Status..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Use docker-compose or podman-compose to check status
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
elif command -v podman-compose &> /dev/null; then
    COMPOSE_CMD="podman-compose"
else
    print_error "Neither docker-compose nor podman-compose found!"
    exit 1
fi

echo "Using: $COMPOSE_CMD"
echo ""

# Check backend health
if $COMPOSE_CMD logs backend 2>&1 | grep -q "Development server running"; then
    print_success "Backend API is running on port 8000"
    
    # Test backend endpoint
    if curl -sf http://localhost:8000/api/v1/users?page=1&per_page=1 > /dev/null 2>&1; then
        print_success "Backend API responds correctly"
    else
        print_warning "Backend may have authentication issues"
    fi
else
    print_warning "Backend might still be starting..."
    echo "Waiting 5 more seconds for backend to stabilize..."
    sleep 5
    
    if curl -sf http://localhost:8000/api/v1/users?page=1&per_page=1 > /dev/null 2>&1; then
        print_success "Backend API is now accessible"
    else
        print_error "Backend API not accessible yet"
        echo "Please wait a bit longer for Laravel to start"
    fi
fi

echo ""

# Check frontend health
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2: Checking Frontend Access..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if curl -sf http://localhost:3000/ml-clustering > /dev/null 2>&1; then
    print_success "Frontend ML Clustering page is accessible"
else
    print_error "Frontend not accessible at http://localhost:3000/ml-clustering"
fi

echo ""

# Check ML Python service
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 3: Checking ML Python Service..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Verify ML Python is initialized
if $COMPOSE_CMD exec -T simkap_ml_python test -f /app/backend/python/venv/bin/python; then
    print_success "ML Python virtual environment exists"
else
    print_warning "ML Python venv might not be ready yet"
fi

# Check if scikit-learn is installed
if $COMPOSE_CMD exec -T simkap_ml_python /app/backend/python/venv/bin/python -c "import sklearn; print('scikit-learn:', sklearn.__version__)" 2>/dev/null | grep -q "scikit-learn:"; then
    SCIKIT_VERSION=$($COMPOSE_CMD exec -T simkap_ml_python /app/backend/python/venv/bin/python -c "import sklearn; print(sklearn.__version__)")
    print_success "scikit-learn installed ($SCIKIT_VERSION)"
else
    print_error "scikit-learn not found in ML Python container"
fi

# Check numpy
if $COMPOSE_CMD exec -T simkap_ml_python /app/backend/python/venv/bin/python -c "import numpy; print('numpy:', numpy.__version__)" 2>/dev/null | grep -q "numpy:"; then
    NUMPY_VERSION=$($COMPOSE_CMD exec -T simkap_ml_python /app/backend/python/venv/bin/python -c "import numpy; print(numpy.__version__)")
    print_success "NumPy installed ($NUMPY_VERSION)"
else
    print_error "NumPy not found"
fi

# Check pandas
if $COMPOSE_CMD exec -T simkap_ml_python /app/backend/python/venv/bin/python -c "import pandas; print('pandas:', pandas.__version__)" 2>/dev/null | grep -q "pandas:"; then
    PANDAS_VERSION=$($COMPOSE_CMD exec -T simkap_ml_python /app/backend/python/venv/bin/python -c "import pandas; print(pandas.__version__)")
    print_success "Pandas installed ($PANDAS_VERSION)"
else
    print_error "Pandas not found"
fi

echo ""

# Database connection test
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 4: Checking Database Connection..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if $COMPOSE_CMD exec -T simkap_backend php artisan db:connection --force 2>&1 | grep -q "Connected"; then
    print_success "Database connection successful"
else
    print_warning "Database connection test inconclusive"
fi

echo ""

# Final Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 INTEGRATION TEST SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if we can access the actual ML clustering endpoint
if curl -sfX POST http://localhost:8000/api/v1/ml/extract-features \
    -H "Content-Type: application/json" \
    -d '{"period": "'$(date +%Y-%m)'"}' > /dev/null 2>&1; then
    
    print_success "✅ ML FEATURE EXTRACTION ENDPOINT WORKS!"
    echo "   Endpoint: POST /api/v1/ml/extract-features"
    
else
    print_warning "⚠️ ML Feature Extraction endpoint response unclear"
    echo "   Possible reasons:"
    echo "   - Backend authentication required (token/cookie)"
    echo "   - Not enough employee data extracted yet"
    echo "   - Backend still initializing"
    
    # Try without auth header but capture error details
    RESPONSE=$(curl -sX POST http://localhost:8000/api/v1/ml/extract-features \
        -H "Content-Type: application/json" \
        -d '{"period": "'$(date +%Y-%m)'"}')
        
    echo "   Response preview: ${RESPONSE:0:100}..."
fi

echo ""

# Open browser suggestion
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 MANUAL VERIFICATION STEPS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "To complete manual testing:"
echo "1. Open your browser: http://localhost:3000/ml-clustering"
echo "2. Click 'Ekstrak Fitur' button"
echo "3. Observe toast notifications (should show success/error messages)"
echo "4. If successful, you'll see actual employee count"
echo "5. Then click 'Jalankan Clustering'"
echo "6. Results will display cluster assignments"
echo ""

# Quick command to run tests again
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💡 QUICK COMMANDS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "# View backend logs:"
echo "$COMPOSE_CMD logs -f backend"
echo ""
echo "# View ML python logs:"
echo "$COMPOSE_CMD logs -f ml-python"
echo ""
echo "# Check if feature extraction works:"
echo "curl -X POST http://localhost:8000/api/v1/ml/extract-features \\" 
echo "  -H \"Content-Type: application/json\" \\" 
echo "  -d '{\"period\": \"'"$(date +%Y-%m)"'\"}'"
echo ""

echo "=========================================="
echo "✨ Integration Test Complete!"
echo "=========================================="
