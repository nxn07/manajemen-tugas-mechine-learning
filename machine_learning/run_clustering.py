#!/usr/bin/env python3
"""
Main Execution Script for Employee K-Means Clustering Machine Learning Service
Supports execution from SQLite database or input JSON files.
Clean ASCII output for 100% Windows and Linux console compatibility.
"""

import argparse
import json
import os
import sys
from datetime import datetime

# Setup module path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config.ml_config import MLConfig
from src.data_loader import DataLoader
from src.preprocessor import FeaturePreprocessor
from src.kmeans_engine import KMeansEngine
from src.interpreter import ClusterInterpreter


def parse_args():
    parser = argparse.ArgumentParser(
        description="Run K-Means clustering on employee performance data."
    )
    parser.add_argument(
        "--source",
        choices=["sqlite", "json"],
        default="sqlite",
        help="Data source (default: sqlite)"
    )
    parser.add_argument(
        "--db",
        default=os.path.join(os.path.dirname(__file__), "..", "backend", "database", "database.sqlite"),
        help="Path to SQLite database file"
    )
    parser.add_argument(
        "--input",
        help="Path to input JSON file (required if --source is json)"
    )
    parser.add_argument(
        "--period",
        default="2026-09",
        help="Evaluation period in YYYY-MM format (default: 2026-09)"
    )
    parser.add_argument(
        "--clusters",
        type=int,
        default=MLConfig.DEFAULT_N_CLUSTERS,
        help="Number of clusters (k) to generate (default: 3)"
    )
    parser.add_argument(
        "--output",
        help="Path to save output JSON results (optional)"
    )
    return parser.parse_args()


def main():
    args = parse_args()
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    print("=" * 65)
    print("PT CENTRAL SAGA MANDALA - MACHINE LEARNING CLUSTERING ENGINE")
    print("=" * 65)
    print(f"Timestamp:   {timestamp}")
    print(f"Data Source: {args.source.upper()}")
    print(f"Period:      {args.period}")
    print(f"Clusters k:  {args.clusters}")
    print("-" * 65)

    # 1. Load Data
    try:
        if args.source == "json":
            if not args.input or not os.path.exists(args.input):
                print(f"[ERROR] Input JSON file not found: {args.input}")
                sys.exit(1)
            print(f"[*] Loading data from JSON: {args.input}...")
            matrix, employees, feature_names = DataLoader.load_from_json(args.input)
        else:
            db_path = os.path.abspath(args.db)
            if not os.path.exists(db_path):
                print(f"[ERROR] Database not found at: {db_path}")
                sys.exit(1)
            print(f"[*] Loading features from SQLite: {db_path} (Period: {args.period})...")
            matrix, employees, feature_names = DataLoader.load_from_sqlite(db_path, args.period)

        print(f"[OK] Loaded {len(employees)} employees with {matrix.shape[1]} features")

    except Exception as e:
        print(f"[ERROR] Data Loading Failed: {e}")
        sys.exit(1)

    # 2. Preprocess & Normalize
    print("[*] Normalizing features using StandardScaler...")
    preprocessor = FeaturePreprocessor()
    normalized_matrix = preprocessor.fit_transform(matrix)

    # 3. Train K-Means
    print(f"[*] Training K-Means with k={args.clusters} (k-means++, n_init=10)...")
    engine = KMeansEngine(n_clusters=args.clusters)
    engine.fit(normalized_matrix)
    labels = engine.predict(normalized_matrix)

    # 4. Evaluate Clustering (Silhouette Score & Inertia)
    metrics = engine.evaluate(normalized_matrix, labels)
    distances = engine.compute_distances_to_centroids(normalized_matrix, labels)

    print(f"[+] Silhouette Score: {metrics['silhouette_score']:.4f}")
    print(f"[+] Quality Rating:   {metrics['quality_interpretation']}")
    print(f"[+] Total Inertia:    {metrics['inertia']:.2f}")

    # 5. Inverse Transform Centroids & Interpret
    original_centroids = preprocessor.inverse_transform(engine.model.cluster_centers_).tolist()
    interpretations = ClusterInterpreter.interpret_centroids(original_centroids, feature_names)

    # 6. Group Members
    clusters_grouped = {}
    distribution = {}

    for i, emp in enumerate(employees):
        c_id = str(labels[i])
        if c_id not in clusters_grouped:
            clusters_grouped[c_id] = []
            distribution[c_id] = 0

        distribution[c_id] += 1
        clusters_grouped[c_id].append({
            'employee_id': emp.get('employee_id', emp.get('id', i + 1)),
            'name': emp.get('name', f"Employee #{i+1}"),
            'position': emp.get('position', 'Staff'),
            'division': emp.get('division', emp.get('department', 'General')),
            'distance_to_centroid': round(float(distances[i]), 4)
        })

    # Display Cluster Distribution Summary
    print("\n" + "=" * 65)
    print("HASIL DISTRIBUSI KLASTER:")
    print("=" * 65)
    for c_id, count in sorted(distribution.items(), key=lambda x: int(x[0])):
        label = interpretations.get(c_id, f"Cluster {c_id}")
        pct = (count / len(employees)) * 100
        print(f"  - Klaster {c_id}: {label:<40} -> {count:>2} Pegawai ({pct:.1f}%)")

    # 7. Build Output Dictionary
    result_data = {
        'period': args.period,
        'n_clusters': args.clusters,
        'silhouette_score': metrics['silhouette_score'],
        'quality_interpretation': metrics['quality_interpretation'],
        'inertia': metrics['inertia'],
        'cluster_distribution': distribution,
        'interpretations': interpretations,
        'centroids': original_centroids,
        'feature_names': feature_names,
        'clusters': clusters_grouped,
        'metadata': {
            'total_employees': len(employees),
            'generated_at': datetime.now().isoformat()
        }
    }

    # Save to file if requested
    if args.output:
        out_file = os.path.abspath(args.output)
        with open(out_file, 'w', encoding='utf-8') as f:
            json.dump(result_data, f, indent=2)
        print(f"\n[OK] Output saved to: {out_file}")

    print("\n[OK] Eksekusi Machine Learning K-Means Selesai dengan Sukses!")
    return result_data


if __name__ == '__main__':
    main()
