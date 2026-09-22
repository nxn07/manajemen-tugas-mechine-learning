<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. ML Employee Feature Data - stores calculated features per employee per period
        Schema::create('ml_employee_feature_data', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->string('evaluation_period'); // YYYY-MM format
            $table->decimal('attendance_percentage', 5, 2)->nullable();
            $table->decimal('tasks_completed_percentage', 5, 2)->nullable();
            $table->decimal('on_time_percentage', 5, 2)->nullable();
            $table->decimal('quality_score', 5, 2)->nullable(); // AVG from evaluations
            $table->decimal('discipline_score', 5, 2)->nullable(); // Derive from task reviews
            $table->integer('active_tasks_count')->default(0);
            $table->integer('late_tasks_count')->default(0);
            $table->decimal('avg_resolution_days', 5, 2)->nullable();
            $table->timestamps();

            $table->index(['employee_id', 'evaluation_period']);
            $table->index('evaluation_period');
        });

        // 2. ML Clustering Results - stores centroid & evaluation metrics per run
        Schema::create('ml_clustering_results', function (Blueprint $table) {
            $table->id();
            $table->string('evaluation_period');
            $table->integer('n_clusters')->default(3);
            $table->decimal('silhouette_score', 5, 4)->nullable();
            $table->json('centroids'); // Store cluster center points
            $table->json('feature_names'); // List of features used
            $table->timestamp('processed_at');
            $table->index('evaluation_period');
        });

        // 3. ML Employee Clusters - employee-cluster mapping
        Schema::create('ml_employee_clusters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->foreignId('clustering_result_id')->constrained('ml_clustering_results')->onDelete('cascade');
            $table->integer('cluster_assignment'); // 0, 1, or 2
            $table->decimal('distance_to_centroid', 10, 4)->nullable();
            $table->timestamps();
            $table->index(['clustering_result_id', 'employee_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ml_employee_clusters');
        Schema::dropIfExists('ml_clustering_results');
        Schema::dropIfExists('ml_employee_feature_data');
    }
};
