<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations for performance optimization (PostgreSQL compatible).
     */
    public function up(): void
    {
        // Get list of table names (returns array of strings)
        $tables = DB::connection()->getSchemaBuilder()->getTableListing();
        
        foreach ($tables as $tableName) {
            // Only process specific tables if they exist
            try {
                // employees table indexes
                if ($tableName === 'employees') {
                    $columns = DB::connection()->getSchemaBuilder()->getColumnListing('employees');
                    
                    if (in_array('division_id', $columns)) {
                        Schema::table('employees', function (Blueprint $table) {
                            $table->index('division_id');
                        });
                    }
                }
                
                if ($tableName === 'tasks') {
                    $columns = DB::connection()->getSchemaBuilder()->getColumnListing('tasks');
                    
                    if (in_array('assigned_employee_id', $columns)) {
                        Schema::table('tasks', function (Blueprint $table) {
                            $table->index('assigned_employee_id');
                        });
                    }
                    
                    if (in_array('status', $columns)) {
                        Schema::table('tasks', function (Blueprint $table) {
                            $table->index('status');
                        });
                    }
                    
                    if (in_array('deadline', $columns)) {
                        Schema::table('tasks', function (Blueprint $table) {
                            $table->index('deadline');
                        });
                    }
                }
                
                if ($tableName === 'task_submissions') {
                    $columns = DB::connection()->getSchemaBuilder()->getColumnListing('task_submissions');
                    
                    if (in_array('task_id', $columns)) {
                        Schema::table('task_submissions', function (Blueprint $table) {
                            $table->index('task_id');
                        });
                    }
                    
                    if (in_array('employee_id', $columns)) {
                        Schema::table('task_submissions', function (Blueprint $table) {
                            $table->index('employee_id');
                        });
                    }
                }
                
                if ($tableName === 'performance_evaluations') {
                    $columns = DB::connection()->getSchemaBuilder()->getColumnListing('performance_evaluations');
                    
                    if (in_array('employee_id', $columns)) {
                        Schema::table('performance_evaluations', function (Blueprint $table) {
                            $table->index('employee_id');
                        });
                    }
                }
                
                if ($tableName === 'ml_employee_feature_data') {
                    $columns = DB::connection()->getSchemaBuilder()->getColumnListing('ml_employee_feature_data');
                    
                    if (in_array('evaluation_period', $columns)) {
                        Schema::table('ml_employee_feature_data', function (Blueprint $table) {
                            $table->index(['evaluation_period']);
                        });
                    }
                }
            } catch (\Exception $e) {
                // Silently skip any errors
                \Log::warning("Index creation skipped for table: {$tableName}");
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Just drop common index patterns safely
        Schema::table('employees', function (Blueprint $table) {
            try {
                $table->dropIndex('employees_division_id_index');
            } catch (\Exception $e) {}
            
            try {
                $table->dropIndex('employees_is_active_index');
            } catch (\Exception $e) {}
            
            try {
                $table->dropIndex('employees_status_index');
            } catch (\Exception $e) {}
        });
        
        Schema::table('tasks', function (Blueprint $table) {
            try {
                $table->dropIndex('tasks_assigned_employee_id_index');
            } catch (\Exception $e) {}
            
            try {
                $table->dropIndex('tasks_status_index');
            } catch (\Exception $e) {}
            
            try {
                $table->dropIndex('tasks_deadline_index');
            } catch (\Exception $e) {}
        });
        
        Schema::table('task_submissions', function (Blueprint $table) {
            try {
                $table->dropIndex('task_submissions_task_id_index');
            } catch (\Exception $e) {}
            
            try {
                $table->dropIndex('task_submissions_employee_id_index');
            } catch (\Exception $e) {}
        });
        
        Schema::table('performance_evaluations', function (Blueprint $table) {
            try {
                $table->dropIndex('performance_evaluations_employee_id_index');
            } catch (\Exception $e) {}
        });
        
        Schema::table('ml_employee_feature_data', function (Blueprint $table) {
            try {
                $table->dropIndex('ml_employee_feature_data_evaluation_period_index');
            } catch (\Exception $e) {}
        });
    }
};
