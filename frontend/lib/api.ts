import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
  
  // Optimized timeouts for different operations
  timeout: 30000, // 30s total timeout (was default 30s but not configured)
  
  // Connection pooling settings
  maxRedirects: 5,
  maxBodyLength: Number.MAX_VALUE,
  
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

// Request interceptor with intelligent timeout based on endpoint type
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    // Set different timeouts based on operation type
    const isLongOperation = 
      config.url?.includes('/ml/extract-features') ||
      config.url?.includes('/ml/run-clustering');
    
    if (isLongOperation) {
      config.timeout = 60000; // 60 seconds for ML operations
    } else {
      config.timeout = 15000; // 15 seconds for normal operations
    }
    
    // Log request for debugging
    if (process.env.NODE_ENV === "development") {
      console.log(`📡 [${new Date().toLocaleTimeString()}] ${config.method?.toUpperCase()} ${config.url}`);
      console.log(`   Timeout: ${config.timeout}ms`);
    }
    
    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor with intelligent retry logic
api.interceptors.response.use(
  (response) => {
    // Cache GET responses
    if (
      response.config.method === "get" && 
      typeof window !== "undefined"
    ) {
      const cacheKey = `api_cache_${response.config.url}`;
      try {
        localStorage.setItem(cacheKey, JSON.stringify(response.data));
        setTimeout(() => localStorage.removeItem(cacheKey), 60000);
      } catch (e) {
        // Ignore cache errors
      }
    }
    return response;
  },
  async (error: AxiosError | any) => {
    const err = error as AxiosError;
    
    // Better error categorization
    if (err.code === "ECONNREFUSED") {
      console.warn("⚠️ Backend server not running or unreachable at http://localhost:8000");
      console.warn("👉 Solution: Run 'podman-compose up -d' to start all services");
      console.warn("📋 Check containers: 'podman ps'");
      
      // Show helpful toast message
      if (typeof window !== "undefined") {
        const body = document.body;
        const overlay = document.createElement('div');
        overlay.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          background: #fee;
          border: 2px solid #f44336;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          max-width: 400px;
          font-family: system-ui, sans-serif;
        `;
        overlay.innerHTML = `
          <strong style="color: #c62828;">⚠️ Backend Not Running!</strong><br/>
          <small style="display:block; margin-top:8px;">Laravel API must be running.<br/>
          Run:<br/>
          <code style="background:#eee; padding:4px 8px; border-radius:4px;">podman-compose up -d</code>
        </small>`;
        body.appendChild(overlay);
        
        setTimeout(() => {
          overlay.remove();
          // Try auto-reconnect
          setTimeout(() => {
            // Re-trigger the failed request
            if (err.config) {
              api.request(err.config).catch(retryErr => Promise.reject(retryErr));
            }
          }, 3000);
        }, 5000);
      }
      
    } else if (err.code === "ERR_NETWORK") {
      console.warn("⚠️ Network error detected");
      
    } else if (err.code === "ECONNABORTED" || err.message.includes("timeout")) {
      console.warn("⚠️ Request timed out after", err.config?.timeout / 1000, "seconds");
      
    } else if (err.response) {
      // Server responded with error status
      console.error("⚠️ Server Error:", err.response.status, err.response.statusText);
      console.error("Response data:", err.response.data);
      
    } else if (err.request) {
      // Request made but no response received
      console.error("❌ No response received from server");
    }
    
    // Smart retry logic
    const shouldRetry = 
      ["ECONNREFUSED", "ERR_NETWORK", "ETIMEDOUT"].includes(err.code) ||
      err.response?.status === 503 ||
      err.response?.status === 504;
    
    if (shouldRetry && !err.config.__retryCount) {
      err.config.__retryCount = 1;
      
      const retryDelay = [1000, 2000, 5000][Math.min(err.config.__retryCount - 1, 2)];
      
      console.log(`🔄 Retrying ${err.config.method} ${err.config.url} in ${retryDelay}ms...`);
      
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
      
      return api.request(err.config).catch((retryErr) => Promise.reject(retryErr));
    }
    
    return Promise.reject(err);
  }
);

export default api;
