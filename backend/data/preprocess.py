import json
import pandas as pd

# Load JSON files
with open('assessmentGrades.json') as f:
    grades = json.load(f)

with open('assessments.json') as f:
    assessments = json.load(f)

with open('students.json') as f:
    students = json.load(f)

# Create mapping
assessment_map = {
    a["_id"]: {
        "title": a["title"],
        "type": a["type"],
        "total": int(a["totalMarks"])
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
        score = student_grades.get(a_id, 0)
        row[a_type + "_" + a_id[:5]] = score / total if total else 0  # Normalised score
    data_rows.append(row)

df = pd.DataFrame(data_rows).fillna(0)
print(df.head())
# Save the DataFrame to a CSV file
df.to_csv('training_data.csv', index=False)