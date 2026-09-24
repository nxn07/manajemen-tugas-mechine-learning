<?php

namespace App\Services\Ml;

use App\Models\EmployeeMLFeature;
use App\Models\MLClusteringResult;
use App\Models\MLEmployeeCluster;
use App\Models\Employee;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Process;

class MLProcessingService
{
    /**
     * Prepare feature data for clustering algorithm.
     */
    public function prepareDataForClustering(string $period): array
    {
        // Load all feature data for the specified period
        $features = EmployeeMLFeature::where('evaluation_period', $period)
            ->with('employee')
            ->get();

        if ($features->count() < 5) {
            throw new \Exception("Minimum 5 employees required for meaningful clustering");
        }

        // Build feature matrix and labels
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
            $labels[] = $feature->employee->full_name ?? ('Karyawan ' . $feature->employee_id);
        }

        // Prepare output structure with metadata
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

        // Export to JSON file for Python processing
        $filePath = storage_path("app/ml_input_{$period}.json");
        file_put_contents($filePath, json_encode($data, JSON_PRETTY_PRINT));

        return ['path' => $filePath, 'employee_count' => $features->count()];
    }

    /**
     * Run K-Means clustering using Python script (works in both Docker and local).
     */
    public function runKMeans(string $period, int $nClusters = 3): MLClusteringResult
    {
        // Step 1: Prepare input data
        $inputPath = $this->prepareDataForClustering($period)['path'];

        // Step 2: Run Python ML processing script
        $pythonScript = base_path('python/ml_processor.py');
        if (!file_exists($pythonScript)) {
            $pythonScript = storage_path('app/python/ml_processor.py');
        }

        if (!file_exists($pythonScript)) {
            throw new \Exception("Python ML processor script not found at: {$pythonScript}");
        }

        // Detect python binary
        $pythonBin = trim(shell_exec('which python3 2>/dev/null') ?: (shell_exec('which python 2>/dev/null') ?: 'python3'));

        $process = Process::timeout(120)->run([
            $pythonBin,
            $pythonScript,
            $inputPath,
            (string) $nClusters,
        ]);

        if (!$process->successful()) {
            throw new \Exception("ML processing failed:\n" . ($process->stderr() ?: $process->output()));
        }
        
        \Log::info('ML Processing Output:', ['output' => $process->output()]);

        // Step 3: Parse results from output JSON
        $resultsPath = str_replace('.json', '_output.json', $inputPath);
        
        if (!file_exists($resultsPath)) {
            throw new \Exception("Python script did not generate output file: {$resultsPath}");
        }

        $resultsJson = file_get_contents($resultsPath);
        $results = json_decode($resultsJson, true);

        if (!isset($results['silhouette_score'], $results['centroids'], $results['cluster_assignments'])) {
            throw new \Exception("Invalid output format from Python script. Raw JSON: {$resultsJson}");
        }

        // Step 4: Store clustering result in database
        $clusteringResult = MLClusteringResult::create([
            'evaluation_period' => $period,
            'n_clusters' => $nClusters,
            'silhouette_score' => $results['silhouette_score'],
            'centroids' => $results['centroids'],
            'feature_names' => $results['feature_names'],
            'processed_at' => now(),
        ]);

        // Step 5: Store employee-cluster mappings
        foreach ($results['cluster_assignments'] as $assignment) {
            $employee = Employee::where('full_name', $assignment['label'])->first();

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
