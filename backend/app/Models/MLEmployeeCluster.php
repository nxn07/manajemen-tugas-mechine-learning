<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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

    /**
     * Get the employee in this cluster assignment.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Get the clustering result this belongs to.
     */
    public function clusteringResult(): BelongsTo
    {
        return $this->belongsTo(MLClusteringResult::class);
    }
}
