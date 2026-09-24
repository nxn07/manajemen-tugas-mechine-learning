"""
Data Loader Module for Employee Performance Features
Loads feature matrices from JSON files or directly from SQLite databases.
"""

import json
import sqlite3
import numpy as np
from typing import Tuple, List, Dict, Any, Optional


class DataLoader:
    """Handles loading employee feature data from various sources."""

    @staticmethod
    def load_from_json(json_path: str) -> Tuple[np.ndarray, List[Dict[str, Any]], List[str]]:
        """
        Load feature data from a JSON file.
        Returns:
            matrix: np.ndarray of shape (n_samples, n_features)
            employees: list of employee metadata dicts
            feature_names: list of feature names
        """
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        if 'employees' in data:
            employees = data['employees']
            matrix = np.array([row['features'] for row in employees], dtype=float)
            feature_names = data.get('feature_names', data.get('features', []))
        elif 'matrix' in data and 'labels' in data:
            matrix = np.array(data['matrix'], dtype=float)
            employees = [{'id': idx, 'name': label, 'features': row} for idx, (label, row) in enumerate(zip(data['labels'], matrix))]
            feature_names = data.get('features', data.get('feature_names', []))
        else:
            raise ValueError("Invalid format: expected 'employees' or ('matrix' and 'labels') in JSON data")

        return matrix, employees, feature_names

    @staticmethod
    def load_from_sqlite(
        db_path: str,
        period: str = '2026-09'
    ) -> Tuple[np.ndarray, List[Dict[str, Any]], List[str]]:
        """
        Load feature data directly from the SQLite database for a specific period.
        """
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()

        feature_cols = [
            'attendance_percentage',
            'tasks_completed_percentage',
            'on_time_percentage',
            'quality_score',
            'discipline_score',
            'active_tasks_count',
            'late_tasks_count',
            'avg_resolution_days'
        ]

        query = f"""
            SELECT 
                f.id as feature_id,
                f.employee_id,
                f.evaluation_period,
                e.name,
                e.position,
                e.department,
                {', '.join(['f.' + c for c in feature_cols])}
            FROM ml_employee_feature_data f
            JOIN employees e ON f.employee_id = e.id
            WHERE f.evaluation_period = ?
            ORDER BY f.employee_id ASC
        """

        cur.execute(query, (period,))
        rows = cur.fetchall()

        if not rows:
            # Fallback to latest available period
            cur.execute("""
                SELECT DISTINCT evaluation_period 
                FROM ml_employee_feature_data 
                ORDER BY id DESC LIMIT 1
            """)
            latest = cur.fetchone()
            if latest:
                cur.execute(query, (latest['evaluation_period'],))
                rows = cur.fetchall()

        conn.close()

        if not rows:
            raise ValueError(f"No feature records found in database for period '{period}'")

        employees = []
        matrix_rows = []

        for r in rows:
            features = [float(r[col] or 0.0) for col in feature_cols]
            matrix_rows.append(features)
            employees.append({
                'employee_id': r['employee_id'],
                'name': r['name'],
                'position': r['position'],
                'division': r['department'] or 'General',
                'features': features
            })

        matrix = np.array(matrix_rows, dtype=float)
        return matrix, employees, feature_cols
