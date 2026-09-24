<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\User;
use App\Models\Task;
use App\Models\TaskSubmission;
use App\Models\PerformanceEvaluation;
use App\Models\KpiCriteria;
use App\Models\EmployeeMLFeature;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class SyncThirtyEmployeesSeeder extends Seeder
{
    public function run(): void
    {
        $period = '2026-09';
        $now = Carbon::parse('2026-09-24 10:00:00');

        echo "🔄 Memulai sinkronisasi 30 karyawan dan fitur K-Means...\n";

        // 1. Pastikan 4 karyawan tambahan dibuat (jika belum ada) agar total tepat 30
        $newEmployeesData = [
            [
                'username' => 'ahmad.fauzi',
                'email' => 'ahmad.fauzi@centralsaga.com',
                'full_name' => 'Ahmad Fauzi',
                'position' => 'Staff Operasional',
                'division_id' => 1,
                'nik' => '1996051220260901',
                'phone' => '081234567827',
            ],
            [
                'username' => 'siti.rahmawati',
                'email' => 'siti.rahmawati@centralsaga.com',
                'full_name' => 'Siti Rahmawati',
                'position' => 'Senior Staff',
                'division_id' => 2,
                'nik' => '1997082320260902',
                'phone' => '081234567828',
            ],
            [
                'username' => 'budi.santoso',
                'email' => 'budi.santoso@centralsaga.com',
                'full_name' => 'Budi Santoso',
                'position' => 'Team Lead',
                'division_id' => 3,
                'nik' => '1994111520260903',
                'phone' => '081234567829',
            ],
            [
                'username' => 'dewi.lestari',
                'email' => 'dewi.lestari@centralsaga.com',
                'full_name' => 'Dewi Lestari',
                'position' => 'Staff Administrasi',
                'division_id' => 5,
                'nik' => '1998031020260904',
                'phone' => '081234567830',
            ],
        ];

        foreach ($newEmployeesData as $empInfo) {
            $existingUser = User::where('email', $empInfo['email'])->first();
            if (!$existingUser) {
                $user = User::create([
                    'username' => $empInfo['username'],
                    'email' => $empInfo['email'],
                    'password' => Hash::make('password123'),
                    'role' => 'KARYAWAN',
                ]);
                $user->syncRoles(['employee']);
            } else {
                $user = $existingUser;
            }

            $existingEmp = Employee::where('user_id', $user->id)->first();
            if (!$existingEmp) {
                Employee::create([
                    'user_id' => $user->id,
                    'division_id' => $empInfo['division_id'],
                    'nik' => $empInfo['nik'],
                    'full_name' => $empInfo['full_name'],
                    'position' => $empInfo['position'],
                    'phone' => $empInfo['phone'],
                ]);
                echo "✓ Ditambahkan karyawan baru: {$empInfo['full_name']}\n";
            }
        }

        $allEmployees = Employee::orderBy('id', 'asc')->take(30)->get();
        $totalCount = $allEmployees->count();
        echo "✅ Total karyawan di database: {$totalCount}\n";

        // 2. Siapkan data KPI criteria dan evaluator manager (Employee #1)
        $managerId = $allEmployees->first()->id;
        $kpi = KpiCriteria::first() ?? KpiCriteria::create([
            'name' => 'Kualitas Hasil Kerja',
            'weight' => 20,
            'target_value' => 90,
        ]);

        // 3. Konfigurasi 3 Cluster (masing-masing 10 karyawan) sesuai dokumen TA:
        // Cluster 1: IDs 1-10 (Kinerja Tinggi & Beban Terkendali)
        // Cluster 2: IDs 11-20 (Kinerja Baik & Beban Tinggi)
        // Cluster 3: IDs 21-30 (Kinerja Perlu Ditingkatkan)
        
        // Hapus data fitur ML lama untuk periode ini agar fresh
        DB::table('ml_employee_feature_data')->where('evaluation_period', $period)->delete();
        DB::table('ml_clustering_results')->where('evaluation_period', $period)->delete();

        foreach ($allEmployees as $index => $emp) {
            $employeeId = $emp->id;

            if ($index < 10) {
                // Profile 1: Top Performer
                $attendance = rand(930, 990) / 10.0;
                $completed = rand(920, 990) / 10.0;
                $onTime = rand(900, 980) / 10.0;
                $quality = rand(880, 960) / 10.0;
                $discipline = rand(890, 970) / 10.0;
                $activeTasks = rand(1, 3);
                $lateTasks = rand(0, 1);
                $avgResolution = rand(12, 22) / 10.0;
                $tasksCount = rand(5, 7);
            } elseif ($index < 20) {
                // Profile 2: High Workload Performer
                $attendance = rand(850, 920) / 10.0;
                $completed = rand(760, 860) / 10.0;
                $onTime = rand(720, 820) / 10.0;
                $quality = rand(800, 880) / 10.0;
                $discipline = rand(800, 880) / 10.0;
                $activeTasks = rand(5, 8);
                $lateTasks = rand(1, 3);
                $avgResolution = rand(32, 48) / 10.0;
                $tasksCount = rand(8, 12);
            } else {
                // Profile 3: Needs Improvement
                $attendance = rand(650, 780) / 10.0;
                $completed = rand(450, 650) / 10.0;
                $onTime = rand(400, 600) / 10.0;
                $quality = rand(580, 700) / 10.0;
                $discipline = rand(550, 680) / 10.0;
                $activeTasks = rand(2, 4);
                $lateTasks = rand(3, 5);
                $avgResolution = rand(55, 85) / 10.0;
                $tasksCount = rand(4, 6);
            }

            // Simpan fitur ML
            DB::table('ml_employee_feature_data')->insert([
                'employee_id' => $employeeId,
                'evaluation_period' => $period,
                'attendance_percentage' => $attendance,
                'tasks_completed_percentage' => $completed,
                'on_time_percentage' => $onTime,
                'quality_score' => $quality,
                'discipline_score' => $discipline,
                'active_tasks_count' => $activeTasks,
                'late_tasks_count' => $lateTasks,
                'avg_resolution_days' => $avgResolution,
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            // Buat sample task dan evaluation di bulan ini agar relational query konsisten
            for ($t = 1; $t <= 2; $t++) {
                $status = ($t === 1) ? 'COMPLETED' : 'IN_PROGRESS';
                $task = Task::create([
                    'title' => "Penugasan Operasional #{$t} - {$emp->full_name}",
                    'description' => "Evaluasi penugasan berkala periode {$period}",
                    'weight' => 20,
                    'status' => $status,
                    'deadline' => $now->copy()->addDays(5),
                    'created_by_manager_id' => $managerId,
                    'assigned_employee_id' => $employeeId,
                    'created_at' => $now->copy()->subDays(rand(2, 10)),
                    'updated_at' => $now,
                ]);

                if ($status === 'COMPLETED') {
                    TaskSubmission::create([
                        'task_id' => $task->id,
                        'employee_id' => $employeeId,
                        'status' => 'APPROVED',
                        'submitted_at' => $now->copy()->subDays(1),
                        'reviewed_by_manager_id' => $managerId,
                        'review_notes' => 'Tugas telah diverifikasi dengan baik.',
                        'created_at' => $now->copy()->subDays(1),
                        'updated_at' => $now,
                    ]);

                    PerformanceEvaluation::create([
                        'task_id' => $task->id,
                        'employee_id' => $employeeId,
                        'evaluator_manager_id' => $managerId,
                        'kpi_criteria_id' => $kpi->id,
                        'score' => $quality,
                        'feedback_notes' => "Hasil evaluasi kinerja periode {$period}",
                        'evaluated_at' => $now,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                }
            }
        }

        echo "✨ Berhasil mensinkronisasi data 30 karyawan & fitur ML untuk periode {$period}!\n";
    }
}
