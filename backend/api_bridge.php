<?php
/**
 * API Bridge - SQLite to JSON Converter
 * For when PostgreSQL is not available
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Get database path
$dbPath = __DIR__ . '/database/database.sqlite';

if (!file_exists($dbPath)) {
    echo json_encode([
        'success' => false,
        'error' => 'Database file not found'
    ]);
    exit;
}

try {
    $pdo = new PDO("sqlite:$dbPath");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $action = $_GET['action'] ?? '';
    
    switch ($action) {
        case 'get_employees':
            // Get all employees with basic info
            $stmt = $pdo->query("SELECT e.id, e.name, e.email, e.position, e.department, 
                                       (CASE WHEN u.status = 'active' THEN 'AKTIF' ELSE 'INACTIVE' END) as status,
                                       COALESCE(r.role_name, 'EMPLOYEE') as role
                                FROM employees e
                                LEFT JOIN users u ON e.user_id = u.id
                                LEFT JOIN user_roles ur ON u.id = ur.user_id
                                LEFT JOIN roles r ON ur.role_id = r.id
                                ORDER BY e.id");
            $employees = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(['success' => true, 'data' => $employees, 'count' => count($employees)]);
            break;
            
        case 'get_dashboard_stats':
            $counts = [];
            
            // Employee count
            $stmt = $pdo->query("SELECT COUNT(*) as total FROM employees");
            $counts['total_employees'] = $stmt->fetch()['total'];
            
            // Active employees
            $stmt = $pdo->query("SELECT COUNT(*) as active FROM employees WHERE id IN (SELECT DISTINCT employee_id FROM task_submissions)");
            $counts['active_employees'] = $stmt->fetch()['active'];
            
            // Clustering info
            $stmt = $pdo->query("SELECT n_clusters, COUNT(*) as run_count FROM ml_clustering_results GROUP BY n_clusters");
            $clusters = $stmt->fetchAll();
            $counts['categories'] = count(array_unique(array_column($clusters, 'n_clusters'))) > 0 ? 
                array_pop($clusters)['n_clusters'] : 3;
            
            // Feature extraction check
            $stmt = $pdo->query("SELECT evaluation_period, COUNT(*) as count FROM ml_employee_feature_data 
                                 GROUP BY evaluation_period ORDER BY id DESC LIMIT 1");
            $features = $stmt->fetch();
            $counts['period'] = $features['evaluation_period'] ?? 'N/A';
            $counts['extracted'] = $features['count'] ?? 0;
            
            echo json_encode(['success' => true, 'data' => $counts]);
            break;
            
        case 'get_activity_logs':
            // Since SQLite doesn't have activity_logs table from our setup, return empty or sample
            echo json_encode([
                'success' => true,
                'data' => [],
                'count' => 0,
                'note' => 'Activity logs require full PostgreSQL setup'
            ]);
            break;
            
        default:
            echo json_encode(['success' => false, 'error' => 'Unknown action']);
    }
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
