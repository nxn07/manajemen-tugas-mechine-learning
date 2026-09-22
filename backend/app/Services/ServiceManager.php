<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ServiceManager
{
    /**
     * Optimized user service with Redis cache warming
     */
    public static function warmUpCache()
    {
        Log::info('🔥 Warming up caches...');
        
        $startTime = microtime(true);
        
        try {
            // Cache 1: Total user count (infinite TTL)
            self::cacheUserCount();
            
            // Cache 2: Active divisions
            self::cacheDivisions();
            
            // Cache 3: Common API responses (5 minute TTL)
            self::cacheCommonResponses();
            
            $elapsed = round((microtime(true) - $startTime) * 1000);
            Log::info("✅ Cache warmed in {$elapsed}ms");
            
        } catch (\Exception $e) {
            Log::error('❌ Cache warming failed: ' . $e->getMessage());
        }
    }
    
    /**
     * Cache total user count
     */
    private static function cacheUserCount()
    {
        Cache::rememberForever('total_user_count', function () {
            return DB::table('employees')->where('is_active', true)->count();
        });
        
        Log::info('✅ Cached total user count');
    }
    
    /**
     * Cache active divisions
     */
    private static function cacheDivisions()
    {
        $divisions = Cache::rememberForever('active_divisions', function () {
            return DB::table('divisions')
                ->select('id', 'name', 'description')
                ->orderBy('name')
                ->get();
        });
        
        Log::info('✅ Cached divisions: ' . count($divisions));
    }
    
    /**
     * Cache common API responses
     */
    private static function cacheCommonResponses()
    {
        // Cache health check result
        Cache::remember('health_check_result', 60, function () {
            return [
                'status' => 'ok',
                'timestamp' => now()->toISOString(),
                'uptime' => time() - app()->runningSince(),
            ];
        });
        
        // Cache system info
        Cache::remember('system_info', 300, function () {
            return [
                'environment' => env('APP_ENV'),
                'version' => env('APP_VERSION', 'v1.0'),
                'memory_limit' => ini_get('memory_limit'),
                'max_execution_time' => ini_get('max_execution_time'),
            ];
        });
        
        Log::info('✅ Cached common responses');
    }
    
    /**
     * Get cached data with fallback
     */
    public static function getWithFallback($key, $default = null, $ttl = 300)
    {
        try {
            $value = Cache::driver('redis')->get($key);
            if ($value !== null) {
                return json_decode($value, true);
            }
        } catch (\Exception $e) {
            Log::warning('Cache miss or error: ' . $key);
        }
        
        return $default;
    }
    
    /**
     * Set cached data with compression
     */
    public static function putWithCache($key, $value, $ttl = 300)
    {
        try {
            Cache::store('redis')->put($key, json_encode($value), $ttl);
            return true;
        } catch (\Exception $e) {
            Log::error('Cache set failed: ' . $key);
            return false;
        }
    }
    
    /**
     * Clear specific cache key
     */
    public static function clearCache($key)
    {
        try {
            Cache::store('redis')->forget($key);
            Log::info('Cleared cache: ' . $key);
            return true;
        } catch (\Exception $e) {
            Log::error('Cache clear failed: ' . $key);
            return false;
        }
    }
    
    /**
     * Flush all application cache
     */
    public static function flushAll()
    {
        try {
            Cache::flush();
            Log::info('✅ All cache flushed');
            return true;
        } catch (\Exception $e) {
            Log::error('Flush failed: ' . $e->getMessage());
            return false;
        }
    }
}
