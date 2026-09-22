# K-Means Clustering - Quick Reference

## 🚀 Quick Start

### 1. Setup Python Dependencies
```bash
pip3 install scikit-learn numpy
```

### 2. Run Migration
```bash
php artisan migrate
```

### 3. Extract Features (Monthly)
```bash
curl -X POST http://localhost:8000/api/v1/ml/extract-features \
  -H "Authorization: Bearer TOKEN" \
  -d '{"period": "2026-01"}'
```

### 4. Run Clustering
```bash
curl -X POST http://localhost:8000/api/v1/ml/run-clustering \
  -H "Authorization: Bearer TOKEN" \
  -d '{"period": "2026-01", "n_clusters": 3}'
```

### 5. Get Results
```bash
curl http://localhost:8000/api/v1/ml/clusters/2026-01 \
  -H "Authorization: Bearer TOKEN"
```

### Or Use Artisan Command
```bash
php artisan ml:cluster --period=2026-01 --clusters=3
```

---

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/v1/ml/extract-features` | Calculate employee features |
| POST | `/api/v1/ml/run-clustering` | Execute K-Means algorithm |
| GET | `/api/v1/ml/clusters/{period}` | Retrieve results |

**Auth Required:** Yes (Bearer token)

---

## Database Tables

```sql
-- Feature storage
ml_employee_feature_data
├── employee_id
├── evaluation_period
├── attendance_percentage (nullable)
├── tasks_completed_percentage
├── on_time_percentage
├── quality_score
├── discipline_score
├── active_tasks_count
├── late_tasks_count
└── avg_resolution_days

-- Clustering metadata
ml_clustering_results
├── evaluation_period
├── n_clusters
├── silhouette_score
├── centroids (JSON)
├── feature_names (JSON)
└── processed_at

-- Employee assignments
ml_employee_clusters
├── employee_id
├── clustering_result_id
├── cluster_assignment (0,1,2)
└── distance_to_centroid
```

---

## Feature Matrix

| Feature | Description | Source Table |
|---------|-------------|--------------|
| attendance_percentage | % of days present | *Pending* |
| tasks_completed_percentage | Task completion rate | `tasks` |
| on_time_percentage | Tasks before deadline | `tasks` |
| quality_score | AVG evaluation score | `performance_evaluations` |
| discipline_score | Revision penalty score | `task_submissions` |
| active_tasks_count | Pending + In Progress | `tasks` |
| late_tasks_count | Completed after deadline | `tasks` |
| avg_resolution_days | Days overdue average | `task_submissions` |

---

## Cluster Interpretation

Clusters are auto-labeled based on centroid analysis:
- **High performers:** ≥4 positive indicators > 50
- **Moderate performers:** 2-3 positive indicators > 50  
- **Developing performers:** < 2 positive indicators > 50

**Positive Indicators (higher is better):**
1. Tasks completed percentage
2. On-time percentage
3. Quality score
4. Discipline score

---

## Example Workflow

### Monthly Process (Cron Job)
```bash
# First Sunday of each month at 2 AM
0 2 1-7 * * cd /path/to/project/backend && php artisan ml:cluster --period=$(date +%Y-%m)
```

### One-off Execution
```bash
php artisan tinker
>>> $result = App\Services\Ml\MLProcessingService::runKMeans('2026-01', 3);
>>> print_r($result->centroids);
```

---

## Testing

### Unit Test Example
```php
// tests/Feature/MlClusteringTest.php

public function test_cluster_extraction()
{
    $response = $this->actingAs($adminUser)
        ->postJson('/api/v1/ml/run-clustering', [
            'period' => '2026-01',
            'n_clusters' => 3
        ]);

    $response->assertStatus(200)
        ->assertJsonStructure([
            'success',
            'data.silhouette_score',
            'data.period'
        ]);
}
```

---

## Validation Rules

- Minimum 5 employees required
- Silhouette score should be ≥ 0.3 (acceptable), ≥ 0.5 (good)
- All employees must be assigned to exactly one cluster
- Processing time typically < 5 seconds for 30 employees

---

## Common Issues

| Issue | Solution |
|-------|----------|
| "Python not found" | Install Python 3.8+ and scikit-learn |
| "Minimum employees error" | Add more employees or combine historical months |
| "Silhouette < 0.3" | Try different cluster count or collect more data |
| "Migration failed" | Check database credentials and user permissions |

---

**Last Updated:** September 22, 2025  
**Version:** 1.0
