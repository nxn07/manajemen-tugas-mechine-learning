<?php

namespace App\Services;

use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Database\Eloquent\Builder;

class UserService
{
    /**
     * Get paginated users with full relationships (no N+1 queries).
     */
    public function getAll(int $perPage = 15, ?string $search = null): \Illuminate\Pagination\LengthAwarePaginator
    {
        $cacheKey = "users_page_{$perPage}_search_{$search}_" . md5('all');
        
        return Cache::remember($cacheKey, 300, function () use ($perPage, $search) {
            $query = User::select(
                'users.id',
                'users.name',
                'users.email',
                'users.phone',
                'users.is_active',
                'users.created_at',
                'users.updated_at'
            )
            ->with(['role:id,name', 'division:id,name'])
            ->when($search, function (Builder $q) use ($search) {
                $q->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                          ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->paginate($perPage);

            return $query;
        });
    }

    /**
     * Get user count without loading all records.
     */
    public function getTotalCount(): int
    {
        return Cache::remember('total_users_count', 60, function () {
            return DB::table('users')->where('is_active', true)->count();
        });
    }

    /**
     * Get user by ID with minimal fetch.
     */
    public function getById(int $id): ?User
    {
        $cacheKey = "user_{$id}";
        
        return Cache::remember($cacheKey, 900, function () use ($id) {
            return User::with('role:id,name')
                ->select('id', 'name', 'email', 'phone', 'is_active', 'created_at')
                ->find($id);
        });
    }

    /**
     * Search users with autocomplete optimization.
     */
    public function search(string $term, int $limit = 5): array
    {
        return Cache::remember("users_search_{$term}", 60, function () use ($term, $limit) {
            return User::where(function ($query) use ($term) {
                    $query->where('name', 'like', "%{$term}%")
                          ->orWhere('email', 'like', "%{$term}%");
                })
                ->select('id', 'name', 'email')
                ->take($limit)
                ->get()
                ->toArray();
        });
    }

    /**
     * Update user role efficiently.
     */
    public function assignRole(User $user, string $roleName): bool
    {
        $role = Role::where('name', $roleName)->first();
        
        if (!$role) {
            return false;
        }

        // Remove existing roles first
        $user->syncRoles([]);
        
        // Assign new role
        $user->assignRole($role);

        // Clear cache for this user
        Cache::forget("user_{$user->id}");
        Cache::forget("users_page_"); // Clear user list cache
        
        return true;
    }

    /**
     * Bulk update operations with transaction.
     */
    public function bulkUpdate(array $data): bool
    {
        return DB::transaction(function () use ($data) {
            foreach ($data as $userId => $updates) {
                Cache::forget("user_{$userId}");
                
                User::where('id', $userId)->update($updates);
            }
            
            return true;
        });
    }
}
