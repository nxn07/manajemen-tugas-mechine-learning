"""
Configuration settings for Employee Performance K-Means Clustering
"""

from typing import List, Dict

class MLConfig:
    # Model Hyperparameters
    DEFAULT_N_CLUSTERS: int = 3
    RANDOM_STATE: int = 42
    MAX_ITER: int = 300
    N_INIT: int = 10
    ALGORITHM: str = 'lloyd'

    # Features used for clustering (8 core metrics)
    FEATURE_NAMES: List[str] = [
        'attendance_percentage',
        'tasks_completed_percentage',
        'on_time_percentage',
        'quality_score',
        'discipline_score',
        'active_tasks_count',
        'late_tasks_count',
        'avg_resolution_days'
    ]

    # Feature weights (if weighted normalization is applied, 1.0 = equal)
    FEATURE_WEIGHTS: Dict[str, float] = {
        'attendance_percentage': 1.0,
        'tasks_completed_percentage': 1.2,
        'on_time_percentage': 1.1,
        'quality_score': 1.3,
        'discipline_score': 1.0,
        'active_tasks_count': 0.8,
        'late_tasks_count': 1.2,       # higher late tasks is negative
        'avg_resolution_days': 1.0      # higher resolution days is slower
    }

    # Silhouette Score Quality Categories
    SILHOUETTE_THRESHOLDS = {
        'EXCELLENT': 0.70,
        'GOOD': 0.50,
        'MODERATE': 0.30,
        'POOR': 0.00
    }

    # Default cluster performance labels
    CLUSTER_TIERS = {
        'TIER_1': 'Kinerja Tinggi (High Performers)',
        'TIER_2': 'Kinerja Sedang (Medium Performers)',
        'TIER_3': 'Kinerja Rendah (Low Performers - Perlu Pembinaan)'
    }
