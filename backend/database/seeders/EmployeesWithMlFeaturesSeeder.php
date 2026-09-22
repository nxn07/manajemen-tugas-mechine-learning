<?php

namespace Database\Seeders;

use App\Models\Division;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class EmployeesWithMlFeaturesSeeder extends Seeder
{
    /**
     * Run the database seeds with dynamic column detection.
     */
    public function run(): void
    {
        \Log::info('🚀 Starting Employee Seeding with Dynamic Column Detection');
        
        // Clear old ML data if exists
        $this->clearOldData();
        
        // Check existing employee count
        $existingCount = DB::table('employees')->count();
        
        if ($existingCount >= 33) {
            \Log::info("✅ Already have {$existingCount} employees");
            return;
        }
        
        // Get available columns dynamically
        $employeeColumns = $this->getEmployeeColumns();
        $taskColumns = $this->getTaskColumns();
        $submissionColumns = $this->getSubmissionColumns();
        $evalColumns = $this->getEvalColumns();
        
        \Log::info("Detected columns - Employees: " . implode(', ', array_keys($employeeColumns)));
        
        // Create divisions first
        $divisions = $this->createDivisions();
        
        // Generate employees
        $period = now()->format('Y-m');
        $currentCount = DB::table('employees')->count();
        
        while ($currentCount < 33 && !empty($divisions)) {
            foreach ($divisions as $index => $division) {
                if ($currentCount >= 33) break;
                
                $currentCount++;
                
                try {
                    $employeeData = $this->generateEmployeeData(
                        $currentCount, 
                        $division,
                        $employeeColumns
                    );
                    
                    DB::table('employees')->insert($employeeData);
                    $employeeId = DB::table('employees')->orderBy('id', 'desc')->value('id');
                    
                    \Log::info("Created employee #{$currentCount}: ID={$employeeId}");
                    
                    // Create tasks for employee
                    $taskId = $this->createTasksForEmployee(
                        $employeeId,
                        $period,
                        $taskColumns
                    );
                    
                    // Create evaluations
                    $this->createEvaluations(
                        $employeeId,
                        $period,
                        $evalColumns
                    );
                    
                    // Save ML features
                    $this->saveMLFeatures($employeeId, $period);
                    
                } catch (\Exception $e) {
                    \Log::error("Failed to create employee {$currentCount}: " . $e->getMessage());
                    break 2;
                }
            }
            
            // Recount after each division loop
            $currentCount = DB::table('employees')->count();
        }
        
        $finalCount = DB::table('employees')->count();
        
        \Log::info("========================");
        \Log::info("✅ SEEDING COMPLETE!");
        \Log::info("Total employees: {$finalCount}");
        \Log::info("========================");
    }
    
    /**
     * Clear old data safely
     */
    protected function clearOldData(): void
    {
        $tables = ['ml_employee_feature_data', 'ml_clustering_results', 'ml_employee_clusters'];
        
        foreach ($tables as $table) {
            try {
                DB::table($table)->delete();
                \Log::info("✓ Cleared {$table}");
            } catch (\Exception $e) {
                \Log::warning("Could not clear {$table}");
            }
        }
    }
    
    /**
     * Get available columns for employees table
     */
    protected function getEmployeeColumns(): array
    {
        $columns = DB::connection()->getSchemaBuilder()->getColumnListing('employees');
        
        $mapping = [
            'id' => 'id',
            'name' => 'name',
            'email' => 'email',
            'phone' => 'phone',
            'position' => 'position',
            'division_id' => 'division_id',
            'is_active' => 'is_active',
            'birthday' => 'birthday',
            'hire_date' => 'hire_date',
            'password' => 'password',
            'created_at' => 'created_at',
            'updated_at' => 'updated_at',
        ];
        
        // Remove columns that don't exist
        $result = [];
        foreach ($mapping as $key => $columnName) {
            if (in_array($columnName, $columns)) {
                $result[$key] = $columnName;
            } else {
                \Log::warning("Column '{$columnName}' not found in employees table");
            }
        }
        
        return $result;
    }
    
    /**
     * Get task columns
     */
    protected function getTaskColumns(): array
    {
        $columns = DB::connection()->getSchemaBuilder()->getColumnListing('tasks');
        
        $mapping = [
            'id' => 'id',
            'title' => 'title',
            'description' => 'description',
            'priority' => 'priority',
            'status' => 'status',
            'assigned_employee_id' => 'assigned_employee_id',
            'created_by' => 'created_by',
            'deadline' => 'deadline',
            'created_at' => 'created_at',
            'updated_at' => 'updated_at',
        ];
        
        $result = [];
        foreach ($mapping as $key => $colName) {
            if (in_array($colName, $columns)) {
                $result[$key] = $colName;
            }
        }
        
        return $result;
    }
    
    /**
     * Get submission columns
     */
    protected function getSubmissionColumns(): array
    {
        $columns = DB::connection()->getSchemaBuilder()->getColumnListing('task_submissions');
        
        $mapping = [
            'task_id' => 'task_id',
            'employee_id' => 'employee_id',
            'status' => 'status',
            'submitted_at' => 'submitted_at',
            'reviewed_at' => 'reviewed_at',
            'review_comment' => 'review_comment',
            'file_url' => 'file_url',
            'file_name' => 'file_name',
            'created_at' => 'created_at',
            'updated_at' => 'updated_at',
        ];
        
        $result = [];
        foreach ($mapping as $key => $colName) {
            if (in_array($colName, $columns)) {
                $result[$key] = $colName;
            }
        }
        
        return $result;
    }
    
    /**
     * Get evaluation columns
     */
    protected function getEvalColumns(): array
    {
        $columns = DB::connection()->getSchemaBuilder()->getColumnListing('performance_evaluations');
        
        $mapping = [
            'employee_id' => 'employee_id',
            'manager_id' => 'manager_id',
            'score' => 'score',
            'comments' => 'comments',
            'created_at' => 'created_at',
            'updated_at' => 'updated_at',
        ];
        
        $result = [];
        foreach ($mapping as $key => $colName) {
            if (in_array($colName, $columns)) {
                $result[$key] = $colName;
            }
        }
        
        return $result;
    }
    
    /**
     * Create divisions
     */
    protected function createDivisions(): array
    {
        $divisions = [
            ['name' => 'IT Department', 'description' => 'Information Technology'],
            ['name' => 'Human Resources', 'description' => 'HR Department'],
            ['name' => 'Finance & Accounting', 'description' => 'Financial Operations'],
            ['name' => 'Operations', 'description' => 'Business Operations'],
        ];
        
        foreach ($divisions as $div) {
            Division::firstOrCreate(
                ['name' => $div['name']],
                ['description' => $div['description']]
            );
        }
        
        return Division::all()->toArray();
    }
    
    /**
     * Generate employee data with correct columns
     */
    protected function generateEmployeeData(int $id, array $division, array $columns): array
    {
        $data = [];
        
        if (isset($columns['id'])) {
            $data[$columns['id']] = $id;
        }
        
        if (isset($columns['name'])) {
            $data[$columns['name']] = $this->getRandomFullName();
        }
        
        if (isset($columns['email'])) {
            $data[$columns['email']] = "employee{$id}@centralsaga.com";
        }
        
        if (isset($columns['phone'])) {
            $data[$columns['phone']] = '08' . rand(10000000, 99999999);
        }
        
        if (isset($columns['position'])) {
            $data[$columns['position']] = $this->getRandomPosition($division['id'] % 4);
        }
        
        if (isset($columns['division_id'])) {
            $data[$columns['division_id']] = $division['id'];
        }
        
        if (isset($columns['is_active'])) {
            $data[$columns['is_active']] = true;
        }
        
        if (isset($columns['birthday'])) {
            $data[$columns['birthday']] = now()->subYears(rand(22, 50))->toDateString();
        }
        
        if (isset($columns['hire_date'])) {
            $data[$columns['hire_date']] = now()->subYears(rand(1, 5))->toDateString();
        }
        
        if (isset($columns['password'])) {
            $data[$columns['password']] = bcrypt('password123');
        }
        
        if (isset($columns['created_at'])) {
            $data[$columns['created_at']] = now()->subMonths(rand(1, 6));
        }
        
        if (isset($columns['updated_at'])) {
            $data[$columns['updated_at']] = now();
        }
        
        return $data;
    }
    
    /**
     * Create tasks for employee
     */
    protected function createTasksForEmployee(int $employeeId, string $period, array $columns): int|null
    {
        try {
            $numTasks = rand(5, 10);
            $createdTaskIds = [];
            
            for ($i = 0; $i < $numTasks; $i++) {
                $taskData = [];
                
                if (isset($columns['id'])) {
                    $taskData[$columns['id']] = null;
                }
                
                if (isset($columns['title'])) {
                    $taskData[$columns['title']] = $this->getRandomTaskTitle() . ' #' . ($i + 1);
                }
                
                if (isset($columns['description'])) {
                    $taskData[$columns['description']] = 'Sample task description';
                }
                
                if (isset($columns['priority'])) {
                    $taskData[$columns['priority']] = ['high', 'medium', 'low'][$i % 3];
                }
                
                if (isset($columns['status'])) {
                    $taskData[$columns['status']] = ['COMPLETED', 'IN_PROGRESS', 'PENDING'][$i % 3];
                }
                
                if (isset($columns['assigned_employee_id'])) {
                    $taskData[$columns['assigned_employee_id']] = $employeeId;
                }
                
                if (isset($columns['created_by'])) {
                    $taskData[$columns['created_by']] = 1;
                }
                
                if (isset($columns['deadline'])) {
                    $deadline = Carbon::parse($period . '-15')->addDays(rand(1, 14));
                    $taskData[$columns['deadline']] = $deadline->toDateTimeString();
                }
                
                if (isset($columns['created_at'])) {
                    $createdAt = Carbon::parse($period . '-01')->addHours(rand(0, 720));
                    $taskData[$columns['created_at']] = $createdAt;
                }
                
                if (isset($columns['updated_at'])) {
                    $taskData[$columns['updated_at']] = now();
                }
                
                $taskDataId = DB::table('tasks')->insertGetId($taskData);
                
                // Create submission for completed tasks
                if ($taskDataId && $taskData['status'] ?? '' === 'COMPLETED') {
                    $this->createTaskSubmission($taskDataId, $employeeId);
                }
                
                $createdTaskIds[] = $taskDataId;
            }
            
            return $createdTaskIds[array_rand($createdTaskIds)] ?? null;
            
        } catch (\Exception $e) {
            \Log::error("Failed to create tasks: " . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Create task submission
     */
    protected function createTaskSubmission(int $taskId, int $employeeId): void
    {
        try {
            $submissionData = [];
            $submissionCols = $this->getSubmissionColumns();
            
            if (isset($submissionCols['task_id'])) {
                $submissionData[$submissionCols['task_id']] = $taskId;
            }
            
            if (isset($submissionCols['employee_id'])) {
                $submissionData[$submissionCols['employee_id']] = $employeeId;
            }
            
            if (isset($submissionCols['status'])) {
                $submissionData[$submissionCols['status']] = ['APPROVED', 'REJECTED'][rand(0, 1)];
            }
            
            if (isset($submissionCols['submitted_at'])) {
                $submissionData[$submissionCols['submitted_at']] = Carbon::now()->subHours(rand(1, 168));
            }
            
            if (isset($submissionCols['reviewed_at'])) {
                $reviewDate = Carbon::now()->subHours(rand(1, 168));
                $submissionData[$submissionCols['reviewed_at']] = $reviewDate;
            }
            
            if (isset($submissionCols['review_comment'])) {
                $submissionData[$submissionCols['review_comment']] = 'Good work!';
            }
            
            if (isset($submissionCols['created_at'])) {
                $submissionData[$submissionCols['created_at']] = now()->subHours(rand(1, 168));
            }
            
            if (isset($submissionCols['updated_at'])) {
                $submissionData[$submissionCols['updated_at']] = now();
            }
            
            DB::table('task_submissions')->insert($submissionData);
            
        } catch (\Exception $e) {
            // Silently fail
        }
    }
    
    /**
     * Create performance evaluations
     */
    protected function createEvaluations(int $employeeId, string $period, array $columns): void
    {
        try {
            $numEvals = rand(1, 2);
            
            for ($i = 0; $i < $numEvals; $i++) {
                $evalData = [];
                
                if (isset($columns['employee_id'])) {
                    $evalData[$columns['employee_id']] = $employeeId;
                }
                
                if (isset($columns['manager_id'])) {
                    $evalData[$columns['manager_id']] = 1;
                }
                
                if (isset($columns['score'])) {
                    $evalData[$columns['score']] = round(rand(60, 95), 1);
                }
                
                if (isset($columns['comments'])) {
                    $evalData[$columns['comments']] = $this->getRandomFeedback();
                }
                
                if (isset($columns['created_at'])) {
                    $evalData[$columns['created_at']] = Carbon::parse($period . '-15')
                        ->addDays(rand(-7, 7));
                }
                
                if (isset($columns['updated_at'])) {
                    $evalData[$columns['updated_at']] = evalData[$columns['created_at']] ?? now();
                }
                
                DB::table('performance_evaluations')->insert($evalData);
            }
            
        } catch (\Exception $e) {
            // Silently fail
        }
    }
    
    /**
     * Save ML features
     */
    protected function saveMLFeatures(int $employeeId, string $period): void
    {
        try {
            $year = substr($period, 0, 4);
            $month = substr($period, 5, 2);
            
            $totalTasks = DB::table('tasks')
                ->where('assigned_employee_id', $employeeId)
                ->whereYear('created_at', '=', $year)
                ->whereMonth('created_at', '=', $month)
                ->count();
            
            $completedTasks = DB::table('tasks')
                ->where('assigned_employee_id', $employeeId)
                ->where('status', 'COMPLETED')
                ->whereYear('created_at', '=', $year)
                ->whereMonth('created_at', '=', $month)
                ->count();
            
            $qualityScore = DB::table('performance_evaluations')
                ->where('employee_id', $employeeId)
                ->avg('score') ?? 75.0;
            
            DB::table('ml_employee_feature_data')->insert([
                'employee_id' => $employeeId,
                'evaluation_period' => $period,
                'attendance_percentage' => rand(80, 100),
                'tasks_completed_percentage' => $totalTasks > 0 ? ($completedTasks / $totalTasks) * 100 : 0,
                'on_time_percentage' => rand(60, 100),
                'quality_score' => $qualityScore,
                'discipline_score' => rand(70, 95),
                'active_tasks_count' => rand(0, 5),
                'late_tasks_count' => rand(0, 3),
                'avg_resolution_days' => round(rand(1, 5), 2),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            
        } catch (\Exception $e) {
            \Log::error("Failed to save ML features: " . $e->getMessage());
        }
    }
    
    /**
     * Helper methods
     */
    protected function getRandomFullName(): string
    {
        $firstNames = ['Ahmad', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fajar', 'Gina', 'Hendra', 'Indah', 'Joko'];
        $lastNames = ['Santoso', 'Pratama', 'Wijaya', 'Kusuma', 'Nugraha', 'Adji', 'Setiawan', 'Budiman'];
        
        return $firstNames[array_rand($firstNames)] . ' ' . $lastNames[array_rand($lastNames)];
    }
    
    protected function getRandomPosition(int $index): string
    {
        $positions = [
            ['Software Engineer', 'Frontend Developer', 'Backend Developer'],
            ['HR Manager', 'Recruiter', 'Training Specialist'],
            ['Accountant', 'Financial Analyst', 'Tax Specialist'],
            ['Operations Manager', 'Business Analyst', 'Project Coordinator']
        ];
        
        return $positions[$index % count($positions)][array_rand($positions[$index % count($positions)])];
    }
    
    protected function getRandomTaskTitle(): string
    {
        $titles = ['Develop feature', 'Fix bug', 'Write doc', 'Code review', 'Deploy app'];
        return $titles[array_rand($titles)];
    }
    
    protected function getRandomFeedback(): string
    {
        $feedbacks = ['Excellent!', 'Good job', 'Solid work', 'Keep it up', 'Well done'];
        return $feedbacks[array_rand($feedbacks)];
    }
}
