<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\DB;

class RequestTiming
{
    /**
     * Handle an incoming request with timing metrics.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Start query logging
        DB::enableQueryLog();
        
        $startTime = microtime(true);
        $response = $next($request);
        $endTime = microtime(true);
        
        $duration = ($endTime - $startTime) * 1000; // Convert to milliseconds
        
        // Log slow requests
        if ($duration > 1000) {
            \Log::warning('Slow request detected', [
                'url' => $request->fullUrl(),
                'method' => $request->method(),
                'duration_ms' => round($duration, 2),
                'user_agent' => $request->userAgent(),
                'ip' => $request->ip(),
            ]);
        }
        
        // Add timing header for debugging
        $response->headers->set('X-Response-Time', round($duration, 2) . 'ms');
        
        return $response;
    }
}
