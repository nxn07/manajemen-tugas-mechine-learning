<?php
/**
 * Standalone ML Pipeline Runner
 * Bypasses the API layer for direct execution of feature extraction and clustering
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Services\Ml\FeatureExtractionService;
use App\Services\Ml\MLProcessingService;

class MlPipelineRunner
{
    protected FeatureExtractionService $featureService;
    protected MLProcessingService $mlService;
    
    public function __construct()
    {
        $this->featureService = new FeatureExtractionService();
        $this->mlService = new MLProcessingService();
    }
    
    /**
     * Extract features for all employees
     */
    public function extractFeatures(string $period): array
    {
        Log::info('🚀 Starting feature extraction', ['period' => $period]);
        
        $startTime = microtime(true);
        
        // Check if data already exists
        $existingCount = DB::table('ml_employee_feature_data')
            ->where('evaluation_period', $period)
            ->count();
        
        if ($existingCount > 0) {
            Log::info("✨ Features already exist for {$existingCount} employees");
            
            return [
                'success' => true,
                'message' => "Features already extracted for {$existingCount} employees",
                'period' => $period,
                'cached' => true,
                'exists_at_count' => $existingCount,
                'elapsed_ms' => round((microtime(true) - $startTime) * 1000),
            ];
        }
        
        // Extract features
        $count = $this->featureService->calculateForAllEmployees($period);
        
        $elapsedMs = round((microtime(true) - $startTime) * 1000);
        $elapsedSecs = round($elapsedMs / 1000, 2);
        
        Log::info('✅ Feature extraction completed', [
            'period' => $period,
            'employees_processed' => $count,
            'elapsed_ms' => $elapsedMs,
            'throughput_per_sec' => round($count / $elapsedSecs, 2),
        ]);
        
        return [
            'success' => true,
            'message' => "Features extracted for {$count} employees in {$elapsedSecs}s",
            'period' => $period,
            'employee_count' => $count,
            'elapsed_ms' => $elapsedMs,
            'elapsed_seconds' => $elapsedSecs,
            'timestamp' => now()->toISOString(),
        ];
    }
    
    /**
     * Run K-Means clustering
     */
    public function runClustering(string $period, int $nClusters = 3): array
    {
        Log::info('🔬 Starting K-Means clustering', [
            'period' => $period,
            'n_clusters' => $nClusters
        ]);
        
        $startTime = microtime(true);
        
        // Prepare data for clustering
        $data = $this->mlService->prepareDataForClustering($period);
        
        // Run K-Means
        $result = $this->mlService->runKMeans(
            $data['matrix'],
            $data['labels'],
            $period,
            $nClusters
        );
        
        $elapsedMs = round((microtime(true) - $startTime) * 1000);
        $elapsedSecs = round($elapsedMs / 1000, 2);
        
        Log::info('✨ K-Means clustering completed', [
            'period' => $period,
            'silhouette_score' => $result['silhouette_score'],
            'elapsed_ms' => $elapsedMs,
        ]);
        
        return [
            'success' => true,
            'period' => $period,
            'n_clusters' => $nClusters,
            'silhouette_score' => $result['silhouette_score'],
            'centroids' => $result['centroids'],
            'cluster_assignments' => $result['cluster_assignments'],
            'elapsed_ms' => $elapsedMs,
            'elapsed_seconds' => $elapsedSecs,
        ];
    }
}

// Main execution
try {
    echo "========================================\n";
    echo "ML Pipeline Runner - SIM Kinerja\n";
    echo "========================================\n\n";
    
    $period = '2026-09';
    
    echo "Step 1: Feature Extraction\n";
    echo str_repeat('-', 40) . "\n";
    
    $runner = new MlPipelineRunner();
    
    $extractionResult = $runner->extractFeatures($period);
    print_r($extractionResult);
    
    echo "\n";
    echo "Step 2: K-Means Clustering\n";
    echo str_repeat('-', 40) . "\n";
    
    $clusteringResult = $runner->runClustering($period, 3);
    print_r($clusteringResult);
    
    echo "\n";
    echo "========================================\n";
    echo "✅ Pipeline completed successfully!\n";
    echo "========================================\n";
    
} catch (\Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}
