"""
Unit Tests for Machine Learning Module
"""

import unittest
import numpy as np
import os
import sys

# Setup path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.preprocessor import FeaturePreprocessor
from src.kmeans_engine import KMeansEngine
from src.interpreter import ClusterInterpreter
from config.ml_config import MLConfig


class TestMLPipeline(unittest.TestCase):

    def setUp(self):
        # Generate synthetic 10 employees x 8 features
        np.random.seed(42)
        self.sample_data = np.random.uniform(50.0, 100.0, size=(10, 8))
        self.feature_names = MLConfig.FEATURE_NAMES

    def test_preprocessor(self):
        preprocessor = FeaturePreprocessor()
        scaled = preprocessor.fit_transform(self.sample_data)
        self.assertEqual(scaled.shape, (10, 8))
        # Mean should be close to 0 and std close to 1
        self.assertTrue(np.allclose(scaled.mean(axis=0), 0, atol=1e-5))

        inv = preprocessor.inverse_transform(scaled)
        self.assertTrue(np.allclose(inv, self.sample_data, atol=1e-5))

    def test_kmeans_engine(self):
        preprocessor = FeaturePreprocessor()
        scaled = preprocessor.fit_transform(self.sample_data)

        engine = KMeansEngine(n_clusters=3, random_state=42)
        engine.fit(scaled)
        labels = engine.predict(scaled)

        self.assertEqual(len(labels), 10)
        self.assertTrue(len(np.unique(labels)) <= 3)

        metrics = engine.evaluate(scaled, labels)
        self.assertIn('silhouette_score', metrics)
        self.assertIn('inertia', metrics)

        distances = engine.compute_distances_to_centroids(scaled, labels)
        self.assertEqual(len(distances), 10)
        self.assertTrue(all(d >= 0 for d in distances))

    def test_cluster_interpreter(self):
        centroids = [
            [95, 90, 92, 90, 95, 4, 0, 1.2], # High
            [75, 70, 75, 75, 78, 2, 2, 3.5], # Medium
            [55, 50, 55, 55, 60, 1, 5, 7.0]  # Low
        ]
        interpretations = ClusterInterpreter.interpret_centroids(centroids, self.feature_names)
        self.assertEqual(len(interpretations), 3)
        self.assertIn("High", interpretations['0'])


if __name__ == '__main__':
    unittest.main()
