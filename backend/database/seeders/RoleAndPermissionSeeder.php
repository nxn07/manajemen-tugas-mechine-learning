<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleAndPermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cache permission Spatie
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Daftar 15 Granular Permissions + Permission Tambahan
        $permissions = [
            // User Management
            'users.view',
            'users.create',
            'users.update',
            'users.delete',
            'users.manage',

            // Employee Management
            'employees.view',
            'employees.create',
            'employees.update',
            'employees.delete',

            // Division Management
            'divisions.view',
            'divisions.create',
            'divisions.update',
            'divisions.delete',
            'divisions.manage',

            // KPI Management
            'kpis.view',
            'kpis.create',
            'kpis.update',
            'kpis.delete',
            'kpi.manage',

            // Task Management
            'tasks.view_all',
            'tasks.view',
            'tasks.create',
            'tasks.update',
            'tasks.delete',
            'tasks.submit',
            'tasks.review',

            // Evaluation Management
            'evaluations.view',
            'evaluations.view_own',
            'evaluations.create',
            'evaluations.update',
            'evaluations.delete',

            // Audit Logs
            'activity-log.view',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // 1. Role Admin (Akses Penuh)
        $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $adminRole->syncPermissions(Permission::all());

        // 2. Role Manager (Akses Operasional & Review)
        $managerRole = Role::firstOrCreate(['name' => 'manager', 'guard_name' => 'web']);
        $managerRole->syncPermissions([
            'users.view',
            'employees.view',
            'divisions.view',
            'kpis.view',
            'tasks.view_all',
            'tasks.view',
            'tasks.create',
            'tasks.update',
            'tasks.delete',
            'tasks.review',
            'evaluations.view',
            'evaluations.create',
            'evaluations.update',
            'activity-log.view',
        ]);

        // 3. Role Employee (Akses Pengerjaan Tugas & Lihat Nilai Pribadi)
        $employeeRole = Role::firstOrCreate(['name' => 'employee', 'guard_name' => 'web']);
        $employeeRole->syncPermissions([
            'tasks.view',
            'tasks.submit',
            'evaluations.view_own',
        ]);

        // Assign Spatie roles to existing users
        foreach (\App\Models\User::all() as $user) {
            $userRoleLower = strtolower($user->role ?? '');
            if ($userRoleLower === 'admin' || $user->email === 'admin@gmail.com') {
                $user->syncRoles(['admin']);
            } elseif ($userRoleLower === 'manager' || str_contains($user->email, 'manager')) {
                $user->syncRoles(['manager']);
            } else {
                $user->syncRoles(['employee']);
            }
        }
    }
}
