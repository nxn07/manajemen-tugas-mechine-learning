use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\TaskController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\DivisionController;
use App\Http\Controllers\Api\V1\KpiController;
use App\Http\Controllers\Api\V1\EvaluationController;
use App\Http\Controllers\Api\V1\RoleController;
use App\Http\Controllers\Api\V1\PermissionController;
use App\Http\Controllers\Api\V1\AuditLogController;
use App\Http\Controllers\Api\V1\MlClusteringController;

Route::prefix('v1')->group(function () {

    // ==========================================
    // Public Routes (Auth)
    // ==========================================
    Route::post('/auth/login', [AuthController::class, 'login']);

    // ==========================================
    // Protected Routes (Harus Login / Sanctum)
    // ==========================================
    Route::middleware('auth:sanctum')->group(function () {

        // Auth Session & Profile
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);

        // Tasks Management (CRUD Lengkap + Review & Submit)
        Route::apiResource('tasks', TaskController::class);
        Route::post('/tasks/{id}/review', [TaskController::class, 'review']);
        Route::post('/tasks/{id}/submit', [TaskController::class, 'submit']);

        // Users & Roles Management
        Route::apiResource('users', UserController::class);
        Route::apiResource('roles', RoleController::class);
        Route::get('/permissions', [PermissionController::class, 'index']);

        // Master Data (Divisions & KPIs)
        Route::apiResource('divisions', DivisionController::class);
        Route::apiResource('kpis', KpiController::class);

        // Performance Evaluations Management
        Route::get('/evaluations/me', [EvaluationController::class, 'myEvaluation']);
        Route::apiResource('evaluations', EvaluationController::class);

        // Audit Logs (Aman dengan Controller & Middleware Permission)
        Route::get('/activity-logs', [AuditLogController::class, 'index'])->middleware('permission:activity-log.view');

        // ==========================================
        // Machine Learning Clustering
        // ==========================================
        Route::prefix('ml')->group(function () {
            Route::post('/extract-features', [MlClusteringController::class, 'extractFeatures']);
            Route::post('/run-clustering', [MlClusteringController::class, 'runClustering']);
            Route::get('/clusters/{period}', [MlClusteringController::class, 'getClusters']);
        });
    });
});
