<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SimpleEmployeeSeeder extends Seeder
{
    public function run(): void
    {
        echo "\n🚀 SIMPLE EMPLOYEE SEEDING STARTED\n\n";
        
        // Get current count
        $current = DB::table('employees')->count();
        echo "Current employees: {$current}\n\n";
        
        if ($current >= 33) {
            echo "✅ ALREADY HAVE 33+ EMPLOYEES!\n";
            echo "Total: " . DB::table('employees')->count() . "\n";
            return;
        }
        
        // Generate 33 total employees
        $target = 33;
        
        for ($i = $current + 1; $i <= $target; $i++) {
            try {
                $name = "Employee " . $i . " " . ['Santoso', 'Wijaya', 'Pratama'][$i % 3];
                $email = "employee{$i}@centralsaga.com";
                $position = ['Manager', 'Staff', 'Officer'][$i % 3];
                $division_id = ($i % 4) + 1;
                
                DB::table('employees')->insert([
                    'name' => $name,
                    'email' => $email,
                    'position' => $position,
                    'division_id' => $division_id,
                    'is_active' => true,
                    'birthday' => now()->subYears(25)->toDateString(),
                    'hire_date' => now()->subMonths(12)->toDateString(),
                    'password' => bcrypt('password'),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                
                // Add ML feature data
                DB::table('ml_employee_feature_data')->insert([
                    'employee_id' => DB::table('employees')->where('email', $email)->value('id'),
                    'evaluation_period' => now()->format('Y-m'),
                    'attendance_percentage' => 85,
                    'tasks_completed_percentage' => 90,
                    'on_time_percentage' => 80,
                    'quality_score' => rand(70, 95),
                    'discipline_score' => rand(75, 95),
                    'active_tasks_count' => rand(2, 6),
                    'late_tasks_count' => rand(0, 2),
                    'avg_resolution_days' => round(rand(1, 4), 2),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                
                echo "✓ Created employee #{$i}: {$name} (ID: " . DB::table('employees')->where('email', $email)->value('id') . ")\n";
                
                if ($i % 10 === 0) {
                    echo "\n--- Batch #{$i}/{$target} completed ---\n\n";
                }
                
                usleep(100000); // Small delay
                
            } catch (\Exception $e) {
                echo "❌ Error creating employee #{$i}: " . $e->getMessage() . "\n";
            }
        }
        
        $final = DB::table('employees')->count();
        $ml = DB::table('ml_employee_feature_data')->count();
        
        echo "\n==========================================\n";
        echo "✅ SEEDING COMPLETE!\n";
        echo "Total Employees: {$final}\n";
        echo "ML Features Records: {$ml}\n";
        echo "==========================================\n";
        
        echo "\nTest at:\n• http://localhost:3000/users\n• Clear cache: Ctrl+Shift+R\n";
    }
}
