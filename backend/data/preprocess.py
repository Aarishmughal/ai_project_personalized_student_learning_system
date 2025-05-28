import os
import json
import pandas as pd

# Utility to get absolute path to data files
DATA_DIR = os.path.dirname(os.path.abspath(__file__))
def data_path(filename):
    return os.path.join(DATA_DIR, filename)

# Load JSON files
with open(data_path('assessmentGrades.json')) as f:
    grades = json.load(f)

with open(data_path('assessments.json')) as f:
    assessments = json.load(f)

with open(data_path('students.json')) as f:
    students = json.load(f)

# Create mapping
assessment_map = {
    a["_id"]: {
        "title": a["title"],
        "type": a["type"],
        "total": int(a["totalMarks"]),
        "weightage": float(str(a.get("weightage", "0")).replace("%", "")) / 100.0
    }
    for a in assessments
}

# Get all assessment IDs
all_assessment_ids = [a["_id"] for a in assessments]

# Structure training data
data_rows = []

for student in students:
    student_id = student["_id"]
    row = {"student_id": student_id}
    student_grades = grades.get(student_id, {})
    for a_id in all_assessment_ids:
        a_type = assessment_map[a_id]["type"]
        total = assessment_map[a_id]["total"]
        weightage = assessment_map[a_id]["weightage"]
        score = student_grades.get(a_id, 0)
        # Normalised and weighted score
        norm_score = (score / total) * weightage if total else 0
        row[f"{a_type}_{a_id[:5]}"] = norm_score
    data_rows.append(row)

df = pd.DataFrame(data_rows).fillna(0)
print(df.head())
# Save the DataFrame to a CSV file
df.to_csv('data/training_data.csv', index=False)