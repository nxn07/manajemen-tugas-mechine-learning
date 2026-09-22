<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\Ml\FeatureExtractionService;
use App\Services\Ml\MLProcessingService;

class RunMLClusteringCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'ml:cluster {--period=} {--clusters=3}';

    /**
     * The console command description.
     */
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

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $period = $this->option('period') ?? now()->format('Y-m');
        $nClusters = (int) $this->option('clusters');

        $this->info("Starting ML Clustering for period: {$period}");
        $this->newLine();

        // Extract features
        $this->task('Extracting features', function () use ($period) {
            $count = $this->featureService->calculateForAllEmployees($period);
            $this->info("✓ Features extracted for {$count} employees");
            return true;
        });

        $this->newLine();

        // Run clustering
        $this->task('Running K-Means clustering', function () use ($period, $nClusters) {
            $result = $this->processingService->runKMeans($period, $nClusters);

            $this->info("✓ Clustering completed");
            $this->info("  - Silhouette Score: {$result->silhouette_score}");
            $this->info("  - Clusters: {$result->n_clusters}");
            $this->info("  - Processed at: {$result->processed_at}");

            return true;
        });

        $this->newLine();
        $this->info("ML Clustering completed successfully!");

        return Command::SUCCESS;
    }

    /**
     * Execute a task with progress indicator.
     */
    protected function task(string $label, callable $callback): void
    {
        $this->output->progressStart(1);
        $this->output->write("{$label}... ");
        
        try {
            $result = $callback();
            $this->output->progressFinish();
        } catch (\Exception $e) {
            $this->output->progressFinish();
            $this->error("✗ Failed: {$e->getMessage()}");
            throw $e;
        }
    }
}
