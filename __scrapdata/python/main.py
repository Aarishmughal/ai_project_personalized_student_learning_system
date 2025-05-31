import json
import pandas as pd

# Load JSON files
with open('assessmentGrades.json') as f:
    grades = json.load(f)

with open('assessments.json') as f:
    assessments = json.load(f)

with open('students.json') as f:
    students = json.load(f)

# Create mapping from assessment ID to type and totalMarks
assessment_map = {
    a["_id"]: {
        "title": a["title"],
        "type": a["type"],
        "total": int(a["totalMarks"])
    }
    for a in assessments
}

# Structure training data
data_rows = []

for student_id, assessments_scores in grades.items():
    row = {"student_id": student_id}
    for a_id, score in assessments_scores.items():
        a_type = assessment_map[a_id]["type"]
        total = assessment_map[a_id]["total"]
        row[a_type + "_" + a_id[:5]] = score / total  # Normalised score
    data_rows.append(row)

df = pd.DataFrame(data_rows).fillna(0)
print(df.head())
