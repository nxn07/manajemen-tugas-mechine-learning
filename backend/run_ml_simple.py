#!/usr/bin/env python3
"""Simple ML Pipeline for SIM Kinerja"""
import os, sys, json, sqlite3
sys.path.insert(0, os.path.dirname(__file__))
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

DB_PATH = './database/database.sqlite' if os.path.exists('./database') else './backend/database/database.sqlite'

print("=" * 60)
print("ML Pipeline - SIM Kinerja K-Means")
print("=" * 60)

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Verify employees
cursor.execute("SELECT COUNT(*) FROM employees;")
emp_count = cursor.fetchone()[0]
print(f"\nFound {emp_count} employees")

# Extract features from real data
print("\nExtracting features...")
features_data = []
cursor.execute("SELECT id FROM employees ORDER BY id;")
emp_ids = [r[0] for r in cursor.fetchall()]

for eid in emp_ids:
    # Attendance %
    cursor.execute("""
        SELECT COUNT(*), SUM(CASE WHEN status IN ('present','approved_leave') THEN 1 ELSE 0 END)
        FROM attendance_logs WHERE employee_id=? AND substr(log_date,1,7)='2026-09'
    """, (eid,))
    att = cursor.fetchone()
    att_pct = round(att[1]/att[0]*100, 2) if att and att[0] > 0 else None
    
    # Task performance
    cursor.execute("""
        SELECT COUNT(*), SUM(CASE WHEN ts.status='COMPLETED' THEN 1 ELSE 0 END)
        FROM task_submissions ts JOIN tasks t ON ts.task_id=t.id
        WHERE ts.employee_id=? AND substr(ts.submitted_at,1,7)='2026-09'
    """, (eid,))
    task = cursor.fetchone()
    comp_pct = round(task[1]/task[0]*100, 2) if task and task[0] > 0 else None
    
    # Quality score
    cursor.execute("""SELECT AVG(score) FROM performance_evaluations 
        WHERE employee_id=? AND substr(evaluation_date,1,7)='2026-09'""", (eid,))
    qual_result = cursor.fetchone()[0]; quality = round(qual_result, 2) if qual_result else None
    
    # Discipline score
    cursor.execute("""SELECT COUNT(*), SUM(CASE WHEN ts.status='REVISED' THEN 1 ELSE 0 END)
        FROM task_submissions ts WHERE employee_id=? AND substr(ts.created_at,1,7)='2026-09'""", (eid,))
    disc = cursor.fetchone()
    disc_score = round(max(0, 100-(disc[1]/disc[0]*50)), 2) if disc and disc[0] > 0 else None
    
    # Active and late tasks
    cursor.execute("SELECT COUNT(*) FROM tasks WHERE employee_id=? AND status IN ('assigned','in_progress')", (eid,))
    active = cursor.fetchone()[0]
    
    cursor.execute("""SELECT COUNT(*) FROM task_submissions ts JOIN tasks t ON ts.task_id=t.id
        WHERE ts.employee_id=? AND ts.status='COMPLETED' AND ts.submitted_at>t.due_date""", (eid,))
    late = cursor.fetchone()[0]
    
    # Avg resolution days  
    cursor.execute("""SELECT AVG(julianday(ts.submitted_at)-julianday(t.created_at))
        FROM task_submissions ts JOIN tasks t ON ts.task_id=t.id
        WHERE ts.employee_id=? AND ts.status='COMPLETED'""", (eid,))
    avg_result = cursor.fetchone()[0]; avg_days = round(avg_result, 2) if avg_result else None
    
    features_data.append({
        'employee_id': eid, 'attendance_percentage': att_pct,
        'tasks_completed_percentage': comp_pct, 'on_time_percentage': comp_pct,
        'quality_score': quality, 'discipline_score': disc_score,
        'active_tasks_count': active, 'late_tasks_count': late,
        'avg_resolution_days': avg_days
    })

print(f"Extracted {len(features_data)} feature sets")

# Prepare matrix
df = pd.DataFrame(features_data).fillna(0)
cols = ['attendance_percentage', 'tasks_completed_percentage', 'on_time_percentage',
        'quality_score', 'discipline_score', 'active_tasks_count', 'late_tasks_count', 'avg_resolution_days']
matrix = df[cols].values.astype(float)
labels_orig = df['employee_id'].values

print(f"Matrix shape: {matrix.shape}")

# Normalize
scaler = StandardScaler()
matrix_norm = scaler.fit_transform(matrix)

# K-Means
print("Running K-Means (n_clusters=3)...")
kmeans = KMeans(n_clusters=3, random_state=42, n_init='auto')
cluster_labels = kmeans.fit_predict(matrix_norm)
sil_score = silhouette_score(matrix_norm, cluster_labels)
centroids = kmeans.cluster_centers_

print(f"Silhouette Score: {sil_score:.4f}")

# Display distribution
unique, counts = np.unique(cluster_labels, return_counts=True)
print("\nCluster Distribution:")
for cid, cnt in zip(unique, counts):
    print(f"  Cluster {cid}: {cnt} employees ({cnt/len(cluster_labels)*100:.1f}%)")

# Save results
print("\nSaving to database...")

# Features
for row in features_data:
    cursor.execute("""INSERT OR REPLACE INTO ml_employee_feature_data 
        (employee_id,evaluation_period,attendance_percentage,tasks_completed_percentage,on_time_percentage,
         quality_score,discipline_score,active_tasks_count,late_tasks_count,avg_resolution_days,created_at,updated_at)
        VALUES (?,?,?,?,?,?,?, ?,?, ?,datetime('now'),datetime('now'))""",
        (row['employee_id'], '2026-09', row['attendance_percentage'], row['tasks_completed_percentage'],
         row['on_time_percentage'], row['quality_score'], row['discipline_score'],
         row['active_tasks_count'], row['late_tasks_count'], row['avg_resolution_days']))
conn.commit()
print("Features saved")

# Clustering results
cursor.execute("""INSERT INTO ml_clustering_results 
    (evaluation_period,n_clusters,silhouette_score,centroid_matrix,algorithm_config,created_at,updated_at)
    VALUES (? ,?,?,?,?, datetime('now'),datetime('now'))""",
    ('2026-09', len(unique), sil_score, json.dumps(centroids.tolist()), 
     json.dumps({'algo':'kmeans', 'random_state':42})))
rid = cursor.lastrowid
conn.commit()
print(f"Clustering results saved (ID: {rid})")

# Assignments
for eid, clust in zip(labels_orig, cluster_labels):
    cursor.execute("""INSERT OR REPLACE INTO ml_employee_clusters 
        (employee_id,clustering_result_id,cluster_assignment,confidence_score,created_at,updated_at)
        VALUES (?,?,?,0.95,datetime('now'),datetime('now'))""",
        (int(eid), rid, int(clust)))
conn.commit()
print("Cluster assignments saved")

# Summary
print("\n" + "=" * 60)
print("SUCCESS - ML Pipeline Completed!")
print("=" * 60)
print(f"Period: 2026-09 | Employees: {len(cluster_labels)} | Clusters: 3")
print(f"Silhouette Score: {sil_score:.4f}")
print("=" * 60)

conn.close()
