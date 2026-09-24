"""
K-Means Clustering Engine
Executes K-Means training, silhouette score evaluation, and centroid distance computation.
"""

import numpy as np
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from typing import Dict, Any, List, Optional
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from config.ml_config import MLConfig


class KMeansEngine:
    """Core K-Means Clustering Machine Learning Engine."""

    def __init__(
        self,
        n_clusters: int = MLConfig.DEFAULT_N_CLUSTERS,
        random_state: int = MLConfig.RANDOM_STATE,
        max_iter: int = MLConfig.MAX_ITER,
        n_init: int = MLConfig.N_INIT
    ):
        self.n_clusters = n_clusters
        self.random_state = random_state
        self.max_iter = max_iter
        self.n_init = n_init
        self.model: Optional[KMeans] = None

    def fit(self, normalized_matrix: np.ndarray) -> 'KMeansEngine':
        """Train K-Means clustering algorithm on normalized features."""
        n_samples = normalized_matrix.shape[0]
        actual_clusters = min(self.n_clusters, n_samples)

        self.model = KMeans(
            n_clusters=actual_clusters,
            init='k-means++',
            n_init=self.n_init,
            max_iter=self.max_iter,
            random_state=self.random_state,
            algorithm=MLConfig.ALGORITHM
        )

        self.model.fit(normalized_matrix)
        return self

    def predict(self, normalized_matrix: np.ndarray) -> np.ndarray:
        """Predict cluster assignments for samples."""
        if self.model is None:
            raise RuntimeError("Model has not been trained yet. Call fit() first.")
        return self.model.predict(normalized_matrix)

    def evaluate(self, normalized_matrix: np.ndarray, labels: np.ndarray) -> Dict[str, Any]:
        """
        Calculate Silhouette Score and Inertia metrics.
        Formula: s = (b - a) / max(a, b)
        """
        if self.model is None:
            raise RuntimeError("Model has not been trained yet.")

        n_labels = len(np.unique(labels))
        if n_labels > 1 and len(labels) > n_labels:
            sil_score = float(silhouette_score(normalized_matrix, labels))
        else:
            sil_score = 0.0

        # Determine quality interpretation based on Silhouette Score
        if sil_score >= MLConfig.SILHOUETTE_THRESHOLDS['EXCELLENT']:
            quality = "Sangat Baik (Klaster terpisah sangat tegas & konsisten)"
        elif sil_score >= MLConfig.SILHOUETTE_THRESHOLDS['GOOD']:
            quality = "Baik (Pola klaster jelas dan dapat diandalkan)"
        elif sil_score >= MLConfig.SILHOUETTE_THRESHOLDS['MODERATE']:
            quality = "Cukup (Pola klaster moderat, struktur wajar)"
        else:
            quality = "Rendah (Variasi antar klaster tumpang tindih)"

        return {
            'silhouette_score': round(sil_score, 4),
            'inertia': round(float(self.model.inertia_), 4),
            'quality_interpretation': quality,
            'n_clusters': self.n_clusters
        }

    def compute_distances_to_centroids(
        self,
        normalized_matrix: np.ndarray,
        labels: np.ndarray
    ) -> np.ndarray:
        """Calculate Euclidean distance of each employee sample to its assigned cluster centroid."""
        if self.model is None:
            raise RuntimeError("Model has not been trained yet.")

        centroids = self.model.cluster_centers_
        distances = np.zeros(normalized_matrix.shape[0])

        for i, (sample, label) in enumerate(zip(normalized_matrix, labels)):
            centroid = centroids[label]
            distances[i] = np.linalg.norm(sample - centroid)

        return distances

    def find_optimal_k(self, normalized_matrix: np.ndarray, k_range: range = range(2, 6)) -> Dict[int, float]:
        """Evaluate silhouette scores across different values of k (Elbow / Silhouette search)."""
        scores = {}
        for k in k_range:
            if k >= normalized_matrix.shape[0]:
                break
            km = KMeans(n_clusters=k, init='k-means++', n_init=10, random_state=self.random_state)
            cluster_labels = km.fit_predict(normalized_matrix)
            score = silhouette_score(normalized_matrix, cluster_labels)
            scores[k] = round(float(score), 4)
        return scores
