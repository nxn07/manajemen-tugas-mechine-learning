<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\MLClusteringResult;
use App\Models\MLEmployeeCluster;
use App\Models\Employee;
use App\Services\Ml\FeatureExtractionService;
use App\Services\Ml\MLProcessingService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

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
        
        // Set longer timeouts for ML operations
        set_time_limit(config('app.api_timeout.ml_extraction'));
        ini_set('memory_limit', '512M');
    }

    /**
     * Extract features for all employees with progress tracking.
     * POST /api/v1/ml/extract-features
     */
    public function extractFeatures(Request $request): JsonResponse
    {
        $startTime = microtime(true);
        $period = $request->input('period', now()->format('Y-m'));
        
        Log::info('🚀 Starting feature extraction', ['period' => $period]);
        
        try {
            // Check if data already exists
            $existingCount = \DB::table('ml_employee_feature_data')
                ->where('evaluation_period', $period)
                ->count();
            
            if ($existingCount > 0) {
                Log::info("✨ Features already exist for {$existingCount} employees");
                
                return response()->json([
                    'success' => true,
                    'message' => "Features already extracted for {$existingCount} employees",
                    'period' => $period,
                    'cached' => true,
                    'exists_at_count' => $existingCount,
                    'elapsed_ms' => round((microtime(true) - $startTime) * 1000),
                ]);
            }
            
            // Extract features with progress tracking
            $count = $this->featureService->calculateForAllEmployees($period);
            
            $elapsedMs = round((microtime(true) - $startTime) * 1000);
            $elapsedSecs = round($elapsedMs / 1000, 2);
            
            Log::info('✅ Feature extraction completed', [
                'period' => $period,
                'employees_processed' => $count,
                'elapsed_ms' => $elapsedMs,
                'throughput_per_sec' => round($count / $elapsedSecs, 2),
            ]);
            
            return response()->json([
                'success' => true,
                'message' => "Features extracted for {$count} employees in {$elapsedSecs}s",
                'period' => $period,
                'employee_count' => $count,
                'elapsed_ms' => $elapsedMs,
                'elapsed_seconds' => $elapsedSecs,
                'timestamp' => now()->toISOString(),
            ]);
            
        } catch (\Exception $e) {
            $elapsedMs = round((microtime(true) - $startTime) * 1000);
            
            Log::error('❌ Feature extraction failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'elapsed_ms' => $elapsedMs,
            ]);
            
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'debug' => config('app.debug') ? $e->getTrace() : null,
                'elapsed_ms' => $elapsedMs,
            ], 500);
        }
    }

    /**
     * Run K-Means clustering algorithm with timeout monitoring.
     * POST /api/v1/ml/run-clustering
     */
    public function runClustering(Request $request): JsonResponse
    {
        $startTime = microtime(true);
        $period = $request->input('period', now()->format('Y-m'));
        $nClusters = (int) $request->input('n_clusters', 3);
        
        // Check if feature data exists, auto-extract if empty
        $featuresCount = \DB::table('ml_employee_feature_data')
            ->where('evaluation_period', $period)
            ->count();
        
        if ($featuresCount === 0) {
            Log::info("Features not found for period {$period}, auto-extracting now...");
            $this->featureService->calculateForAllEmployees($period);
            $featuresCount = \DB::table('ml_employee_feature_data')
                ->where('evaluation_period', $period)
                ->count();
        }

        if ($featuresCount === 0) {
            return response()->json([
                'success' => false,
                'message' => "Tidak ada data karyawan yang dapat diekstrak fiturnya untuk periode {$period}.",
            ], 400);
        }
        
        Log::info('🤖 Starting K-Means clustering', [
            'period' => $period,
            'n_clusters' => $nClusters,
            'employees_available' => $featuresCount,
        ]);
        
        try {
            // Execute clustering with timeout monitoring
            $result = $this->processingService->runKMeans($period, $nClusters);
            
            $elapsedMs = round((microtime(true) - $startTime) * 1000);
            $elapsedSecs = round($elapsedMs / 1000, 2);
            
            Log::info('✅ Clustering completed', [
                'period' => $period,
                'clustering_result_id' => $result->id,
                'silhouette_score' => $result->silhouette_score,
                'elapsed_ms' => $elapsedMs,
                'quality_rating' => $result->silhouette_score >= 0.7 ? 'excellent' : 
                                   ($result->silhouette_score >= 0.5 ? 'good' : 'moderate'),
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Clustering completed successfully in ' . $elapsedSecs . 's',
                'data' => [
                    'clustering_result_id' => $result->id,
                    'period' => $result->evaluation_period,
                    'n_clusters' => $result->n_clusters,
                    'silhouette_score' => $result->silhouette_score,
                    'quality_interpretation' => $this->interpretQuality($result->silhouette_score),
                    'processed_at' => $result->processed_at->toISOString(),
                ],
                'performance' => [
                    'elapsed_ms' => $elapsedMs,
                    'elapsed_seconds' => $elapsedSecs,
                    'features_processed' => $featuresCount,
                ],
                'next_steps' => [
                    'view_results' => "GET /api/v1/ml/clusters/{$period}",
                    'export_csv' => "Use frontend to export results",
                ],
            ]);
            
        } catch (\Exception $e) {
            $elapsedMs = round((microtime(true) - $startTime) * 1000);
            
            Log::error('❌ Clustering failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'elapsed_ms' => $elapsedMs,
            ]);
            
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'period' => $period,
                'n_clusters' => $nClusters,
                'elapsed_ms' => $elapsedMs,
                'retry_hint' => "Check backend logs at storage/logs/laravel.log",
            ], 500);
        }
    }

    /**
     * Get clustering results for a specific period.
     * GET /api/v1/ml/clusters/{period}
     */
    public function getClusters(string $period): JsonResponse
    {
        $startTime = microtime(true);
        
        if ($period === 'latest' || $period === 'current') {
            $result = MLClusteringResult::with('clusters.employee')
                ->orderBy('processed_at', 'desc')
                ->first();
            if ($result) {
                $period = $result->evaluation_period;
            }
        } else {
            $result = MLClusteringResult::where('evaluation_period', $period)
                ->with('clusters.employee')
                ->orderBy('processed_at', 'desc')
                ->first();
        }

        // If not found, attempt auto-extract features and run clustering
        if (!$result) {
            $featuresExists = \DB::table('ml_employee_feature_data')
                ->where('evaluation_period', $period)
                ->exists();
            
            if (!$featuresExists) {
                try {
                    $this->featureService->calculateForAllEmployees($period);
                    $featuresExists = \DB::table('ml_employee_feature_data')
                        ->where('evaluation_period', $period)
                        ->exists();
                } catch (\Exception $e) {
                    Log::warning('Feature auto-extraction error: ' . $e->getMessage());
                }
            }

            if ($featuresExists) {
                try {
                    $this->processingService->runKMeans($period, 3);
                    $result = MLClusteringResult::where('evaluation_period', $period)
                        ->with('clusters.employee')
                        ->orderBy('processed_at', 'desc')
                        ->first();
                } catch (\Exception $e) {
                    Log::warning('Auto clustering in getClusters failed: ' . $e->getMessage());
                }
            }
        }

        // Fallback to latest available clustering result
        if (!$result) {
            $result = MLClusteringResult::with('clusters.employee')
                ->orderBy('processed_at', 'desc')
                ->first();
            if ($result) {
                $period = $result->evaluation_period;
            }
        }

        if (!$result) {
            return response()->json([
                'success' => false,
                'message' => "Belum ada data clustering yang tersedia di sistem.",
            ], 404);
        }

        // Group employees by cluster
        $clusterGroups = [];
        foreach ($result->clusters as $clusterMember) {
            $clusterId = $clusterMember->cluster_assignment;
            if (!isset($clusterGroups[$clusterId])) {
                $clusterGroups[$clusterId] = [];
            }
            
            $clusterGroups[$clusterId][] = [
                'employee_id' => $clusterMember->employee->id,
                'name' => $clusterMember->employee->full_name ?? $clusterMember->employee->name ?? 'N/A',
                'position' => $clusterMember->employee->position,
                'division' => $clusterMember->employee->division->name ?? 'N/A',
                'distance_to_centroid' => (float) $clusterMember->distance_to_centroid,
            ];
        }

        // Generate interpretation
        $interpretations = $this->interpretClusters($result->centroids);

        $elapsedMs = round((microtime(true) - $startTime) * 1000);
        
        Log::info('✅ Cluster results retrieved', [
            'period' => $period,
            'clusters_found' => count($clusterGroups),
            'elapsed_ms' => $elapsedMs,
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'period' => $result->evaluation_period,
                'n_clusters' => $result->n_clusters,
                'silhouette_score' => (float) $result->silhouette_score,
                'centroids' => $result->centroids,
                'interpretations' => $interpretations,
                'clusters' => $clusterGroups,
                'cluster_distribution' => array_map('count', $clusterGroups),
                'quality_interpretation' => $this->interpretQuality((float) $result->silhouette_score),
                'quality_rating' => $this->interpretQuality((float) $result->silhouette_score),
            ],
            'metadata' => [
                'fetched_at' => now()->toISOString(),
                'fetch_elapsed_ms' => $elapsedMs,
                'total_employees' => array_sum(array_map('count', $clusterGroups)),
            ]
        ]);
    }

    /**
     * Interpret quality based on silhouette score.
     */
    protected function interpretQuality(float $score): string
    {
        if ($score >= 0.7) return "Excellent clustering - strong, well-separated clusters";
        if ($score >= 0.5) return "Good clustering - reasonable structure detected";
        if ($score >= 0.4) return "Moderate clustering - weak structure, consider different k";
        return "Poor clustering - data may not have clear cluster structure";
    }

    /**
     * Interpret cluster characteristics based on centroid values.
     */
    protected function interpretClusters(array $centroids): array
    {
        $interpretations = [];
        
        if (empty($centroids)) {
            return $interpretations;
        }
        
        $centroidsArray = is_array($centroids[0]) ? $centroids : [$centroids];
        
        foreach ($centroidsArray as $clusterId => $centroid) {
            $avgScore = 0;
            
            if (!empty($centroid)) {
                // Average of first 5 positive features (attendance, task completed, on time, quality, discipline)
                $positiveFeatures = min(5, count($centroid));
                $sum = array_sum(array_slice($centroid, 0, $positiveFeatures));
                $rawAvg = $sum / $positiveFeatures;
                $avgScore = $rawAvg > 1.0 ? $rawAvg : ($rawAvg * 100);
            }
            
            if ($avgScore >= 80) {
                $interpretations[$clusterId] = "Kinerja Tinggi & Beban Terkendali (Kandidat Utama)";
            } elseif ($avgScore >= 65) {
                $interpretations[$clusterId] = "Kinerja Baik & Beban Tinggi (Perlu Evaluasi Beban)";
            } else {
                $interpretations[$clusterId] = "Kinerja Perlu Ditingkatkan (Butuh Pendampingan)";
            }
        }
        
        return $interpretations;
    }
}
