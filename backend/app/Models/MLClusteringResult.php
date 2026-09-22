<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

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

    /**
     * Get the cluster assignments for this clustering result.
     */
    public function clusters(): HasMany
    {
        return $this->hasMany(MLEmployeeCluster::class);
    }
}
