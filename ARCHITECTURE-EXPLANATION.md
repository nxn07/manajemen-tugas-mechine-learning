# 🏗️ SIM-KAP ML Clustering Architecture

## Overview Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                            │
│                     Next.js (Port 3000)                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ User Mgmt UI │  │ KPI Criteria │  │ML Clustering │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│           │                │                │                    │
│           └────────────────┴────────────────┘                    │
│                           │                                      │
│              ┌────────────────────────┐                          │
│              │   API Client (axios)    │                          │
│              │   + Response Cache      │                          │
│              └────────────────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
                           │ HTTP/HTTPS (RESTful)
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND LAYER                               │
│                   Laravel PHP-FPM (Port 8000)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  Middleware Layer                         │   │
│  │  Auth • CORS • RequestTiming                              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           │                                       │
│           ┌───────────────┴───────────────┐                      │
│           ▼                               ▼                       │
│  ┌──────────────┐                 ┌──────────────┐                │
│  │Controllers   │                 │Services      │                │
│  │- UserController│               │- UserService  │                │
│  │- MlController │               │- FeatureExtrac-│                │
│  └──────────────┘                 │tionService   │                │
│           │                       └──────────────┘                │
│           │                           │                           │
│           │                       ┌───┴───┐                        │
│           │                       ▼       ▼                        │
│           │             ┌─────────────────────┐                   │
│           │             │ Models & Eloquent   │                   │
│           │             │ Employee•Task•KPI   │                   │
│           │             └─────────────────────┘                   │
│           │                           │                           │
│           └───────────────────────────┼───────────────────────────┘
│                                       │
│               ┌───────────────────────┴───────────────────────┐
│               ▼                                               ▼
│         ┌───────────┐                                ┌─────────────┐
│         │ Redis     │                                │ Queue Worker│
│         │ Cache     │◄───────Internal───────────────►│artisan      │
│         │(6379)     │                                │queue:work   │
│         └───────────┘                                └─────────────┘
│               │
│               ▼
│        ┌───────────────┐
│        │ PostgreSQL    │
│        │ Database      │
│        │ (5432)        │
│        ├───────────────┤
│        │ employees     │
│        │ tasks         │
│        │ evaluations   │
│        │ ml_features   │
│        │ clusters      │
│        └───────────────┘
└─────────────────────────────────────────────────────────────────┘
                           │
              POST /api/v1/ml/run-clustering
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                 ML PYTHON SERVICE LAYER                         │
│                    Python 3.11 Container                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Input: JSON from Backend → storage/app/ml_input_XXX.json       │
│           │                                                       │
│           ▼                                                       │
│  ┌────────────────────────────────────────────────────────┐      │
│  │              ml_processor.py                           │      │
│  │  ┌────────────────────────────────────────────────┐   │      │
│  │  │  Feature Loading & Preprocessing               │   │      │
│  │  │  - StandardScaler normalization                  │   │      │
│  │  └────────────────────────────────────────────────┘   │      │
│  │           │                                              │      │
│  │  ┌────────▼────────────────────────────────────────┐   │      │
│  │  │        K-Means Algorithm Selection              │   │      │
│  │  │  - <150 employees: Standard KMeans              │   │      │
│  │  │  - >150 employees: MiniBatchKMeans (~5-10x faster)│   │      │
│  │  └────────────────────────────────────────────────┘   │      │
│  │           │                                              │      │
│  │  ┌────────▼────────────────────────────────────────┐   │      │
│  │  │  Output Generation                             │   │      │
│  │  │  - centroids                                     │   │      │
│  │  │  - cluster_assignments                           │   │      │
│  │  │  - silhouette_score                              │   │      │
│  │  │  - quality_interpretation                        │   │      │
│  │  └────────────────────────────────────────────────┘   │      │
│  └────────────────────────────────────────────────────────┘      │
│                           │                                        │
│              Output: results → storage/app/ml_output_XXX.json    │
│                           │                                        │
│                           ▼                                        │
│         ┌──────────────────────────────────┐                      │
│         │ Libraries Used                    │                      │
│         │ scikit-learn                      │                      │
│         │ numpy                             │                      │
│         │ pandas                            │                      │
│         │ scipy                             │                      │
│         └──────────────────────────────────┘                      │
│                                                                   │
│  Virtual Environment: /app/backend/python/venv                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔗 Data Flow Sequence

### 1. User Management Flow
```
Frontend/UI → POST/FETCH Users List
   │
   ▼
Laravel Controller (UserController@index)
   │
   ├──→ Query DB with Eloquent ORM
   │     └──→ Postgres: SELECT * FROM users
   │            │
   │            ▼
   │        Redis Cache (optional - first request)
   │
   ├──→ Apply Pagination
   │
   └──→ Return JSON to Frontend
```

### 2. KPI Criteria Flow  
```
Frontend/UI → GET KPIs
   │
   ▼
Laravel Controller (KpiController@index)
   │
   ├──→ Load KPIs + Criteria (Eager loading)
   │     └──→ Postgres: SELECT kpis.*, criteria.* 
   │            JOIN kpi_criteria ON ...
   │
   └──→ Return structured JSON
```

### 3. ML Clustering Main Flow
```
STEP 1: Feature Extraction
──────────────────────────
User clicks "Ekstrak Fitur" on Frontend
   │
   ▼
POST /api/v1/ml/extract-features
   │
   ▼
Laravel Controller → FeatureExtractionService
   │
   ├──→ For each employee in period:
   │     └── Calculate features:
   │          • tasks_completed_percentage
   │          • on_time_percentage  
   │          • quality_score
   │          • discipline_score
   │          • active_tasks_count
   │          • late_tasks_count
   │
   └──→ Store to database (ml_employee_feature_data)
         │
         ▼
     Ready for clustering!
```

### 4. ML Clustering Execution Flow
```
STEP 2: Run Clustering
─────────────────────
User clicks "Jalankan Clustering"
   │
   ▼
POST /api/v1/ml/run-clustering
   │
   ▼
Laravel Controller → MLProcessingService
   │
   ├──→ Prepare input data:
   │     └── Write to: storage/app/ml_input_YYYY-MM.json
   │
   ├──→ Execute Python script:
   │     docker exec simkap_ml_python \
   │       python ml_processor.py input.json 3
   │
   └──→ Parse output:
         └── Read: storage/app/ml_output_YYYY-MM.json
               │
               ▼
          Create MLClusteringResult record
               │
               ▼
          Create MLEmployeeCluster records
```

### 5. Results Retrieval Flow
```
STEP 3: Get Results
──────────────────
Frontend auto-fetches or manual fetch
   │
   ▼
GET /api/v1/ml/clusters/{period}
   │
   ▼
Laravel Controller → getClusters()
   │
   ├──→ Query MLClusteringResult
   │     └── JOIN MLEmployeeClusters
   │          └── JOIN Employees (with eager loading)
   │
   ├──→ Group by cluster
   │
   ├──→ Generate interpretations
   │
   └──→ Return structured data with:
         • centroids
         • clusters[]
         • silhouette_score
         • interpretations[]
```

---

## 🔑 Key Technology Stack

| Component | Technology | Port | Purpose |
|-----------|------------|------|---------|
| **Frontend** | Next.js 14 | 3000 | SPA Application |
| **Backend** | Laravel 10 | 8000 | RESTful API |
| **Database** | PostgreSQL 16 | 5432 | Persistent Storage |
| **Cache** | Redis | 6379 | Session & Query Cache |
| **ML Service** | Python 3.11 | N/A | Containerized Processing |
| **Auth** | Sanctum | - | Token Authentication |
| **Queue** | Redis Driver | - | Background Jobs |

---

## 🎯 Connection Patterns

### 1. Frontend ↔ Backend (HTTP/REST)
```javascript
// Axios instance configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  timeout: 30000,
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
});
```

### 2. Backend ↔ Database (PDO/Eloquent)
```php
// Eloquent model example
class Employee extends Model {
    protected $fillable = ['name', 'email', 'division_id'];
    
    public function division() {
        return $this->belongsTo(Division::class);
    }
}

// Eager loading prevents N+1 queries
$users = User::with(['division', 'tasks'])->get();
```

### 3. Backend ↔ ML Service (File Exchange)
```python
# Python script reads/writes JSON files
def prepare_input_data(period):
    features = EmployeeMLFeature.objects.filter(evaluation_period=period)
    
    data = {
        'employees': [
            {'label': f.employee.name, 'features': [...]}
            for f in features
        ],
        'feature_names': [...]
    }
    
    with open(f'ml_input_{period}.json', 'w') as f:
        json.dump(data, f)
```

### 4. Backend ↔ Redis (Cache/Session)
```php
// Cache user list for 5 minutes
$users = Cache::remember("users_page_{$page}", 300, function() {
    return User::with('role')->paginate(15);
});

// Queue job for long operations
ProcessMlClustering::dispatch($period)->delay(now()->addMinutes(5));
```

---

## 📊 Communication Protocols

| Direction | Protocol | Format | Status |
|-----------|----------|--------|--------|
| Frontend → Backend | HTTPS | JSON | REST API |
| Backend → Frontend | HTTP | JSON | REST Response |
| Backend → Database | TCP/IP | SQL | PDO/Query Builder |
| Backend → Redis | TCP/IP | RESP | Cache Commands |
| Backend → ML Container | File System | JSON | Shared Volume |

---

## 🔒 Security Layers

```
┌─────────────────────────────────────┐
│  Browser/CORS Headers               │
│  (frontend origin whitelist)        │
└──────────────┬──────────────────────┘
               ▼
┌─────────────────────────────────────┐
│  Laravel Middleware Stack           │
│  • CorsMiddleware (origins check)   │
│  • Authenticate (Sanctum token)     │
│  • CheckRoles (policy enforcement)  │
└──────────────┬──────────────────────┘
               ▼
┌─────────────────────────────────────┐
│  API Controllers                    │
│  • Permission checks                │
│  • Input validation                 │
│  • Rate limiting                    │
└──────────────┬──────────────────────┘
               ▼
┌─────────────────────────────────────┐
│  Database Access                    │
│  • Parameterized queries (no SQLi)  │
│  • Role-based access control        │
└─────────────────────────────────────┘
```

---

## ⚡ Performance Optimizations

### Caching Hierarchy
```
Level 1: Browser (localStorage) - 60s TTL
    ↓
Level 2: Redis Cache (API responses) - 300s TTL  
    ↓
Level 3: Database Query Cache - Dynamic TTL
```

### Connection Pooling
```
PHP-FPM: Dynamic Pool
  - max_children: 25
  - start_servers: 5
  - min_spare: 3
  - Recycle after 500 requests
  
Database PDO: Max 20 connections
Redis: Persistent connection pool
```

### Lazy Loading Strategy
```javascript
// Only import heavy components when needed
const TaskDetailModal = lazy(() => 
  import('@/components/tasks/TaskDetailModal')
);

// Load images on scroll
import { useInView } from 'react-intersection-observer';
```

---

## 🚀 Scalability Considerations

### Vertical Scaling
- Increase PHP-FPM `max_children`
- Add more RAM to PostgreSQL
- Upgrade ML container CPU allocation

### Horizontal Scaling
```yaml
# Scale backend instances
backend:
  deploy:
    replicas: 3
    
# Add read replicas for PostgreSQL
replicas:
  primary: postgres-main
  slave: postgres-replica-1
  slave: postgres-replica-2
  
# Load balance traffic
nginx:
  upstream backend_servers {
    server backend-1:8000;
    server backend-2:8000;
    server backend-3:8000;
  }
```

---

This architecture provides a clean separation of concerns with clear data flow between frontend, backend, and ML services!
