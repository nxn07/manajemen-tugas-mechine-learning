<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class QuickStart extends Command
{
    protected $signature = 'backend:quick-start';
    protected $description = 'Quick start backend with optimized caches';

    public function handle()
    {
        $this->info('⚡ Starting Backend Optimized...');
        
        // Step 1: Clear all caches first
        $this->info('🧹 Clearing old caches...');
        Cache::flush();
        
        // Step 2: Pre-warm critical caches
        $this->info('🔥 Warming up caches...');
        
        // Warm user count
        $userCount = DB::table('employees')->where('is_active', true)->count();
        Cache::put('total_user_count', $userCount, 86400); // 24 hours
        
        // Warm migrations check
        $migrations = DB::table('migrations')->get()->toArray();
        Cache::put('migration_versions', $migrations, 3600); // 1 hour
        
        // Warm config (critical values)
        Cache::put('app_config_speed', [
            'version' => app()->version(),
            'environment' => app()->environment(),
            'timezone' => config('app.timezone'),
        ], 7200); // 2 hours
        
        // Step 3: Verify database connection
        try {
            DB::connection()->getPdo();
            $this->info('✅ Database connected');
        } catch (\Exception $e) {
            $this->error('❌ Database connection failed');
            return 1;
        }
        
        // Step 4: Check Redis connectivity
        if (Cache::driver('redis')->has('_test')) {
            $this->info('✅ Redis connected');
        } else {
            $this->warn('⚠️ Redis not available, using fallback');
        }
        
        // Step 5: Route optimization
        $this->info('📦 Optimizing routes...');
        Artisan::call('route:cache');
        
        // Step 6: Configuration caching
        $this->info('⚙️ Caching configuration...');
        Artisan::call('config:cache');
        
        $elapsed = round(microtime(true) - $startTime, 2);
        
        $this->info("✅ Backend ready in {$elapsed}s!");
        $this->newLine();
        $this->info('🎯 Ready for production traffic');
        
        return 0;
    }
}
