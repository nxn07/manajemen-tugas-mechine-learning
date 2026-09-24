<?php

namespace App\Services;

use App\Models\User;
use App\Models\Role;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Services\Contracts\UserServiceInterface;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Eloquent\Builder;

class UserService implements UserServiceInterface
{
    const CACHE_KEY_ALL = 'users_all';
    const CACHE_TTL = 3600;

    protected UserRepositoryInterface $userRepository;

    public function __construct(UserRepositoryInterface $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    protected function clearCache(?int $id = null): void
    {
        Cache::forget(self::CACHE_KEY_ALL);
        if ($id) {
            Cache::forget("users_{$id}");
        }
        Cache::forget("users_page_");
        Cache::forget("total_users_count");
    }

    protected function normalizeRoleName(string $role): string
    {
        $role = strtolower(trim($role));
        if ($role === 'karyawan') {
            return 'employee';
        }
        return $role;
    }

    public function getAllUsers()
    {
        return Cache::remember(self::CACHE_KEY_ALL, self::CACHE_TTL, function () {
            return $this->userRepository->getAll();
        });
    }

    public function getUserById(int $id)
    {
        return Cache::remember("users_{$id}", self::CACHE_TTL, function () use ($id) {
            return $this->userRepository->findById($id);
        });
    }

    public function createUser(array $data)
    {
        return DB::transaction(function () use ($data) {
            $role = isset($data['role']) ? $this->normalizeRoleName($data['role']) : 'employee';

            $payload = [
                'username' => $data['username'] ?? $data['name'] ?? ('user_' . time()),
                'email'    => $data['email'],
                'password' => Hash::make($data['password']),
                'role'     => strtoupper($role),
            ];

            $user = $this->userRepository->create($payload);
            $user->syncRoles([$role]);

            $this->clearCache();
            return $user->load('roles');
        });
    }

    public function updateUser(int $id, array $data)
    {
        return DB::transaction(function () use ($id, $data) {
            $user = $this->userRepository->findById($id);

            $payload = [];
            if (isset($data['username'])) $payload['username'] = $data['username'];
            elseif (isset($data['name'])) $payload['username'] = $data['name'];

            if (isset($data['email'])) {
                if (method_exists($user, 'isPrimaryAdmin') && $user->isPrimaryAdmin() && strtolower(trim($data['email'])) !== strtolower(trim($user->email))) {
                    throw new \Exception("Email Super Admin Utama terlindungi dan tidak dapat diubah.");
                }
                $payload['email'] = $data['email'];
            }
            if (!empty($data['password'])) $payload['password'] = Hash::make($data['password']);

            if (isset($data['role'])) {
                $role = $this->normalizeRoleName($data['role']);
                if (method_exists($user, 'isPrimaryAdmin') && $user->isPrimaryAdmin() && $role !== 'admin') {
                    throw new \Exception("Peran (Role) Super Admin Utama tidak dapat diubah.");
                }
                $payload['role'] = strtoupper($role);
            }

            $user = $this->userRepository->update($id, $payload);

            if (isset($role)) {
                $user->syncRoles([$role]);
            }

            $this->clearCache($id);
            return $user->load('roles');
        });
    }

    public function deleteUser(int $id): bool
    {
        $user = $this->userRepository->findById($id);
        if (method_exists($user, 'isPrimaryAdmin') && $user->isPrimaryAdmin()) {
            throw new \Exception("Akun Super Admin Utama dilindungi sistem dan tidak dapat dihapus.");
        }

        $deleted = $this->userRepository->delete($id);
        $this->clearCache($id);
        return $deleted;
    }

    /**
     * Get paginated users with full relationships.
     */
    public function getAll(int $perPage = 15, ?string $search = null)
    {
        $cacheKey = "users_page_{$perPage}_search_{$search}_" . md5('all');
        
        return Cache::remember($cacheKey, 300, function () use ($perPage, $search) {
            return User::with(['roles', 'employee.division'])
                ->when($search, function (Builder $q) use ($search) {
                    $q->where(function ($query) use ($search) {
                        $query->where('username', 'like', "%{$search}%")
                              ->orWhere('email', 'like', "%{$search}%");
                    });
                })
                ->paginate($perPage);
        });
    }

    /**
     * Get user count without loading all records.
     */
    public function getTotalCount(): int
    {
        return Cache::remember('total_users_count', 60, function () {
            return DB::table('users')->count();
        });
    }

    /**
     * Get user by ID with minimal fetch.
     */
    public function getById(int $id): ?User
    {
        $cacheKey = "user_{$id}";
        
        return Cache::remember($cacheKey, 900, function () use ($id) {
            return User::with('roles')->find($id);
        });
    }

    /**
     * Search users with autocomplete optimization.
     */
    public function search(string $term, int $limit = 5): array
    {
        return Cache::remember("users_search_{$term}", 60, function () use ($term, $limit) {
            return User::where(function ($query) use ($term) {
                    $query->where('username', 'like', "%{$term}%")
                          ->orWhere('email', 'like', "%{$term}%");
                })
                ->take($limit)
                ->get()
                ->toArray();
        });
    }
}
