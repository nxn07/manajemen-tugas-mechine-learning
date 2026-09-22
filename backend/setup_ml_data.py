#!/usr/bin/env python3
"""
Generate Sample Data for ML Pipeline
Creates 26 employees with realistic performance metrics
"""

import os
import sqlite3
import random
from datetime import datetime, timedelta

# Database path (relative to project root)
DB_PATH = './database/database.sqlite' if os.path.exists('./database') else './backend/database/database.sqlite'

def setup_database():
    """Create database tables."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("PRAGMA foreign_keys = ON;")
    
    # Create all tables
    cursor.executescript("""
        CREATE TABLE IF NOT EXISTS employees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            position VARCHAR(100),
            department VARCHAR(100),
            hire_date DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS attendance_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id INTEGER,
            log_date DATE,
            status VARCHAR(20),
            check_in_time TIME,
            check_out_time TIME,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (employee_id) REFERENCES employees(id)
        );
        
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            employee_id INTEGER,
            status VARCHAR(50) DEFAULT 'assigned',
            priority VARCHAR(20) DEFAULT 'medium',
            due_date DATETIME,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (employee_id) REFERENCES employees(id)
        );
        
        CREATE TABLE IF NOT EXISTS task_submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task_id INTEGER,
            employee_id INTEGER,
            submission_text TEXT,
            attachments JSON,
            status VARCHAR(50) DEFAULT 'pending',
            submitted_at DATETIME,
            revised_at DATETIME,
            review_notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (task_id) REFERENCES tasks(id),
            FOREIGN KEY (employee_id) REFERENCES employees(id)
        );
        
        CREATE TABLE IF NOT EXISTS performance_evaluations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id INTEGER,
            evaluation_date DATE,
            score DECIMAL(5,2),
            category VARCHAR(100),
            reviewer_notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (employee_id) REFERENCES employees(id)
        );
        
        CREATE TABLE IF NOT EXISTS ml_employee_feature_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id INTEGER NOT NULL,
            evaluation_period VARCHAR(7) NOT NULL,
            attendance_percentage DECIMAL(5,2),
            tasks_completed_percentage DECIMAL(5,2),
            on_time_percentage DECIMAL(5,2),
            quality_score DECIMAL(4,2),
            discipline_score DECIMAL(4,2),
            active_tasks_count INTEGER DEFAULT 0,
            late_tasks_count INTEGER DEFAULT 0,
            avg_resolution_days DECIMAL(5,2),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(employee_id, evaluation_period)
        );
        
        CREATE TABLE IF NOT EXISTS ml_clustering_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            evaluation_period VARCHAR(7) NOT NULL,
            n_clusters INTEGER NOT NULL,
            silhouette_score DECIMAL(5,4),
            centroid_matrix JSON,
            algorithm_config JSON,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS ml_employee_clusters (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id INTEGER NOT NULL,
            clustering_result_id INTEGER NOT NULL,
            cluster_assignment INTEGER NOT NULL,
            confidence_score DECIMAL(4,3) DEFAULT 0.950,
            distance_to_centroid DECIMAL(6,4),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (employee_id) REFERENCES employees(id),
            FOREIGN KEY (clustering_result_id) REFERENCES ml_clustering_results(id),
            UNIQUE(employee_id, clustering_result_id)
        );
    """)
    
    conn.commit()
    print("✓ Database tables created successfully")
    return conn


def generate_employees(conn):
    """Generate 26 sample employees."""
    cursor = conn.cursor()
    
    # Clear existing data
    for table in ['ml_employee_clusters', 'ml_clustering_results', 'ml_employee_feature_data', 
                  'performance_evaluations', 'task_submissions', 'tasks', 'attendance_logs', 'employees']:
        cursor.execute(f"DELETE FROM {table};")
    
    first_names_m = ["Andi", "Budi", "Cahyo", "Dwi", "Eko", "Fajar", "Gilang", "Hendra", "Irwan", "Joko", 
                     "Kurnia", "Lukman", "Muhammad", "Nanda", "Oscar", "Prabowo", "Rizky", "Saputra", "Teguh", 
                     "Umar", "Vino", "Widya", "Xavier", "Yoga", "Zainal", "Arief"]
    
    last_names = ["Santoso", "Setiawan", "Wijaya", "Pratama", "Hartono", "Kusuma", "Putra", "Sari", 
                  "Ningsih", "Adi", "Komaladi", "Gunawan", "Budiman", "Maulana", "Rahardjo", "Permadi", 
                  "Anggara", "Lestari", "Wulandari", "Hakim", "Fauzi", "Nasution", "Syah", "Chandra", "Ilham"]
    
    positions = [
        ("Software Engineer", "IT"), ("Senior Developer", "IT"), ("Project Manager", "Operations"),
        ("Business Analyst", "Business"), ("HR Specialist", "HR"), ("Marketing Executive", "Marketing"),
        ("Sales Manager", "Sales"), ("Quality Assurance", "QA"), ("DevOps Engineer", "IT"),
        ("Data Analyst", "Analytics"), ("Frontend Developer", "IT"), ("Backend Developer", "IT"),
        ("UI/UX Designer", "Design"), ("Account Manager", "Sales"), ("Customer Support", "Support"),
        ("Finance Officer", "Finance"), ("Legal Advisor", "Legal"), ("Researcher", "R&D"),
        ("Content Writer", "Marketing"), ("Operations Staff", "Operations"), ("Junior Developer", "IT"),
        ("Intern", "IT"), ("Admin Assistant", "Admin"), ("Team Lead", "IT"), ("Technical Writer", "Documentation"),
        ("Consultant", "Business")
    ]
    
    employees = []
    random.seed(42)
    
    for i in range(26):
        first_name = random.choice(first_names_m)
        last_name = random.choice(last_names)
        name = f"{first_name} {last_name}"
        
        if i < 8:
            perf_tier = "high"
            position_idx = random.randint(0, min(5, len(positions)-1))
        elif i < 18:
            perf_tier = "medium"
            position_idx = random.randint(0, len(positions)-1)
        else:
            perf_tier = "low"
            position_idx = random.randint(0, len(positions)-1)
        
        position, dept = positions[position_idx]
        email = f"{name.lower().replace(' ', '.')}@cs.comptel.co.id"
        hire_date = (datetime.now() - timedelta(days=random.randint(365, 1095))).strftime('%Y-%m-%d')
        
        employees.append((name, email, position, dept, hire_date))
        
        cursor.execute("""
            INSERT INTO employees (name, email, position, department, hire_date)
            VALUES (?, ?, ?, ?, ?)
        """, (name, email, position, dept, hire_date))
    
    conn.commit()
    print(f"✓ Generated {len(employees)} employees")
    
    cursor.execute("SELECT id FROM employees ORDER BY id;")
    emp_ids = [row[0] for row in cursor.fetchall()]
    return emp_ids


def generate_attendance_data(conn, emp_ids, period='2026-09'):
    """Generate attendance logs."""
    cursor = conn.cursor()
    
    year, month = period.split('-')
    workdays = [day for day in range(1, 31) if (day + 1) % 7 not in [0, 6]]
    
    print(f"\nGenerating attendance for {len(workdays)} workdays...")
    
    for emp_id in emp_ids:
        if int(emp_id) <= 8:
            present_rate = random.uniform(0.90, 0.98)
        elif int(emp_id) <= 18:
            present_rate = random.uniform(0.75, 0.89)
        else:
            present_rate = random.uniform(0.60, 0.74)
        
        for day in workdays:
            if random.random() < present_rate:
                status = random.choices(['present', 'approved_leave'], weights=[0.85, 0.15])[0]
                check_in = f"{random.randint(8, 9):02d}:{random.randint(0, 59):02d}:00"
                check_out = f"{random.randint(17, 18):02d}:{random.randint(0, 59):02d}:00"
                
                cursor.execute("""
                    INSERT INTO attendance_logs (employee_id, log_date, status, check_in_time, check_out_time)
                    VALUES (?, ?, ?, ?, ?)
                """, (emp_id, f"{year}-{month}-{day:02d}", status, check_in, check_out))
    
    conn.commit()
    attended_records = cursor.execute("SELECT COUNT(*) FROM attendance_logs").fetchone()[0]
    print(f"✓ Created {attended_records} attendance records")


def generate_task_data(conn, emp_ids, period='2026-09'):
    """Generate tasks and submissions."""
    cursor = conn.cursor()
    
    task_titles = [
        "Develop authentication module", "Fix login bug", "Update documentation",
        "Implement dashboard UI", "Optimize database queries", "Write unit tests",
        "Review pull requests", "Deploy to staging", "Conduct code review",
        "Prepare weekly report", "Client meeting preparation", "API integration",
        "Frontend optimization", "Security audit", "Performance testing",
        "Bug fixes", "Feature development", "Code refactoring", "Technical research",
        "Training session", "Knowledge sharing", "System maintenance"
    ]
    
    print("\nGenerating tasks...")
    
    for emp_id in emp_ids:
        if int(emp_id) <= 8:
            num_tasks = random.randint(12, 18)
            completion_rate = random.uniform(0.85, 0.95)
            on_time_rate = random.uniform(0.80, 0.92)
        elif int(emp_id) <= 18:
            num_tasks = random.randint(8, 14)
            completion_rate = random.uniform(0.70, 0.84)
            on_time_rate = random.uniform(0.65, 0.79)
        else:
            num_tasks = random.randint(5, 10)
            completion_rate = random.uniform(0.50, 0.69)
            on_time_rate = random.uniform(0.50, 0.64)
        
        assigned_tasks = random.sample(task_titles, min(num_tasks, len(task_titles)))
        
        for title in assigned_tasks:
            created_day = random.randint(1, 20)
            due_day = min(created_day + random.randint(3, 10), 30)
            
            cursor.execute("""
                INSERT INTO tasks (title, employee_id, status, due_date)
                VALUES (?, ?, 'assigned', ?)
            """, (title, emp_id, f"{period}-{due_day:02d}"))
            
            task_id = cursor.lastrowid
            
            if random.random() < completion_rate:
                if random.random() < on_time_rate:
                    submitted_day = random.randint(created_day + 1, due_day)
                    status = "COMPLETED"
                else:
                    submitted_day = random.randint(due_day + 1, min(due_day + 10, 30))
                    status = random.choice(["COMPLETED", "REVISED"])
                
                submitted_at = f"{period}-{submitted_day:02d} {random.randint(9, 17):02d}:30:00"
                
                cursor.execute("""
                    INSERT INTO task_submissions (task_id, employee_id, status, submitted_at)
                    VALUES (?, ?, ?, ?)
                """, (task_id, emp_id, status, submitted_at))
    
    conn.commit()
    task_count = cursor.execute("SELECT COUNT(*) FROM tasks").fetchone()[0]
    submission_count = cursor.execute("SELECT COUNT(*) FROM task_submissions").fetchone()[0]
    print(f"✓ Created {task_count} tasks and {submission_count} submissions")


def generate_evaluation_data(conn, emp_ids):
    """Generate performance evaluations."""
    cursor = conn.cursor()
    
    print("\nGenerating performance evaluations...")
    
    for emp_id in emp_ids:
        if int(emp_id) <= 8:
            score_mean = random.uniform(82.0, 92.0)
        elif int(emp_id) <= 18:
            score_mean = random.uniform(72.0, 81.0)
        else:
            score_mean = random.uniform(62.0, 71.0)
        
        score = max(50.0, min(100.0, score_mean + random.gauss(0, 5)))
        categories = ["Technical Skills", "Communication", "Problem Solving", "Teamwork", "Productivity"]
        category = random.choice(categories)
        
        cursor.execute("""
            INSERT INTO performance_evaluations (employee_id, evaluation_date, score, category)
            VALUES (?, '2026-09-15', ?, ?)
        """, (emp_id, round(score, 2), category))
    
    conn.commit()
    eval_count = cursor.execute("SELECT COUNT(*) FROM performance_evaluations").fetchone()[0]
    print(f"✓ Created {eval_count} performance evaluations")


def main():
    """Main execution."""
    print("=" * 60)
    print("📊 SIM Kinerja ML Data Generator")
    print("=" * 60)
    
    try:
        print("\n1. Setting up database tables...")
        conn = setup_database()
        
        print("\n2. Generating 26 employees...")
        emp_ids = generate_employees(conn)
        
        print("\n3. Creating attendance data...")
        generate_attendance_data(conn, emp_ids, '2026-09')
        
        print("\n4. Creating tasks and submissions...")
        generate_task_data(conn, emp_ids, '2026-09')
        
        print("\n5. Creating performance evaluations...")
        generate_evaluation_data(conn, emp_ids)
        
        print("\n" + "=" * 60)
        print("✅ Sample Data Generation Complete!")
        print("=" * 60)
        print(f"Employees: 26 (8 high, 10 medium, 8 low performers)")
        print(f"Period: 2026-09")
        print(f"Database: {DB_PATH}")
        print("=" * 60)
        
        conn.close()
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    main()
