"""
Feature Preprocessor Module
Applies StandardScaler normalization and input validation.
"""

import numpy as np
from sklearn.preprocessing import StandardScaler
from typing import Tuple


class FeaturePreprocessor:
    """Handles scaling and validation of numerical feature matrices."""

    def __init__(self):
        self.scaler = StandardScaler()
        self.is_fitted = False

    def fit_transform(self, matrix: np.ndarray) -> np.ndarray:
        """
        Standardize features by removing the mean and scaling to unit variance.
        Formula: z = (x - u) / s
        """
        if matrix.ndim != 2:
            raise ValueError(f"Expected 2D array, got shape {matrix.shape}")

        if matrix.shape[0] < 2:
            raise ValueError(f"At least 2 samples required for clustering, got {matrix.shape[0]}")

        # Handle NaNs or Infs
        if np.isnan(matrix).any() or np.isinf(matrix).any():
            matrix = np.nan_to_num(matrix, nan=0.0, posinf=100.0, neginf=0.0)

        matrix_normalized = self.scaler.fit_transform(matrix)
        self.is_fitted = True
        return matrix_normalized

    def inverse_transform(self, scaled_matrix: np.ndarray) -> np.ndarray:
        """Inverse transform scaled centroids back to original metric units."""
        if not self.is_fitted:
            raise RuntimeError("Preprocessor has not been fitted yet.")
        return self.scaler.inverse_transform(scaled_matrix)
