"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, AlertTriangle, Terminal } from "lucide-react";

export default function MLClusteringDiagnostics() {
  const [checklist, setChecklist] = useState({
    apiReachable: false as boolean | null,
    apiEndpoint: "" as string,
    responseFormat: "" as string,
  });

  const runDiagnostics = async () => {
    try {
      // Test 1: Check if API is reachable
      const startTime = Date.now();
      
      try {
        const response = await fetch("http://localhost:8000/api/v1/users?page=1&per_page=1");
        const elapsed = Date.now() - startTime;
        
        setChecklist({
          apiReachable: true,
          apiEndpoint: "✅ http://localhost:8000/api/v1/users",
          responseFormat: `✅ ${response.status} - (${elapsed}ms)`,
        });
        
        // Try to read response for debugging
        const data = await response.json();
        console.log("API Response:", JSON.stringify(data, null, 2));
        
      } catch (fetchError: any) {
        setChecklist({
          apiReachable: false,
          apiEndpoint: `❌ Cannot connect to localhost:8000`,
          responseFormat: `❌ Error: ${fetchError.message}`,
        });
      }
      
    } catch (error) {
      setChecklist({
        apiReachable: false,
        apiEndpoint: "❌ Diagnostic failed",
        responseFormat: `❌ ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl p-8 mb-8 shadow-2xl">
          <div className="flex items-center gap-4 mb-4">
            <Terminal className="w-12 h-12" />
            <div>
              <h1 className="text-3xl font-bold">ML Clustering Diagnostics</h1>
              <p className="text-blue-200">Check backend connectivity and configuration</p>
            </div>
          </div>
        </div>

        {/* Run Button */}
        <button
          onClick={runDiagnostics}
          className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-semibold shadow-lg transition-all mb-8 flex items-center justify-center gap-3"
        >
          <span>🔍 Run Diagnostics</span>
        </button>

        {/* Results */}
        {checklist.apiReachable !== null && (
          <div className="space-y-4">
            {/* API Reachability */}
            <div className={`bg-white rounded-2xl p-6 border-2 ${
              checklist.apiReachable 
                ? "border-emerald-500 bg-emerald-50" 
                : "border-red-500 bg-red-50"
            }`}>
              <div className="flex items-start gap-4">
                {checklist.apiReachable ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mt-1" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-600 mt-1" />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">Backend Accessibility</h3>
                  <pre className="text-sm bg-white/80 p-3 rounded-lg overflow-x-auto">
                    {checklist.apiEndpoint}
                  </pre>
                </div>
              </div>
            </div>

            {/* Response Format */}
            <div className={`bg-white rounded-2xl p-6 border-2 ${
              checklist.apiReachable
                ? "border-emerald-500 bg-emerald-50"
                : "border-red-500 bg-red-50"
            }`}>
              <div className="flex items-start gap-4">
                {checklist.apiReachable ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mt-1" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-600 mt-1" />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">API Response</h3>
                  <pre className="text-sm bg-white/80 p-3 rounded-lg overflow-x-auto">
                    {checklist.responseFormat}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!checklist.apiReachable && (
          <div className="mt-8 bg-orange-50 border-2 border-orange-400 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-orange-600 mt-1" />
              <div>
                <h3 className="font-semibold text-lg text-orange-900 mb-3">Backend Not Running!</h3>
                <p className="text-orange-800 mb-3">
                  Laravel backend must be running on <code className="bg-orange-200 px-2 py-1 rounded">http://localhost:8000</code>
                </p>
                
                <div className="bg-white/80 rounded-lg p-4 mb-3">
                  <h4 className="font-semibold mb-2">Start Laravel Backend:</h4>
                  <code className="block bg-gray-100 p-3 rounded text-sm font-mono">
                    cd backend<br />
                    php artisan serve
                  </code>
                </div>
                
                <div className="bg-white/80 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Or with Docker:</h4>
                  <code className="block bg-gray-100 p-3 rounded text-sm font-mono">
                    docker-compose up -d
                  </code>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Links */}
        {checklist.apiReachable && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/ml-clustering"
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl p-6 text-center font-semibold shadow-lg transition-all"
            >
              Go to ML Clustering Page →
            </Link>
            <Link
              href="/dashboard"
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl p-6 text-center font-semibold shadow-lg transition-all"
            >
              Back to Dashboard →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
