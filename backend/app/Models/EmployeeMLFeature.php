<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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

    /**
     * Get the employee that owns this feature data.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
