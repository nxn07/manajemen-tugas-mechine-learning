# 🚀 ML Pipeline Execution Plan - SIM Kinerja K-Means Clustering

## Context

Execute complete ML feature extraction and K-Means clustering pipeline for 26 existing employees in PT Central Saga Mandala SIM Kinerja system. The backend controllers, services, models, and frontend UI are fully implemented but the pipeline has never been executed (0 feature records, 0 clustering results). This plan documents the exact steps to run both operations via API calls and verify results through the UI.

---

## Approach

### Phase 1: Feature Extraction (Run Once Per Period)

**Step 1.1: Extract Features from Existing Data**

- **Target:** `POST /api/v1/ml/extract-features` endpoint in `MlClusteringController`
- **Request Body:** 
  ```json
  {
    "period": "2026-09"
  }
  ```
- **Source Data:** Calculate 8 features per employee from existing tables:
  1. Attendance % → from `attendance_logs` table
  2. Tasks Completed % → from `task_submissions` table  
  3. On Time % → from `task_submissions` table
  4. Quality Score → AVG from `performance_evaluations`
  5. Discipline Score → derived from task reviews
  6. Active Tasks Count → from `tasks` table (status: assigned/in_progress)
  7. Late Tasks Count → from `tasks` table (completed with late submission)
  8. Avg Resolution Days → from task timestamps
- **Service Path:** `FeatureExtractionService.php::bulkExtractFeatures()`
- **Storage:** Insert into `ml_employee_feature_data` table for period `2026-09`
- **Expected Output:** 26 records inserted (one per employee), success response with elapsed time
- **Dependency:** Requires PostgreSQL connection, 26 employees exist (verified ✓)

**Step 1.2: Verify Feature Extraction Results**

- Check PostgreSQL:
  ```sql
  SELECT COUNT(*) FROM ml_employee_feature_data WHERE evaluation_period = '2026-09';
  ```
- Expected: 26 records
- Verify data completeness: check NULL values < 10%
- If failure: check container logs for SQL errors or permission issues

---

### Phase 2: K-Means Clustering Execution

**Step 2.1: Prepare Data for Clustering**

- **Target:** Internal service call within `MLProcessingService.php::prepareDataForClustering()`
- **Input:** Load all 26 employee features from `ml_employee_feature_data` where `evaluation_period = '2026-09'`
- **Process:** Build feature matrix (26 rows × 8 columns) + labels array
- **Output:** JSON file at `storage/app/ml_input_2026-09.json`
- **Validation:** Ensure minimum 5 employees (will have 26 ✓)

**Step 2.2: Run K-Means Algorithm via Python**

- **Target:** `POST /api/v1/ml/run-clustering` endpoint in `MlClusteringController`
- **Request Body:**
  ```json
  {
    "period": "2026-09",
    "n_clusters": 3
  }
  ```
- **Execution Flow:**
  1. `MLProcessingService::runKMeans()` reads prepared JSON file
  2. Calls Python script via `Process::run()` command
  3. Python script: `/app/backend/python/ml_processor.py` (inside `simkap_ml_python` container)
  4. Algorithm: scikit-learn KMeans(n_clusters=3, random_state=42)
  5. Returns centroids, cluster assignments, silhouette score
- **Storage:**
  - `ml_clustering_results`: Store centroid matrix + silhouette score
  - `ml_employee_clusters`: Store employee_id → cluster mapping for each of 26 employees
- **Timeout:** 60 seconds configured in API client
- **Expected Output:** Success with silhouette_score ≥ 0.3 (acceptable), 3 clusters generated

**Step 2.3: Verify Clustering Results**

- Query database:
  ```sql
  SELECT * FROM ml_clustering_results ORDER BY id DESC LIMIT 1;
  SELECT COUNT(*) FROM ml_employee_clusters WHERE clustering_result_id = (SELECT MAX(id) FROM ml_clustering_results);
  ```
- Expected clustering results record with:
  - silhouette_score: between 0.2-0.7 (acceptable range)
  - n_clusters: 3
  - centroids: 3×8 matrix
- Expected cluster assignments: 26 records (one per employee)
- Check distribution balance: each cluster should have ~8-9 employees

---

### Phase 3: Frontend UI Verification

**Step 3.1: Access ML Clustering Dashboard**

- **URL:** `http://localhost:3000/dashboard/ml-clustering`
- **Prerequisites:** Browser access, valid session/login
- **Expected UI Elements:**
  1. Header showing current period dropdown (should show 2026-09 selected)
  2. "Extract Features" button (greyed out after extraction complete)
  3. "Run Clustering" button (active if features extracted)
  4. "Cluster Results Display Panel" with:
     - Silhouette score indicator with quality interpretation
     - Cluster distribution pie/bar chart
     - 3 separate tables listing employees in each cluster
     - Centroid value visualization
     - Download/export buttons

**Step 3.2: Validate UI Data Display**

- Confirm cluster count display shows "3 clusters"
- Confirm employee count shows "26 employees"
- Click each cluster table to verify:
  - Cluster 0: ~8-9 employees with names and positions
  - Cluster 1: ~8-9 employees  
  - Cluster 2: ~8-9 employees
- Total across all clusters must equal 26
- Verify silhouette score matches database value (within ±0.01 tolerance)

**Step 3.3: Interpret Cluster Characteristics**

- Review automated interpretation text shown for each cluster:
  - High performer cluster (high scores on attendance, tasks, quality)
  - Medium performer cluster (moderate scores)
  - Low performer cluster (lower scores, needs improvement)
- Validate interpretations match actual data patterns

---

## Critical Files & Anchors

| File | Symbol/Region | Reason |
|------|---------------|--------|
| `backend/app/Http/Controllers/Api/V1/MlClusteringController.php` | Lines 36-101 (`extractFeatures` method) | Entry point for feature extraction API call |
| `backend/app/Services/Ml/FeatureExtractionService.php` | Lines 1-120 | Contains calculation logic for all 8 features from existing tables |
| `backend/app/Services/Ml/MLProcessingService.php` | Lines 79-157 (`runKMeans` method) | Orchestrates Python K-Means execution |
| `backend/python/ml_processor.py` | Entire file (12,340 bytes) | Python K-Means algorithm implementation using scikit-learn |
| `frontend/app/(dashboard)/ml-clustering/page.tsx` | Lines 1-200 | UI component handling all ML interaction and result display |

---

## Verification

### Prerequisites Checklist

1. ✅ All Podman containers running: `podman ps` shows 6 healthy containers
2. ✅ Database accessible: PostgreSQL running with `sim_kinerja` database
3. ✅ 26 employees exist: Verified via database query
4. ✅ Backend API ready: Port 8000 listening
5. ✅ Frontend ready: Port 3000 listening
6. ⏳ ML Python environment: scikit-learn installed in container

### Step-by-Step Verification Commands

**After Step 1.1 (Feature Extraction):**
```bash
# Check feature records created
podman exec -i simkap_postgres psql -U postgres -d sim_kinerja -c \
  "SELECT COUNT(*) as total_features FROM ml_employee_feature_data WHERE evaluation_period='2026-09';"

# Sample first few records
podman exec -i simkap_postgres psql -U postgres -d sim_kinerja -c \
  "SELECT employee_id, attendance_percentage, tasks_completed_percentage FROM ml_employee_feature_data LIMIT 5;"
```
**Expected:** Output shows `total_features = 26`, sample data populated

**After Step 2.2 (Clustering):**
```bash
# Check clustering results
podman exec -i simkap_postgres psql -U postgres -d sim_kinerja -c \
  "SELECT evaluation_period, n_clusters, silhouette_score FROM ml_clustering_results ORDER BY id DESC LIMIT 1;"

# Check cluster assignments
podman exec -i simkap_postgres psql -U postgres -d sim_kinerja -c \
  "SELECT cluster_assignment, COUNT(*) as count FROM ml_employee_clusters GROUP BY cluster_assignment ORDER BY cluster_assignment;"

# Verify all employees assigned
podman exec -i simkap_postgres psql -U postgres -d sim_kinerja -c \
  "SELECT COUNT(*) as total_assigned FROM ml_employee_clusters;"
```
**Expected:** 
- silhouette_score between 0.2-0.7
- Cluster distribution: {0: 8-9, 1: 8-9, 2: 8-9}
- total_assigned = 26

### Manual UI Verification (Browser)

1. Open browser to `http://localhost:3000`
2. Navigate to `/dashboard/ml-clustering`
3. Select period dropdown: choose `2026-09`
4. Click "Extract Features" button:
   - **Success Indicator:** Green toast notification "✅ Fitur berhasil diekstrak dalam Xms!"
   - Button may grey out or show completion state
5. Click "Run Clustering" button:
   - **Success Indicator:** Green toast "✨ K-means clustering selesai dalam Xms!"
   - Results panel appears with data
6. Validate displayed metrics:
   - Cluster count: **3**
   - Employee count: **26**
   - Silhouette score: matches DB query value
7. Verify cluster tables show employee lists with no duplicates
8. Check cluster interpretations make sense based on data patterns

### End-to-End Test Scenario

**Input:** Execute extraction for period `2026-09` with 26 existing employees

**Expected Observable Output:**
1. **Database State After Extraction:**
   - `ml_employee_feature_data.count = 26`
   - Each record has non-NULL values for most features (>90% non-null)
   
2. **Database State After Clustering:**
   - `ml_clustering_results.count >= 1` (newest record has period 2026-09)
   - `silhouette_score BETWEEN 0.2 AND 0.7` (indicating reasonable clustering)
   - `ml_employee_clusters.count = 26` (all employees assigned)
   - Cluster distribution balanced (no cluster has <5 or >12 employees)
   
3. **API Response Format:**
   - Feature extraction: `{ "success": true, "message": "...", "elapsed_ms": <number>, "employees_processed": 26 }`
   - Clustering: `{ "success": true, "period": "2026-09", "n_clusters": 3, "silhouette_score": 0.XX, "elapsed_ms": <number> }`
   
4. **UI Display:**
   - All three buttons functional (Extract, Run, Export)
   - Results panel populates without error messages
   - No console errors visible in browser DevTools
   - Cluster charts render correctly (not broken SVG/Canvas)

---

## Assumptions & Contingencies

### User-Override Decisions

1. **Evaluation Period:** Using `2026-09` (September 2026) as default
   - Can be changed to any YYYY-MM format string if needed
   - Current date context suggests this is appropriate
   
2. **Number of Clusters:** Using `n_clusters = 3` as recommended by elbow method/silhouette analysis in documentation
   - Alternative: 2-5 clusters possible but 3 optimal for 26 employees
   - HR preference may dictate different number

### Failure Contingencies

**If Feature Extraction Fails:**
- **Root cause 1:** Missing attendance/task/evaluation data for some employees
  - **Fallback:** Proceed with partial data (records will have NULLs), system tolerates it
  - **Action:** Check which employees missing data, add dummy records if needed
  
- **Root cause 2:** Database connection timeout
  - **Fallback:** Retry extraction with longer timeout (already set to 60s in api.ts)
  - **Action:** Check PostgreSQL container health: `podman logs simkap_postgres`

**If Clustering Fails:**
- **Root cause 1:** Python process timeout or crash
  - **Fallback:** Reduce employees sampled (first 10 only), retry
  - **Action:** Check ML Python container logs: `podman logs simkap_ml_python`
  
- **Root cause 2:** Insufficient variance in data (all employees identical)
  - **Fallback:** Use synthetic variance injection for demo purposes
  - **Action:** Verify employee performance data diversity in source tables

**If Frontend UI Doesn't Update:**
- **Root cause 1:** Axios request failed silently
  - **Fallback:** Direct API call via curl/postman then reload page
  - **Action:** Check browser Network tab for 401/403 auth errors
  
- **Root cause 2:** Session expired
  - **Fallback:** Re-login to frontend, retry UI navigation
  - **Action:** Clear localStorage, re-authenticate

### Performance Expectations

- Feature extraction: Should complete in 5-15 seconds for 26 employees
- Clustering execution: Should complete in 10-30 seconds (Python process startup + algorithm)
- Total pipeline time: < 60 seconds end-to-end

### Data Persistence Guarantee

- All results stored persistently in PostgreSQL (no volatile storage)
- Clustering results survive container restarts
- Historical runs archived by period parameter (can compare month-over-month)
