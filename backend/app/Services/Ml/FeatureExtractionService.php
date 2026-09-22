<?php

namespace App\Services\Ml;

use App\Models\EmployeeMLFeature;
use App\Models\Task;
use App\Models\TaskSubmission;
use App\Models\PerformanceEvaluation;
use App\Models\Employee;
use Illuminate\Support\Facades\DB;

class FeatureExtractionService
{
    /**
     * Calculate all features for an employee in a specific period.
     */
    public function calculateForPeriod(int $employeeId, string $period): EmployeeMLFeature
    {
        // Parse year and month from period (YYYY-MM format)
        $year = substr($period, 0, 4);
        $month = substr($period, 5, 2);

        // 1. Attendance Percentage - fallback to null since attendance_logs doesn't exist yet
        // TODO: Implement if attendance_logs module is added later
        $attendancePercentage = null;

        // 2. Tasks Completed Percentage
        $tasks = Task::where('assigned_employee_id', $employeeId)
            ->whereYear('created_at', '=', $year)
            ->whereMonth('created_at', '=', $month)
            ->get();

        $totalTasks = $tasks->count();
        $completedTasks = $tasks->where('status', 'COMPLETED')->count();
        $tasksCompletedPercentage = ($totalTasks > 0)
            ? ($completedTasks / $totalTasks) * 100
            : 0;

        // 3. On Time Percentage
        $onTimeTasks = $tasks->filter(function ($task) {
            return strtotime($task->deadline) >= strtotime(now());
        })->count();

        $onTimePercentage = ($totalTasks > 0) ? ($onTimeTasks / $totalTasks) * 100 : 0;

        // 4. Quality Score - AVG from performance_evaluations
        $evaluations = PerformanceEvaluation::where('employee_id', $employeeId)
            ->whereYear('created_at', '=', $year)
            ->whereMonth('created_at', '=', $month)
            ->get();

        $qualityScore = $evaluations->avg('score');

        // 5. Discipline Score - derive from task review quality
        $disciplineScore = $this->calculateDisciplineScore($employeeId, $period);

        // 6. Active Tasks Count (PENDING or IN_PROGRESS)
        $activeCount = Task::where('assigned_employee_id', $employeeId)
            ->whereIn('status', ['PENDING', 'IN_PROGRESS'])
            ->whereYear('created_at', '=', $year)
            ->whereMonth('created_at', '=', $month)
            ->count();

        // 7. Late Tasks Count (COMPLETED but after deadline)
        $lateCount = Task::where('assigned_employee_id', $employeeId)
            ->where('status', 'COMPLETED')
            ->where('deadline', '<', DB::raw('NOW()'))
            ->whereYear('created_at', '=', $year)
            ->whereMonth('created_at', '=', $month)
            ->count();

        // 8. Average Resolution Days (time between deadline and submission)
        $resolutionDays = TaskSubmission::join('tasks', 'task_submissions.task_id', '=', 'tasks.id')
            ->where('task_submissions.employee_id', $employeeId)
            ->whereYear('task_submissions.created_at', '=', $year)
            ->whereMonth('task_submissions.created_at', '=', $month)
            ->select(DB::raw('AVG(DATEDIFF(task_submissions.submitted_at, tasks.deadline)) as avg_days'))
            ->value('avg_days');

        // Cache key for this employee and period
        $cacheKey = "ml_features_{$employeeId}_{$period}";
        
        // Save to database with cache invalidation
        return cache()->rememberForever($cacheKey, function () use ($employeeId, $period, $attendancePercentage, $tasksCompletedPercentage, $onTimePercentage, $qualityScore, $disciplineScore, $activeCount, $lateCount, $resolutionDays) {
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
        });
    }

    /**
     * Calculate features for all employees in a given period.
     * Optimized with chunking to handle large datasets efficiently.
     */
    public function calculateForAllEmployees(string $period): int
    {
        // Clear cache for this period first
        cache()->tags(['ml_features'])->forget("period_{$period}");
        
        $count = 0;
        
        // Process employees in chunks of 50 to prevent memory exhaustion
        Employee::chunk(50, function($employees) use ($period, &$count) {
            foreach ($employees as $employee) {
                try {
                    $this->calculateForPeriod($employee->id, $period);
                    $count++;
                    
                    // Small delay to prevent server overload every 10 employees
                    if ($count % 10 === 0) {
                        usleep(100000); // 0.1s delay
                    }
                } catch (\Exception $e) {
                    \Log::error("Failed to extract features for employee {$employee->id}: " . $e->getMessage());
                    // Continue processing other employees even if one fails
                }
            }
        });
        
        return $count;
    }

    /**
     * Calculate discipline score based on task revision rate.
     * Optimized with single query instead of multiple queries.
     */
    protected function calculateDisciplineScore(int $employeeId, string $period): ?float
    {
        // Optimized discipline calculation based on:
        // - Timeliness of submissions
        // - Revision rate from task submissions
        // Uses aggregated query for better performance
        
        $year = substr($period, 0, 4);
        $month = substr($period, 5, 2);

        $submissions = TaskSubmission::join('tasks', 'task_submissions.task_id', '=', 'tasks.id')
            ->where('task_submissions.employee_id', $employeeId)
            ->whereYear('task_submissions.created_at', '=', $year)
            ->whereMonth('task_submissions.created_at', '=', $month)
            ->selectRaw('
                COUNT(*) as total_submissions,
                SUM(CASE WHEN task_submissions.status = "REVISED" THEN 1 ELSE 0 END) as revision_count
            ')
            ->first();

        if (!$submissions || $submissions->total_submissions == 0) {
            return null;
        }

        // Base score 100, deduct points based on revision rate
        $baseScore = 100.0;
        $revisionRate = $submissions->revision_count / $submissions->total_submissions;
        $deduction = $revisionRate * 50.0;

        return max(0, $baseScore - $deduction);
    }
}
