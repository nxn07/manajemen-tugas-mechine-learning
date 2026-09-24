"""
Cluster Interpretation Module
Translates mathematical cluster centroids into human-readable performance evaluations.
"""

from typing import List, Dict, Any
import numpy as np


class ClusterInterpreter:
    """Interprets K-Means centroids into performance categories."""

    @staticmethod
    def interpret_centroids(
        centroids: List[List[float]],
        feature_names: List[str]
    ) -> Dict[str, str]:
        """
        Rank each cluster by its overall positive performance metric score.
        Positive features (higher = better):
          - attendance_percentage
          - tasks_completed_percentage
          - on_time_percentage
          - quality_score
          - discipline_score
        Negative features (lower = better):
          - late_tasks_count
          - avg_resolution_days
        """
        cluster_scores = []

        for cluster_id, centroid in enumerate(centroids):
            positive_score = 0.0
            negative_penalty = 0.0

            for val, feat in zip(centroid, feature_names):
                f_lower = feat.lower()
                if 'late' in f_lower:
                    negative_penalty += val * 5.0
                elif 'resolution' in f_lower or 'days' in f_lower:
                    negative_penalty += val * 2.0
                else:
                    positive_score += val

            net_score = positive_score - negative_penalty
            cluster_scores.append((cluster_id, net_score))

        # Sort clusters by net score in descending order (highest score = Tier 1)
        sorted_by_score = sorted(cluster_scores, key=lambda x: x[1], reverse=True)

        interpretations = {}
        tier_names = [
            "Kinerja Tinggi (High Performers)",
            "Kinerja Sedang (Medium Performers)",
            "Kinerja Rendah (Low Performers - Perlu Pembinaan)",
            "Klaster 4 (Spesifik)",
            "Klaster 5 (Spesifik)"
        ]

        for rank, (cluster_id, score) in enumerate(sorted_by_score):
            label = tier_names[rank] if rank < len(tier_names) else f"Klaster {rank+1}"
            interpretations[str(cluster_id)] = label

        return interpretations
