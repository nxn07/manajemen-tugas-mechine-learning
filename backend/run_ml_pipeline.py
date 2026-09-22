#!/usr/bin/env python3
"""
ML Pipeline Runner - Standalone Script
Bypasses Laravel API for direct feature extraction and K-Means clustering
"""

import sys
import json
import os
from datetime import datetime

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
except ImportError:
    print("❌ psycopg2 not found. Installing...")
    os.system("pip install psycopg2-binary")
    import psycopg2
    from psycopg2.extras import RealDictCursor

import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'sim_kinerja',
    'user': 'postgres',
    'password': 'postgrespassword'  # Updated based on docker-compose.yml
}


def print_step(message):
    """Print timestamped progress message."""
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{timestamp}] {message}")


def get_db_connection():
    """Establish database connection."""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        # Try with different password format
        DB_CONFIG['password'] = 'postgres'  # Original password from plan
        try:
            conn = psycopg2.connect(**DB_CONFIG)
            print("✓ Connected with original password")
            return conn
        except Exception as e2:
            print(f"❌ Also failed with fallback password: {e2}")
            raise


def check_employee_count(conn):
    """Verify employee count in system."""
    with conn.cursor() as cur:
        cur.execute("SELECT COUNT(*) as count FROM employees;")
        result = cur.fetchone()
        return result['count'] if result else 0


def extract_attendance_data(conn, employee_id, period):
    """Extract attendance percentage for an employee."""
    with conn.cursor() as cur:
        year, month = period.split('-')
        cur.execute("""
            SELECT 
                COUNT(*) as total_days,
                SUM(CASE WHEN status IN ('present', 'approved_leave') THEN 1 ELSE 0 END) as present_days
            FROM attendance_logs
            WHERE employee_id = %s
            AND EXTRACT(YEAR FROM log_date) = %s::INTEGER
            AND EXTRACT(MONTH FROM log_date) = %s::INTEGER
        """, (employee_id, year, month))
        
        result = cur.fetchone()
        if result and result['total_days'] > 0:
            return round((result['present_days'] / result['total_days']) * 100, 2)
        return None


def extract_task_performance(conn, employee_id, period):
    """Extract task-related features."""
    with conn.cursor() as cur:
        year, month = period.split('-')
        
        # Tasks completed and on-time metrics
        cur.execute("""
            SELECT 
                COUNT(*) as total_submissions,
                SUM(CASE WHEN ts.status = 'COMPLETED' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN ts.submitted_at <= t.due_date THEN 1 ELSE 0 END) as on_time
            FROM task_submissions ts
            JOIN tasks t ON ts.task_id = t.id
            WHERE ts.employee_id = %s
            AND EXTRACT(YEAR FROM ts.created_at) = %s::INTEGER
            AND EXTRACT(MONTH FROM ts.created_at) = %s::INTEGER
        """, (employee_id, year, month))
        
        result = cur.fetchone()
        if result and result['total_submissions'] > 0:
            return {
                'tasks_completed_pct': round((result['completed'] / result['total_submissions']) * 100, 2),
                'on_time_pct': round((result['on_time'] / result['total_submissions']) * 100, 2)
            }
        return {'tasks_completed_pct': None, 'on_time_pct': None}


def extract_quality_score(conn, employee_id, period):
    """Extract quality score from performance evaluations."""
    with conn.cursor() as cur:
        year, month = period.split('-')
        cur.execute("""
            SELECT AVG(score) as avg_quality
            FROM performance_evaluations
            WHERE employee_id = %s
            AND EXTRACT(YEAR FROM evaluation_date) = %s::INTEGER
            AND EXTRACT(MONTH FROM evaluation_date) = %s::INTEGER
        """, (employee_id, year, month))
        
        result = cur.fetchone()
        return round(result['avg_quality'], 2) if result and result['avg_quality'] else None


def extract_discipline_score(conn, employee_id, period):
    """Calculate discipline score based on revisions."""
    with conn.cursor() as cur:
        year, month = period.split('-')
        cur.execute("""
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'REVISED' THEN 1 ELSE 0 END) as revisions
            FROM task_submissions
            WHERE employee_id = %s
            AND EXTRACT(YEAR FROM created_at) = %s::INTEGER
            AND EXTRACT(MONTH FROM created_at) = %s::INTEGER
        """, (employee_id, year, month))
        
        result = cur.fetchone()
        if result and result['total'] > 0:
            revision_rate = result['revisions'] / result['total']
            return round(max(0, 100 - (revision_rate * 50)), 2)
        return None


def extract_active_late_tasks(conn, employee_id):
    """Extract active task count and late submission count."""
    with conn.cursor() as cur:
        # Active tasks
        cur.execute("""
            SELECT COUNT(*) as active
            FROM tasks
            WHERE employee_id = %s
            AND status IN ('assigned', 'in_progress')
        """, (employee_id,))
        active_result = cur.fetchone()
        active_count = active_result['active'] if active_result else 0
        
        # Late tasks (completed after due date)
        cur.execute("""
            SELECT COUNT(*) as late
            FROM task_submissions ts
            JOIN tasks t ON ts.task_id = t.id
            WHERE ts.employee_id = %s
            AND ts.status = 'COMPLETED'
            AND ts.submitted_at > t.due_date
        """, (employee_id,))
        late_result = cur.fetchone()
        late_count = late_result['late'] if late_result else 0
        
        return {'active_count': active_count, 'late_count': late_count}


def extract_avg_resolution_days(conn, employee_id):
    """Calculate average task resolution time."""
    with conn.cursor() as cur:
        cur.execute("""
            SELECT 
                AVG(EXTRACT(EPOCH FROM (ts.submitted_at - t.created_at)) / 86400) as avg_days
            FROM task_submissions ts
            JOIN tasks t ON ts.task_id = t.id
            WHERE ts.employee_id = %s
            AND ts.status = 'COMPLETED'
        """, (employee_id,))
        
        result = cur.fetchone()
        return round(result['avg_days'], 2) if result and result['avg_days'] else None


def calculate_features_for_employee(conn, employee_id, period):
    """Calculate all 8 features for an employee."""
    features = {}
    
    print_step(f"Processing employee {employee_id}...")
    
    # 1. Attendance %
    features['attendance_percentage'] = extract_attendance_data(conn, employee_id, period)
    
    # 2-3. Task performance
    task_perf = extract_task_performance(conn, employee_id, period)
    features.update(task_perf)
    
    # 4. Quality score
    features['quality_score'] = extract_quality_score(conn, employee_id, period)
    
    # 5. Discipline score
    features['discipline_score'] = extract_discipline_score(conn, employee_id, period)
    
    # 6-7. Active and late task counts
    task_counts = extract_active_late_tasks(conn, employee_id)
    features['active_tasks_count'] = task_counts['active_count']
    features['late_tasks_count'] = task_counts['late_count']
    
    # 8. Average resolution days
    features['avg_resolution_days'] = extract_avg_resolution_days(conn, employee_id)
    
    return features


def prepare_feature_matrix(features_list):
    """Convert features list to numpy matrix."""
    feature_names = [
        'attendance_percentage', 'tasks_completed_percentage', 'on_time_percentage',
        'quality_score', 'discipline_score', 'active_tasks_count',
        'late_tasks_count', 'avg_resolution_days'
    ]
    
    # Create dataframe with defaults for NULL values
    df = pd.DataFrame(features_list)
    df = df.fillna(0)  # Replace NULL with 0
    
    matrix = df[feature_names].values.astype(float)
    labels = df['employee_id'].values
    
    return matrix, labels, feature_names


def normalize_data(matrix):
    """Normalize features using StandardScaler."""
    scaler = StandardScaler()
    return scaler.fit_transform(matrix)


def run_clustering(matrix_normalized, n_clusters=3, random_state=42):
    """Run K-Means clustering."""
    print_step(f"Running K-Means with {n_clusters} clusters...")
    
    kmeans = KMeans(n_clusters=n_clusters, random_state=random_state, n_init='auto')
    cluster_labels = kmeans.fit_predict(matrix_normalized)
    
    # Calculate silhouette score
    sil_score = silhouette_score(matrix_normalized, cluster_labels)
    
    # Get centroids
    centroids = kmeans.cluster_centers_
    
    return cluster_labels, centroids, sil_score


def save_results_to_database(conn, period, employee_ids, cluster_labels, centroids, silhouette_score):
    """Save clustering results to database."""
    print_step("Saving results to database...")
    
    with conn.cursor() as cur:
        # Insert feature data
        for emp_id, features in zip(employee_ids, FEATURE_DATA):
            cur.execute("""
                INSERT INTO ml_employee_feature_data 
                (employee_id, evaluation_period, attendance_percentage, tasks_completed_percentage, 
                 on_time_percentage, quality_score, discipline_score, active_tasks_count, 
                 late_tasks_count, avg_resolution_days, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
                ON CONFLICT (employee_id, evaluation_period) DO UPDATE SET
                    attendance_percentage = EXCLUDED.attendance_percentage,
                    tasks_completed_percentage = EXCLUDED.tasks_completed_percentage,
                    on_time_percentage = EXCLUDED.on_time_percentage,
                    quality_score = EXCLUDED.quality_score,
                    discipline_score = EXCLUDED.discipline_score,
                    active_tasks_count = EXCLUDED.active_tasks_count,
                    late_tasks_count = EXCLUDED.late_tasks_count,
                    avg_resolution_days = EXCLUDED.avg_resolution_days,
                    updated_at = NOW()
            """, (emp_id, period, 
                  features.get('attendance_percentage'),
                  features.get('tasks_completed_percentage'),
                  features.get('on_time_percentage'),
                  features.get('quality_score'),
                  features.get('discipline_score'),
                  features.get('active_tasks_count'),
                  features.get('late_tasks_count'),
                  features.get('avg_resolution_days')))
        
        conn.commit()
        print("✓ Feature data saved")
        
        # Insert clustering results
        cur.execute("""
            INSERT INTO ml_clustering_results 
            (evaluation_period, n_clusters, silhouette_score, centroid_matrix, created_at, updated_at)
            VALUES (%s, %s, %s, %s, NOW(), NOW())
            RETURNING id
        """, (period, len(np.unique(cluster_labels)), silhouette_score, centroids.tolist()))
        result_id = cur.fetchone()[0]
        conn.commit()
        print(f"✓ Clustering results saved (ID: {result_id})")
        
        # Insert employee cluster assignments
        for emp_id, cluster in zip(employee_ids, cluster_labels):
            cur.execute("""
                INSERT INTO ml_employee_clusters 
                (employee_id, clustering_result_id, cluster_assignment, confidence_score, created_at, updated_at)
                VALUES (%s, %s, %s, %s, NOW(), NOW())
                ON CONFLICT (employee_id, clustering_result_id) DO UPDATE SET
                    cluster_assignment = EXCLUDED.cluster_assignment,
                    updated_at = NOW()
            """, (emp_id, result_id, cluster, 0.95))  # Fixed confidence score
        
        conn.commit()
        print("✓ Cluster assignments saved")


def main():
    """Main pipeline execution."""
    print("=" * 60)
    print("🚀 SIM Kinerja ML Pipeline - Standalone Runner")
    print("=" * 60)
    
    period = '2026-09'
    n_clusters = 3
    
    try:
        # Step 1: Connect to database
        print_step("Connecting to database...")
        conn = get_db_connection()
        
        # Step 2: Verify employees exist
        emp_count = check_employee_count(conn)
        print_step(f"Found {emp_count} employees in system")
        
        if emp_count == 0:
            print("❌ No employees found! Cannot proceed.")
            sys.exit(1)
        
        # Step 3: Extract features for all employees
        print_step("Starting feature extraction...")
        FEATURE_DATA = []
        
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM employees ORDER BY id;")
            employees = cur.fetchall()
        
        for emp in employees:
            features = calculate_features_for_employee(conn, emp['id'], period)
            features['employee_id'] = emp['id']
            FEATURE_DATA.append(features)
        
        print_step(f"✓ Extracted features for {len(FEATURE_DATA)} employees")
        
        # Step 4: Prepare feature matrix
        print_step("Preparing feature matrix...")
        matrix, labels, feature_names = prepare_feature_matrix(FEATURE_DATA)
        print(f"Feature matrix shape: {matrix.shape}")
        
        # Step 5: Normalize data
        print_step("Normalizing features...")
        matrix_normalized = normalize_data(matrix)
        
        # Step 6: Run K-Means
        print_step("Running K-Means clustering...")
        start_time = datetime.now()
        cluster_labels, centroids, sil_score = run_clustering(matrix_normalized, n_clusters)
        elapsed = (datetime.now() - start_time).total_seconds()
        print(f"✓ Clustering completed in {elapsed:.2f}s")
        
        # Step 7: Display cluster distribution
        unique, counts = np.unique(cluster_labels, return_counts=True)
        print("\n📊 Cluster Distribution:")
        for cluster_id, count in zip(unique, counts):
            print(f"  Cluster {cluster_id}: {count} employees ({count/len(cluster_labels)*100:.1f}%)")
        
        # Step 8: Save results to database
        print_step("Saving results to database...")
        save_results_to_database(conn, period, labels, cluster_labels, centroids, sil_score)
        
        # Step 9: Print final summary
        print("\n" + "=" * 60)
        print("✅ ML Pipeline Completed Successfully!")
        print("=" * 60)
        print(f"Period: {period}")
        print(f"Employees processed: {len(labels)}")
        print(f"Clusters: {n_clusters}")
        print(f"Silhouette Score: {sil_score:.4f}")
        print(f"Elapsed time: {elapsed:.2f}s")
        print("=" * 60)
        
        conn.close()
        
    except Exception as e:
        print(f"\n❌ Pipeline failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
