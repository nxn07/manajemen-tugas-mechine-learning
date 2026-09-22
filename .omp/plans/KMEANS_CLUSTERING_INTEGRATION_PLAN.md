# KMeans Clustering Integration for SIM Kinerja PT Central Saga Mandala

## Context

Implementasikan fitur Machine Learning K-Means Clustering untuk mengelompokkan 30 karyawan berdasarkan kinerja dan beban kerja sebagai sistem pendukung keputusan penugasan di SIM Kinerja PT Central Saga Mandala. Integrasi dengan data existing (tasks, task_submissions, performance_evaluations) tanpa requiring attendance_logs yang belum ada.

Target: Backend-first implementation dengan Python service untuk processing ML.

---

## Approach

### Step 1: Create ML Data Tables Migration
**Target File:** `backend/database/migrations/xxxx_create_employee_ml_data_tables.php`

**New Behavior:**
- Create `ml_employee_feature_data` table untuk store calculated features per period
- Create `ml_clustering_results` table untuk store centroid & evaluation metrics  
- Create `ml_employee_clusters` table untuk employee-cluster mapping

**Concrete Edit:**
```php
Schema::create('ml_employee_feature_data', function (Blueprint $table) {
    $table->id();
    $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
    $table->string('evaluation_period'); // YYYY-MM format
    $table->decimal('attendance_percentage', 5, 2)->nullable();
    $table->decimal('tasks_completed_percentage', 5, 2)->nullable();
    $table->decimal('on_time_percentage', 5, 2)->nullable();
    $table->decimal('quality_score', 5, 2)->nullable(); // AVG from evaluations
    $table->decimal('discipline_score', 5, 2)->nullable(); // Can derive from task reviews
    $table->integer('active_tasks_count')->default(0);
    $table->integer('late_tasks_count')->default(0);
    $table->decimal('avg_resolution_days', 5, 2)->nullable();
    $table->timestamps();
    
    $table->unique(['employee_id', 'evaluation_period']);
});

Schema::create('ml_clustering_results', function (Blueprint $table) {
    $table->id();
    $table->string('evaluation_period');
    $table->integer('n_clusters')->default(3);
    $table->decimal('silhouette_score', 5, 4)->nullable();
    $table->json('centroids'); // Store cluster center points
    $table->json('feature_names'); // ['attendance_percentage', ...]
    $table->timestamp('processed_at');
    $table->timestamps();
});

Schema::create('ml_employee_clusters', function (Blueprint $table) {
    $table->id();
    $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
    $table->foreignId('clustering_result_id')->constrained('ml_clustering_results')->onDelete('cascade');
    $table->integer('cluster_assignment'); // 0, 1, or 2
    $table->decimal('distance_to_centroid', 10, 4)->nullable();
    $table->timestamps();
    
    $table->unique(['employee_id', 'clustering_result_id']);
});
```

---

### Step 2: Create EmployeeMLFeature Model
**Target File:** `backend/app/Models/EmployeeMLFeature.php`

**Signature:**
```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmployeeMLFeature extends Model
{
    protected $table = 'ml_employee_feature_data';
    
    protected $fillable = [
        'employee_id',
        'evaluation_period',
        'attendance_percentage',
        'tasks_completed_percentage',
        'on_time_percentage',
        'quality_score',
        'discipline_score',
        'active_tasks_count',
        'late_tasks_count',
        'avg_resolution_days',
    ];
    
    protected $casts = [
        'attendance_percentage' => 'decimal:2',
        'tasks_completed_percentage' => 'decimal:2',
        'on_time_percentage' => 'decimal:2',
        'quality_score' => 'decimal:2',
        'discipline_score' => 'decimal:2',
        'avg_resolution_days' => 'decimal:2',
        'active_tasks_count' => 'integer',
        'late_tasks_count' => 'integer',
    ];
    
    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
```

---

### Step 3: Create MLClusteringResult Model
**Target File:** `backend/app/Models/MLClusteringResult.php`

**Signature:**
```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MLClusteringResult extends Model
{
    protected $table = 'ml_clustering_results';
    
    protected $fillable = [
        'evaluation_period',
        'n_clusters',
        'silhouette_score',
        'centroids',
        'feature_names',
        'processed_at',
    ];
    
    protected $casts = [
        'centroids' => 'array',
        'feature_names' => 'array',
        'processed_at' => 'datetime',
    ];
    
    public function clusters()
    {
        return $this->hasManyMLElementCluster::class;
    }
}
```

---

### Step 4: Create MLEmployeeCluster Model
**Target File:** `backend/app/Models/MLEmployeeCluster.php`

**Signature:**
```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MLEmployeeCluster extends Model
{
    protected $table = 'ml_employee_clusters';
    
    protected $fillable = [
        'employee_id',
        'clustering_result_id',
        'cluster_assignment',
        'distance_to_centroid',
    ];
    
    protected $casts = [
        'distance_to_centroid' => 'decimal:4',
    ];
    
    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
    
    public function clusteringResult()
    {
        return $this->belongsTo(MLClusteringResult::class);
    }
}
```

---

### Step 5: Create Feature Extraction Service
**Target File:** `backend/app/Services/Ml/FeatureExtractionService.php`

**Reuses:** Existing Task, TaskSubmission, PerformanceEvaluation models

**Signature:**
```php
namespace App\Services\Ml;

use App\Models\EmployeeMLFeature;
use App\Models\Task;
use App\Models\TaskSubmission;
use App\Models\PerformanceEvaluation;
use App\Models\Employee;
use Illuminate\Support\Facades\DB;

class FeatureExtractionService
{
    public function calculateForPeriod(int $employeeId, string $period): EmployeeMLFeature
    {
        // Calculate all 8 features for an employee in specific period
        
        // 1. Attendance Percentage - fallback to null since attendance_logs doesn't exist
        $attendancePercentage = null; // TODO: Implement if attendance_logs added later
        
        // 2. Tasks Completed Percentage
        $tasks = Task::where('assigned_employee_id', $employeeId)
            ->whereYear('created_at', '=', substr($period, 0, 4))
            ->whereMonth('created_at', '=', substr($period, 5, 2))
            ->get();
        
        $totalTasks = $tasks->count();
        $completedTasks = $tasks->where('status', 'COMPLETED')->count();
        $tasksCompletedPercentage = ($totalTasks > 0) 
            ? ($completedTasks / $totalTasks) * 100 
            : 0;
        
        // 3. On Time Percentage
        $onTimeTasks = $tasks->filter(function($task) {
            return strtotime($task->deadline) >= strtotime(now());
        })->count();
        
        $onTimePercentage = ($totalTasks > 0) ? ($onTimeTasks / $totalTasks) * 100 : 0;
        
        // 4. Quality Score - AVG from performance_evaluations
        $evaluations = PerformanceEvaluation::where('employee_id', $employeeId)
            ->whereYear('created_at', '=', substr($period, 0, 4))
            ->whereMonth('created_at', '=', substr($period, 5, 2))
            ->get();
        
        $qualityScore = $evaluations->avg('score') ?? null;
        
        // 5. Discipline Score - derive from task review quality
        $disciplineScore = $this->calculateDisciplineScore($employeeId, $period);
        
        // 6. Active Tasks Count
        $activeCount = Task::where('assigned_employee_id', $employeeId)
            ->whereIn('status', ['PENDING', 'IN_PROGRESS'])
            ->whereYear('created_at', '=', substr($period, 0, 4))
            ->whereMonth('created_at', '=', substr($period, 5, 2))
            ->count();
        
        // 7. Late Tasks Count
        $lateCount = Task::where('assigned_employee_id', $employeeId)
            ->where('status', 'COMPLETED')
            ->where('deadline', '<', DB::raw('NOW()'))
            ->whereYear('created_at', '=', substr($period, 0, 4))
            ->whereMonth('created_at', '=', substr($period, 5, 2))
            ->count();
        
        // 8. Average Resolution Days
        $resolutionDays = TaskSubmission::join('tasks', 'task_submissions.task_id', '=', 'tasks.id')
            ->where('task_submissions.employee_id', $employeeId)
            ->whereYear('task_submissions.created_at', '=', substr($period, 0, 4))
            ->whereMonth('task_submissions.created_at', '=', substr($period, 5, 2))
            ->select(DB::raw('AVG(DATEDIFF(task_submissions.submitted_at, tasks.deadline)) as avg_days'))
            ->value('avg_days');
        
        // Save to database
        return EmployeeMLFeature::updateOrCreate(
            [
                'employee_id' => $employeeId,
                'evaluation_period' => $period,
            ],
            [
                'attendance_percentage' => $attendancePercentage,
                'tasks_completed_percentage' => $tasksCompletedPercentage,
                'on_time_percentage' => $onTimePercentage,
                'quality_score' => $qualityScore,
                'discipline_score' => $disciplineScore,
                'active_tasks_count' => $activeCount,
                'late_tasks_count' => $lateCount,
                'avg_resolution_days' => $resolutionDays,
            ]
        );
    }
    
    public function calculateForAllEmployees(string $period): int
    {
        $employees = Employee::all();
        $count = 0;
        
        foreach ($employees as $employee) {
            $this->calculateForPeriod($employee->id, $period);
            $count++;
        }
        
        return $count;
    }
    
    protected function calculateDisciplineScore(int $employeeId, string $period): ?float
    {
        // Simplified discipline calculation based on:
        // - Timeliness of submissions
        // - Revision requests rate
        // - Manager review ratings
        
        $submissions = TaskSubmission::join('tasks', 'task_submissions.task_id', '=', 'tasks.id')
            ->where('task_submissions.employee_id', $employeeId)
            ->whereYear('task_submissions.created_at', '=', substr($period, 0, 4))
            ->whereMonth('task_submissions.created_at', '=', substr($period, 5, 2))
            ->selectRaw('
                COUNT(*) as total_submissions,
                SUM(CASE WHEN task_submissions.status = "REVISED" THEN 1 ELSE 0 END) as revision_count
            ')
            ->first();
        
        if (!$submissions || $submissions->total_submissions == 0) {
            return null;
        }
        
        // Base score 100, deduct 5 points per revision
        $baseScore = 100;
        $deduction = ($submissions->revision_count / $submissions->total_submissions) * 50;
        
        return max(0, $baseScore - $deduction);
    }
}
```

---

### Step 6: Create ML Processing Service (Python Integration)
**Target File:** `backend/app/Services/Ml/MLProcessingService.php`

**Reuses:** Python script execution via shell_exec

**Signature:**
```php
namespace App\Services\Ml;

use App\Models\EmployeeMLFeature;
use App\Models\MLClusteringResult;
use App\Models\MLEmployeeCluster;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Process;

class MLProcessingService
{
    public function prepareDataForClustering(string $period): array
    {
        // Load all feature data
        $features = EmployeeMLFeature::where('evaluation_period', $period)
            ->with('employee')
            ->get();
        
        if ($features->count() < 5) {
            throw new \Exception("Minimum 5 employees required for clustering");
        }
        
        // Build matrix for Python
        $matrix = [];
        $labels = [];
        
        foreach ($features as $index => $feature) {
            $row = [
                $feature->attendance_percentage ?? 0,
                $feature->tasks_completed_percentage ?? 0,
                $feature->on_time_percentage ?? 0,
                $feature->quality_score ?? 0,
                $feature->discipline_score ?? 0,
                $feature->active_tasks_count ?? 0,
                $feature->late_tasks_count ?? 0,
                $feature->avg_resolution_days ?? 0,
            ];
            
            $matrix[] = $row;
            $labels[] = $feature->employee->name;
        }
        
        // Export to JSON
        $data = [
            'metadata' => [
                'exported_at' => now()->toISOString(),
                'evaluation_period' => $period,
                'total_employees' => $features->count(),
            ],
            'features' => [
                'attendance_percentage',
                'tasks_completed_percentage',
                'on_time_percentage',
                'quality_score',
                'discipline_score',
                'active_tasks_count',
                'late_tasks_count',
                'avg_resolution_days',
            ],
            'matrix' => $matrix,
            'labels' => $labels,
        ];
        
        $filePath = Storage::disk('local')->path("ml_input_{$period}.json");
        file_put_contents($filePath, json_encode($data, JSON_PRETTY_PRINT));
        
        return ['path' => $filePath, 'employee_count' => $features->count()];
    }
    
    public function runKMeans(string $period, int $nClusters = 3): MLClusteringResult
    {
        // Prepare input data
        $inputPath = $this->prepareDataForClustering($period)['path'];
        
        // Run Python script
        $pythonScript = base_path('python/ml_processor.py');
        
        $output = Process::run([
            'python3',
            $pythonScript,
            $inputPath,
            $nClusters,
        ])->throw(false);
        
        if ($output->exitCode() !== 0) {
            throw new \Exception("ML processing failed: {$output->stderr()}");
        }
        
        // Parse results from output JSON
        $resultsPath = str_replace('.json', '_output.json', $inputPath);
        $results = json_decode(file_get_contents($resultsPath), true);
        
        // Store clustering result
        $clusteringResult = MLClusteringResult::create([
            'evaluation_period' => $period,
            'n_clusters' => $nClusters,
            'silhouette_score' => $results['silhouette_score'],
            'centroids' => $results['centroids'],
            'feature_names' => $results['feature_names'],
            'processed_at' => now(),
        ]);
        
        // Store employee-cluster mappings
        foreach ($results['cluster_assignments'] as $assignment) {
            $employee = Employee::where('name', $assignment['label'])->first();
            
            if ($employee) {
                MLEmployeeCluster::create([
                    'employee_id' => $employee->id,
                    'clustering_result_id' => $clusteringResult->id,
                    'cluster_assignment' => $assignment['cluster'],
                    'distance_to_centroid' => $assignment['distance'],
                ]);
            }
        }
        
        return $clusteringResult;
    }
}
```

---

### Step 7: Create Python ML Processor Script
**Target File:** `backend/python/ml_processor.py`

**Signature:**
```python
#!/usr/bin/env python3
"""
K-Means Clustering Processor for SIM Kinerja
Uses scikit-learn for ML processing
"""

import json
import sys
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score

def load_data(data_path: str):
    """Load employee feature data from JSON"""
    with open(data_path, 'r') as f:
        data = json.load(f)
    
    matrix = np.array(data['matrix'])
    labels = data['labels']
    features = data['features']
    
    return matrix, labels, features

def preprocess_data(matrix: np.ndarray):
    """Normalize data using StandardScaler"""
    scaler = StandardScaler()
    return scaler.fit_transform(matrix), scaler

def run_kmeans(matrix_normalized: np.ndarray, n_clusters: int):
    """Run K-Means algorithm"""
    kmeans = KMeans(
        n_clusters=n_clusters,
        random_state=42,
        n_init='auto'
    )
    cluster_labels = kmeans.fit_predict(matrix_normalized)
    
    return kmeans, cluster_labels

def evaluate_clusters(matrix_normalized: np.ndarray, cluster_labels: list):
    """Evaluate clustering quality"""
    silhouette = silhouette_score(matrix_normalized, cluster_labels)
    centroids = kmeans.cluster_centers_.tolist()
    
    return {
        'silhouette_score': float(silhouette),
        'centroids': centroids
    }

def assign_employees_to_clusters(
    cluster_labels: np.ndarray, 
    labels: list, 
    matrix_normalized: np.ndarray, 
    centroids: list
):
    """Map employees to clusters with distance calculations"""
    assignments = []
    
    for i, label in enumerate(cluster_labels):
        distances = [
            np.linalg.norm(matrix_normalized[i] - centroid)
            for centroid in centroids
        ]
        
        assignments.append({
            'label': labels[i],
            'cluster': int(label),
            'distance': float(distances[label])
        })
    
    return assignments

def main():
    if len(sys.argv) < 3:
        print("Usage: python ml_processor.py <input_json> <n_clusters>")
        sys.exit(1)
    
    input_path = sys.argv[1]
    n_clusters = int(sys.argv[2])
    
    # Load data
    matrix, labels, features = load_data(input_path)
    
    # Preprocess
    matrix_normalized, scaler = preprocess_data(matrix)
    
    # Run K-Means
    kmeans, cluster_labels = run_kmeans(matrix_normalized, n_clusters)
    
    # Evaluate
    evaluation = evaluate_clusters(matrix_normalized, cluster_labels.tolist())
    
    # Assign employees
    assignments = assign_employees_to_clusters(
        cluster_labels, labels, matrix_normalized, evaluation['centroids']
    )
    
    # Prepare output
    output = {
        'silhouette_score': evaluation['silhouette_score'],
        'feature_names': features,
        'centroids': evaluation['centroids'],
        'cluster_assignments': assignments
    }
    
    # Save results
    output_path = input_path.replace('.json', '_output.json')
    with open(output_path, 'w') as f:
        json.dump(output, f, indent=2)
    
    print(json.dumps(output))

if __name__ == '__main__':
    main()
```

---

### Step 8: Create API Controller for ML Operations
**Target File:** `backend/app/Http/Controllers/Api/V1/MlClusteringController.php`

**Signature:**
```php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\MLClusteringResult;
use App\Models\MLEmployeeCluster;
use App\Models\Employee;
use App\Services\Ml\FeatureExtractionService;
use App\Services\Ml\MLProcessingService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MlClusteringController extends Controller
{
    protected FeatureExtractionService $featureService;
    protected MLProcessingService $processingService;
    
    public function __construct(
        FeatureExtractionService $featureService,
        MLProcessingService $processingService
    ) {
        $this->featureService = $featureService;
        $this->processingService = $processingService;
    }
    
    /**
     * @SWG\Post(
     *   path="/api/v1/ml/extract-features",
     *   summary="Extract features for all employees",
     *   tags={"Machine Learning"},
     *   responses={
     *     @SWG\Response(
     *       response=200,
     *       description="Features extracted successfully"
     *     )
     *   }
     * )
     */
    public function extractFeatures(Request $request): JsonResponse
    {
        $period = $request->input('period', now()->format('Y-m'));
        
        try {
            $count = $this->featureService->calculateForAllEmployees($period);
            
            return response()->json([
                'success' => true,
                'message' => "Features extracted for {$count} employees",
                'period' => $period,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
    
    /**
     * @SWG\Post(
     *   path="/api/v1/ml/run-clustering",
     *   summary="Run K-Means clustering",
     *   tags={"Machine Learning"},
     *   parameters={
     *     @SWG\Parameter(
     *       name="period",
     *       in="query",
     *       description="Evaluation period (YYYY-MM)",
     *       type="string",
     *       default="current month"
     *     ),
     *     @SWG\Parameter(
     *       name="n_clusters",
     *       in="query",
     *       description="Number of clusters",
     *       type="integer",
     *       default=3
     *     )
     *   },
     *   responses={
     *     @SWG\Response(
     *       response=200,
     *       description="Clustering completed successfully"
     *     )
     *   }
     * )
     */
    public function runClustering(Request $request): JsonResponse
    {
        $period = $request->input('period', now()->format('Y-m'));
        $nClusters = $request->input('n_clusters', 3);
        
        try {
            $result = $this->processingService->runKMeans($period, $nClusters);
            
            return response()->json([
                'success' => true,
                'message' => 'Clustering completed successfully',
                'data' => [
                    'clustering_result_id' => $result->id,
                    'period' => $result->evaluation_period,
                    'n_clusters' => $result->n_clusters,
                    'silhouette_score' => $result->silhouette_score,
                    'processed_at' => $result->processed_at->toIsoString(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
    
    /**
     * @SWG\Get(
     *   path="/api/v1/ml/clusters/{period}",
     *   summary="Get clustering results for a period",
     *   tags={"Machine Learning"},
     *   parameters={
     *     @SWG\Parameter(
     *       name="period",
     *       in="path",
     *       required=true,
     *       description="Evaluation period (YYYY-MM)",
     *       type="string"
     *     )
     *   },
     *   responses={
     *     @SWG\Response(
     *       response=200,
     *       description="Clusters retrieved successfully"
     *     )
     *   }
     * )
     */
    public function getClusters(string $period): JsonResponse
    {
        $result = MLClusteringResult::where('evaluation_period', $period)
            ->with('clusters.employee')
            ->orderBy('created_at', 'desc')
            ->first();
        
        if (!$result) {
            return response()->json([
                'success' => false,
                'message' => 'No clustering results found for this period',
            ], 404);
        }
        
        $clusterGroups = [0 => [], 1 => [], 2 => []];
        
        foreach ($result->clusters as $clusterMember) {
            $clusterGroups[$clusterMember->cluster_assignment][] = [
                'employee_id' => $clusterMember->employee->id,
                'name' => $clusterMember->employee->name,
                'position' => $clusterMember->employee->position,
                'division' => $clusterMember->employee->division->name,
                'distance_to_centroid' => $clusterMember->distance_to_centroid,
            ];
        }
        
        return response()->json([
            'success' => true,
            'data' => [
                'period' => $result->evaluation_period,
                'n_clusters' => $result->n_clusters,
                'silhouette_score' => $result->silhouette_score,
                'centroids' => $result->centroids,
                'interpretation' => $this->interpretClusters($result->centroids),
                'clusters' => $clusterGroups,
            ]
        ]);
    }
    
    protected function interpretClusters(array $centroids): array
    {
        // Auto-interpret cluster characteristics based on centroid values
        $interpretations = [];
        
        foreach ($centroids as $index => $centroid) {
            $highPerformers = 0;
            $heavyWorkload = 0;
            
            // Assume first 5 are positive indicators (higher is better)
            // Last 3 are workload indicators (need interpretation)
            for ($i = 0; $i < 5; $i++) {
                if ($centroid[$i] > 50) {
                    $highPerformers++;
                }
            }
            
            // Interpret based on patterns
            if ($highPerformers >= 4) {
                $description = "High performers";
            } elseif ($highPerformers >= 2) {
                $description = "Moderate performers";
            } else {
                $description = "Developing performers";
            }
            
            $interpretations[$index] = $description;
        }
        
        return $interpretations;
    }
}
```

---

### Step 9: Register Routes
**Target File:** `backend/routes/api.php`

**Add:**
```php
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\TaskController;
use App\Http\Controllers\Api\V1\RoleController;
use App\Http\Controllers\Api\V1\PermissionController;
use App\Http\Controllers\Api\V1\KpiController;
use App\Http\Controllers\Api\V1\EvaluationController;
use App\Http\Controllers\Api\V1\EmployeeController;
use App\Http\Controllers\Api\V1\DivisionController;
use App\Http\Controllers\Api\V1\MlClusteringController;

Route::prefix('v1')->group(function () {
    // Auth routes
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    
    // Public routes
    Route::prefix('auth')->group(function () {
        Route::post('/login', [AuthController::class, 'login']);
    });
    
    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        
        // User management
        Route::apiResource('users', UserController::class);
        
        // Task management
        Route::apiResource('tasks', TaskController::class);
        Route::post('/tasks/{task}/submit', [TaskController::class, 'submitTask']);
        Route::post('/tasks/{task}/review', [TaskController::class, 'reviewTask']);
        
        // Role & Permission
        Route::apiResource('roles', RoleController::class);
        Route::post('/roles/{role}/permissions', [RoleController::class, 'givePermissions']);
        Route::post('/roles/{role}/permissions/give', [PermissionController::class, 'give']);
        Route::get('/roles/{role}/permissions', [PermissionController::class, 'get']);
        Route::delete('/roles/{role}/permissions/{permission}', [PermissionController::class, 'revoke']);
        
        // KPI Management
        Route::apiResource('kpis', KpiController::class);
        
        // Evaluation Management
        Route::apiResource('evaluations', EvaluationController::class);
        
        // Employee Management
        Route::apiResource('employees', EmployeeController::class);
        
        // Division Management
        Route::apiResource('divisions', DivisionController::class);
        
        // ML Clustering
        Route::prefix('ml')->group(function () {
            Route::post('/extract-features', [MlClusteringController::class, 'extractFeatures']);
            Route::post('/run-clustering', [MlClusteringController::class, 'runClustering']);
            Route::get('/clusters/{period}', [MlClusteringController::class, 'getClusters']);
        });
    });
});
```

---

### Step 10: Create Artisan Command (Optional but Recommended)
**Target File:** `backend/app/Console/Commands/RunMLClusteringCommand.php`

**Signature:**
```php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\Ml\FeatureExtractionService;
use App\Services\Ml\MLProcessingService;

class RunMLClusteringCommand extends Command
{
    protected $signature = 'ml:cluster {--period=} {--clusters=3}';
    protected $description = 'Run K-Means clustering for employee performance analysis';
    
    protected FeatureExtractionService $featureService;
    protected MLProcessingService $processingService;
    
    public function __construct(
        FeatureExtractionService $featureService,
        MLProcessingService $processingService
    ) {
        parent::__construct();
        
        $this->featureService = $featureService;
        $this->processingService = $processingService;
    }
    
    public function handle(): int
    {
        $period = $this->option('period') ?? now()->format('Y-m');
        $nClusters = (int) $this->option('clusters');
        
        $this->info("Starting ML Clustering for period: {$period}");
        
        // Extract features
        $this->task('Extracting features', function () use ($period) {
            $count = $this->featureService->calculateForAllEmployees($period);
            $this->info("✓ Features extracted for {$count} employees");
            return true;
        });
        
        // Run clustering
        $this->task('Running K-Means clustering', function () use ($period, $nClusters) {
            $result = $this->processingService->runKMeans($period, $nClusters);
            
            $this->info("✓ Clustering completed");
            $this->info("  - Silhouette Score: {$result->silhouette_score}");
            $this->info("  - Clusters: {$result->n_clusters}");
            
            return true;
        });
        
        $this->info("ML Clustering completed successfully!");
        
        return Command::SUCCESS;
    }
}
```

---

## Critical Files & Anchors

### Database Migrations
1. **`database/migrations/xxxx_create_employee_ml_data_tables.php`** - New tables for ML data storage
2. **Tables needed:** `ml_employee_feature_data`, `ml_clustering_results`, `ml_employee_clusters`

### Models
3. **`app/Models/EmployeeMLFeature.php`** - Feature data model
4. **`app/Models/MLClusteringResult.php`** - Clustering result metadata
5. **`app/Models/MLEmployeeCluster.php`** - Employee-to-cluster mapping

### Services
6. **`app/Services/Ml/FeatureExtractionService.php`** - Feature calculation logic
7. **`app/Services/Ml/MLProcessingService.php`** - Python integration & orchestration

### Python Script
8. **`python/ml_processor.py`** - K-Means implementation using scikit-learn

### Controllers & Routes
9. **`app/Http/Controllers/Api/V1/MlClusteringController.php`** - API endpoints
10. **`routes/api.php`** - Route registration for ML endpoints

---

## Verification

### Test Setup
1. Ensure you have at least 30 employees in the database
2. Each employee should have some completed tasks and performance evaluations
3. Install Python 3.8+ with required packages:
   ```bash
   pip install scikit-learn numpy
   ```

### Manual Testing Steps

#### Step 1: Extract Features
```bash
curl -X POST http://localhost:8000/api/v1/ml/extract-features \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"period": "2026-01"}'
```

Expected Response:
```json
{
  "success": true,
  "message": "Features extracted for 30 employees",
  "period": "2026-01"
}
```

#### Step 2: Run Clustering
```bash
curl -X POST http://localhost:8000/api/v1/ml/run-clustering \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"period": "2026-01", "n_clusters": 3}'
```

Expected Response:
```json
{
  "success": true,
  "message": "Clustering completed successfully",
  "data": {
    "clustering_result_id": 1,
    "period": "2026-01",
    "n_clusters": 3,
    "silhouette_score": 0.523,
    "processed_at": "2026-01-15T10:30:00Z"
  }
}
```

#### Step 3: Get Cluster Results
```bash
curl http://localhost:8000/api/v1/ml/clusters/2026-01 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected Response Structure:
```json
{
  "success": true,
  "data": {
    "period": "2026-01",
    "n_clusters": 3,
    "silhouette_score": 0.523,
    "centroids": [...],
    "interpretation": {
      "0": "High performers",
      "1": "Moderate performers",
      "2": "Developing performers"
    },
    "clusters": {
      "0": [...employees in cluster 0...],
      "1": [...employees in cluster 1...],
      "2": [...employees in cluster 2...]
    }
  }
}
```

### Automated Testing Example

Create test file: `tests/Feature/MlClusteringTest.php`

```php
<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Employee;
use App\Models\Task;
use App\Models\TaskSubmission;
use App\Models\PerformanceEvaluation;
use Illuminate\Foundation\Testing\RefreshDatabase;

class MlClusteringTest extends TestCase
{
    use RefreshDatabase;
    
    /** @test */
    public function it_can_extract_features_for_employees()
    {
        // Create test data
        $employee = Employee::factory()->create();
        
        Task::factory()->count(10)->create([
            'assigned_employee_id' => $employee->id,
            'status' => 'COMPLETED',
        ]);
        
        PerformanceEvaluation::factory()->count(5)->create([
            'employee_id' => $employee->id,
            'score' => 85.0,
        ]);
        
        // Call endpoint
        $response = $this->actingAs($employee->user)
            ->postJson('/api/v1/ml/extract-features', [
                'period' => '2026-01'
            ]);
        
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'period'
            ]);
    }
    
    /** @test */
    public function clustering_requires_minimum_employees()
    {
        // Create only 3 employees (below minimum)
        Employee::factory()->count(3)->create();
        
        $response = $this->actingAs(Employee::first()->user)
            ->postJson('/api/v1/ml/extract-features', [
                'period' => '2026-01'
            ])
            ->postJson('/api/v1/ml/run-clustering', [
                'period' => '2026-01'
            ]);
        
        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Minimum 5 employees required for clustering'
            ]);
    }
}
```

### Validation Checks

After implementation, verify:
1. ✅ All 8 features can be calculated from existing data
2. ✅ Silhouette Score ≥ 0.5 for 3 clusters
3. ✅ Clustering runs within 5 seconds
4. ✅ No data loss during feature extraction
5. ✅ Python script executes without errors
6. ✅ API endpoints respond with correct JSON structure
7. ✅ Employee-cluster mappings are stored correctly

---

## Assumptions & Contingencies

### Key Assumptions
1. **Attendance tracking**: `attendance_logs` table doesn't exist yet → `attendance_percentage` will be `null`. This is acceptable as long as other 7 features compensate.
2. **Discipline score derivation**: Uses task revision rate as proxy since explicit discipline scoring may not exist.
3. **Python availability**: Python 3.8+ and `scikit-learn` package must be installed on server.
4. **Minimum data**: At least 5 employees with task history required for meaningful clustering.

### Contingency Plans

**If attendance_tracking_data is missing:**
- Current approach: Set `attendance_percentage` to `null`, let scikit-learn handle missing values
- Alternative: Add attendance module later, rerun feature extraction

**If insufficient task history:**
- Current approach: Throw error requiring minimum 5 employees with task data
- Fallback: Use historical data from multiple months combined

**If Python environment unavailable:**
- Alternative: Implement K-Means in PHP using php-ml library (not implemented by default)
- Recommendation: Install Python dependency for production

**If silhouette score < 0.3:**
- Indicates poor clustering quality
- Action: Try different number of clusters (2 or 4)
- Report: Document limitation in user interface

---

## Timeline Estimate

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Database migrations & models | 1 day | None |
| Feature extraction service | 2 days | Models ready |
| Python script development | 1 day | Feature extraction tested |
| ML processing service | 1 day | Python script working |
| API controller & routes | 1 day | Services complete |
| Testing & validation | 2 days | All components integrated |
| **Total** | **8 days** | Sequential execution recommended |

---

## Next Steps

1. Review this plan against actual project needs
2. Confirm Python environment availability
3. Decide on attendance percentage handling strategy
4. Get approval to proceed with implementation
5. Start with migration creation

**Ready to begin implementation upon approval.**
