#!/usr/bin/env python3
"""
Optimized ML Clustering Processor for K-Means Algorithm
Designed for fast processing of employee performance data
"""

import json
import sys
import time
import os
from datetime import datetime
import numpy as np
from sklearn.cluster import KMeans, MiniBatchKMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score


def print_step(message):
    """Print timestamped progress message."""
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{timestamp}] {message}")


def load_data(data_path: str) -> tuple:
    """Load employee feature data from JSON file."""
    print_step(f"Loading data from {data_path}...")
    
    try:
        with open(data_path, 'r') as f:
            data = json.load(f)
        
        if 'employees' in data:
            matrix = np.array([row['features'] for row in data['employees']], dtype=float)
            labels = [row['label'] for row in data['employees']]
            feature_names = data.get('feature_names', data.get('features', []))
        elif 'matrix' in data and 'labels' in data:
            matrix = np.array(data['matrix'], dtype=float)
            labels = data['labels']
            feature_names = data.get('features', data.get('feature_names', []))
        else:
            raise ValueError("Invalid format: expected 'employees' or 'matrix'/'labels' in JSON data")
        
        print_step(f"✅ Loaded {len(labels)} employees with {matrix.shape[1]} features")
        
        return matrix, labels, feature_names
        
    except Exception as e:
        raise ValueError(f"Failed to load data: {str(e)}")


def preprocess_data(matrix: np.ndarray):
    """Normalize data using StandardScaler for fair comparison."""
    print_step("Normalizing data with StandardScaler...")
    
    try:
        scaler = StandardScaler()
        matrix_normalized = scaler.fit_transform(matrix)
        
        print_step("✅ Data normalized successfully")
        
        return matrix_normalized, scaler
        
    except Exception as e:
        raise ValueError(f"Failed to normalize data: {str(e)}")


def run_kmeans(matrix_normalized: np.ndarray, n_clusters: int, employee_count: int = None) -> tuple:
    """Run K-Means algorithm with adaptive optimization based on dataset size."""
    print_step(f"Running K-Means with {n_clusters} clusters ({employee_count or matrix_normalized.shape[0]} employees)...")
    
    start_time = time.time()
    
    try:
        # Adaptive algorithm selection based on dataset size
        n_samples = matrix_normalized.shape[0]
        
        # Use MiniBatchKMeans for large datasets (>150 employees) for ~5-10x speedup
        if n_samples > 150:
            print_step(f"⚡ Using MiniBatchKMeans for faster processing ({n_samples} employees)")
            batch_size = min(32, n_samples)  # Process in small batches
            kmeans = MiniBatchKMeans(
                n_clusters=n_clusters,
                batch_size=batch_size,
                max_iter=50,              # Reasonable iteration limit
                tol=1e-3,                  # Convergence tolerance
                random_state=42,          # Reproducible results
                n_init='auto',            # Auto-determine optimal initialization count
                verbose=0
            )
        else:
            # Standard KMeans for smaller datasets (more accurate)
            print_step(f"🎯 Using Standard KMeans for accuracy ({n_samples} employees)")
            kmeans = KMeans(
                n_clusters=n_clusters,
                init='k-means++',        # Smart initialization helps convergence
                n_init=10,               # Good balance of speed vs accuracy
                max_iter=50,             # Lower iteration limit for speed
                tol=1e-3,                # Convergence tolerance
                random_state=42,         # Reproducible results
                algorithm='lloyd'        # Classic algorithm (fastest for small/medium datasets)
            )
        
        cluster_labels = kmeans.fit_predict(matrix_normalized)
        
        elapsed = time.time() - start_time
        algo_type = "MiniBatchKMeans" if n_samples > 150 else "Standard KMeans"
        print_step(f"✅ Clustering completed in {elapsed:.2f}s using {algo_type}")
        
        return kmeans, cluster_labels
        
    except Exception as e:
        raise ValueError(f"K-Means failed: {str(e)}")


def evaluate_clusters(matrix_normalized: np.ndarray, cluster_labels: np.ndarray, kmeans) -> dict:
    """Evaluate clustering quality - OPTIMIZED for speed."""
    print_step("Evaluating cluster quality...")
    
    try:
        # Calculate silhouette score (only if we have >= 2 clusters and enough samples)
        n_samples = len(cluster_labels)
        unique_labels = np.unique(cluster_labels)
        
        silhouette = None
        interpretation = None
        
        if len(unique_labels) >= 2 and n_samples >= 4:
            silhouette = silhouette_score(matrix_normalized, cluster_labels)
            
            # Interpret silhouette score
            if silhouette >= 0.7:
                interpretation = "✅ Excellent clustering - strong, well-separated clusters"
            elif silhouette >= 0.5:
                interpretation = "✓ Good clustering - reasonable structure detected"
            elif silhouette >= 0.4:
                interpretation = "⚠️ Moderate clustering - weak structure, consider different k"
            else:
                interpretation = "❌ Poor clustering - data may not have clear cluster structure"
            
            print_step(f"Silhouette Score: {silhouette:.3f} - {interpretation}")
        
        # Calculate inertia (internal compactness metric)
        inertia = kmeans.inertia_ if hasattr(kmeans, 'inertia_') else kmeans.cost_ / kmeans.n_samples_seen_
        print_step(f"Inertia: {inertia:.2f}")
        
        return {
            'silhouette_score': float(silhouette) if silhouette is not None else 0.0,
            'quality_interpretation': interpretation or "Cannot evaluate (insufficient data)",
            'inertia': float(inertia)
        }
        
    except Exception as e:
        print_step(f"⚠️ Warning: Could not evaluate clusters: {str(e)}")
        return {
            'silhouette_score': 0.0,
            'quality_interpretation': f"Evaluation error: {str(e)}",
            'inertia': 0.0
        }


def assign_employees_to_clusters(
    matrix_normalized: np.ndarray,
    cluster_labels: np.ndarray,
    labels: list,
    kmeans
) -> list:
    """Map employees to clusters with distance calculations."""
    print_step("Assigning employees to clusters...")
    
    try:
        # Get centroids
        centroids = kmeans.cluster_centers_
        
        assignments = []
        for i, (label, cluster_id) in enumerate(zip(labels, cluster_labels)):
            # Calculate distance to assigned centroid
            center = centroids[cluster_id]
            current_point = matrix_normalized[i]
            distance = float(np.linalg.norm(current_point - center))
            
            assignments.append({
                'label': label,
                'cluster': int(cluster_id),
                'distance': distance
            })
        
        print_step(f"✅ Assigned {len(assignments)} employees to clusters")
        
        return assignments
        
    except Exception as e:
        raise ValueError(f"Failed to assign employees: {str(e)}")


def interpret_clusters(centroids: list) -> dict:
    """Auto-interpret cluster characteristics based on centroid values."""
    print_step("Interpreting cluster characteristics...")
    
    interpretations = {}
    
    # Normalize centroids to 0-100 scale for easier interpretation
    if isinstance(centroids, np.ndarray):
        centroids_array = centroids
    else:
        centroids_array = np.array(centroids)
    
    # Find min/max for each feature across all clusters
    feature_min = centroids_array.min(axis=0)
    feature_max = centroids_array.max(axis=0)
    
    # Avoid division by zero
    feature_range = feature_max - feature_min
    feature_range[feature_range == 0] = 1
    
    # Normalize centroids
    normalized_centroids = (centroids_array - feature_min) / feature_range
    
    for cluster_id, centroid in enumerate(normalized_centroids):
        # Average score across all features (first 5 are positive indicators)
        avg_score = np.mean(centroid[:5]) * 100
        
        if avg_score >= 70:
            interpretations[cluster_id] = "High Performance Cluster (Top Performers)"
        elif avg_score >= 40:
            interpretations[cluster_id] = "Medium Performance Cluster (Average Contributors)"
        else:
            interpretations[cluster_id] = "Low Performance Cluster (Needs Improvement)"
        
        print_step(f"Cluster {cluster_id}: {interpretations[cluster_id]} (score: {avg_score:.1f})")
    
    return interpretations


def main():
    """Main entry point with comprehensive error handling."""
    print("=" * 60)
    print_step("ML Clustering Processor Started")
    print("=" * 60)
    
    try:
        # Parse command line arguments
        if len(sys.argv) < 3:
            print("Usage: python ml_processor.py <input_file.json> <n_clusters>")
            sys.exit(1)
        
        input_path = sys.argv[1]
        n_clusters = int(sys.argv[2])
        
        # Validate input file exists
        if not os.path.exists(input_path):
            raise FileNotFoundError(f"Input file not found: {input_path}")
        
        # Step 1: Load data
        print("\n--- Phase 1: Data Loading ---")
        matrix, labels, feature_names = load_data(input_path)
        employee_count = len(labels)
        
        # Step 2: Preprocess data
        print("\n--- Phase 2: Data Preprocessing ---")
        matrix_normalized, scaler = preprocess_data(matrix)
        
        # Step 3: Run K-Means clustering
        print("\n--- Phase 3: Clustering ---")
        kmeans, cluster_labels = run_kmeans(
            matrix_normalized, 
            n_clusters, 
            employee_count
        )
        
        # Step 4: Evaluate clustering quality
        print("\n--- Phase 4: Quality Evaluation ---")
        quality_metrics = evaluate_clusters(matrix_normalized, cluster_labels, kmeans)
        
        # Step 5: Assign employees to clusters
        print("\n--- Phase 5: Employee Assignment ---")
        assignments = assign_employees_to_clusters(
            matrix_normalized, 
            cluster_labels, 
            labels, 
            kmeans
        )
        
        # Step 6: Interpret clusters
        print("\n--- Phase 6: Cluster Interpretation ---")
        centroids = scaler.inverse_transform(kmeans.cluster_centers_).tolist()
        interpretations = interpret_clusters(centroids)
        
        # Prepare output
        output = {
            'silhouette_score': quality_metrics['silhouette_score'],
            'quality_interpretation': quality_metrics['quality_interpretation'],
            'inertia': quality_metrics['inertia'],
            'feature_names': feature_names,
            'centroids': centroids,
            'cluster_assignments': assignments,
            'interpretations': interpretations
        }
        
        # Save output
        output_path = input_path.replace('.json', '_output.json')
        with open(output_path, 'w') as f:
            json.dump(output, f, indent=2)
        
        print_step(f"✅ Output saved to {output_path}")
        
        # Print summary
        print("\n" + "=" * 60)
        print("CLUSTERING SUMMARY")
        print("=" * 60)
        print(f"Employees processed: {employee_count}")
        print(f"Clusters created: {n_clusters}")
        print(f"Silhouette Score: {quality_metrics['silhouette_score']:.3f}")
        print(f"Quality: {quality_metrics['quality_interpretation']}")
        
        # Count employees per cluster
        from collections import Counter
        cluster_counts = Counter(cluster_labels)
        print("\nCluster Distribution:")
        for cluster_id, count in sorted(cluster_counts.items()):
            print(f"  Cluster {cluster_id}: {count} employees")
        
        print("=" * 60)
        print_step("Processing completed successfully!")
        
        sys.exit(0)
        
    except FileNotFoundError as e:
        print_step(f"❌ File Error: {str(e)}")
        sys.exit(1)
    except ValueError as e:
        print_step(f"❌ Validation Error: {str(e)}")
        sys.exit(1)
    except Exception as e:
        print_step(f"❌ Unexpected Error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
