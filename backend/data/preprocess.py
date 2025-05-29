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
        # Store weightage as integer percentage (e.g., 20 for 20%)
        "weightage": int(a.get("weightage", 0))
    }
    for a in assessments
}

# Get all assessment IDs
all_assessment_ids = [a["_id"] for a in assessments]

# Structure training data - CORRECTED VERSION
data_rows = []

for student in students:
    student_id = student["_id"]
    row = {"student_id": student_id}
    student_grades = grades.get(student_id, {})
    
    for a_id in all_assessment_ids:
        a_type = assessment_map[a_id]["type"]
        total = assessment_map[a_id]["total"]
        score = student_grades.get(a_id, 0)
        
        # CORRECTED: Only normalize by total marks (0-1 scale)
        # Don't apply weightage here - weightages should only be used for final grade calculation
        norm_score = (score / total) if total else 0
        
        row[f"{a_type}_{a_id[:5]}"] = norm_score
    
    data_rows.append(row)

df = pd.DataFrame(data_rows).fillna(0)

# Optional: Calculate weighted final grade as a potential prediction target
# This shows the correct way to apply weightages
print("Calculating weighted final grades...")
df['weighted_final_grade'] = 0.0

for idx, row in df.iterrows():
    final_grade = 0
    total_weight = 0
    
    for a_id in all_assessment_ids:
        a_type = assessment_map[a_id]["type"]
        weightage = assessment_map[a_id]["weightage"]
        norm_score = row[f"{a_type}_{a_id[:5]}"]
        
        # Apply weightage for final grade calculation
        final_grade += norm_score * (weightage / 100.0)
        total_weight += weightage / 100.0
    
    # Normalize by total weight if weights don't sum to 100%
    if total_weight > 0:
        df.at[idx, 'weighted_final_grade'] = final_grade / total_weight
    else:
        df.at[idx, 'weighted_final_grade'] = 0

# Display information about the processed data
print("Training data preprocessing completed!")
print(f"Number of students: {len(students)}")
print(f"Number of assessments: {len(all_assessment_ids)}")
print(f"Data shape: {df.shape}")
print("\nAssessment types and weightages:")
for a_id in all_assessment_ids:
    a_info = assessment_map[a_id]
    print(f"  {a_info['type']} ({a_id[:5]}): {a_info['weightage']}% weight, {a_info['total']} total marks")

print(f"\nFirst few rows of training data:")
print(df.head())

print(f"\nWeighted final grade statistics:")
print(f"  Mean: {df['weighted_final_grade'].mean():.4f}")
print(f"  Std: {df['weighted_final_grade'].std():.4f}")
print(f"  Min: {df['weighted_final_grade'].min():.4f}")
print(f"  Max: {df['weighted_final_grade'].max():.4f}")

# Save the DataFrame to a CSV file
output_path = data_path('training_data.csv')
df.to_csv(output_path, index=False)
print(f"\nTraining data saved to: {output_path}")

# Also save assessment metadata for the model to use
assessment_metadata = {
    "assessment_weights": {
        f"{assessment_map[a_id]['type']}_{a_id[:5]}": assessment_map[a_id]['weightage']
        for a_id in all_assessment_ids
    },
    "assessment_info": {
        f"{assessment_map[a_id]['type']}_{a_id[:5]}": {
            "title": assessment_map[a_id]['title'],
            "type": assessment_map[a_id]['type'],
            "total_marks": assessment_map[a_id]['total'],
            "weightage": assessment_map[a_id]['weightage']
        }
        for a_id in all_assessment_ids
    }
}

metadata_path = data_path('assessment_metadata.json')
with open(metadata_path, 'w') as f:
    json.dump(assessment_metadata, f, indent=2)
print(f"Assessment metadata saved to: {metadata_path}")

print("\nData preprocessing complete! Ready for model training.")