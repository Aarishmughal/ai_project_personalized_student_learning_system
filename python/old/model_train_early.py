import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split, GridSearchCV, cross_val_score
from sklearn.metrics import mean_squared_error, r2_score
import joblib

# Load data
df = pd.read_csv("./sample_data/StudentsPerformance.csv")

# Feature Engineering: Add average score
df['average_score'] = df[['math score', 'reading score', 'writing score']].mean(axis=1)

# Target and features
y = df['math score']
X = df.drop(columns=['math score'])

# Preprocess categorical features
categorical_cols = ['gender', 'race/ethnicity', 'parental level of education', 'lunch', 'test preparation course']
preprocessor = ColumnTransformer([
    ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_cols)
], remainder='passthrough')  # numerical columns go through as-is

# Define pipeline
pipeline = Pipeline([
    ('pre', preprocessor),
    ('model', RandomForestRegressor(random_state=42))
])

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Hyperparameter tuning
param_grid = {
    'model__n_estimators': [100, 200],
    'model__max_depth': [None, 10, 20],
    'model__min_samples_split': [2, 5]
}

grid_search = GridSearchCV(pipeline, param_grid, cv=5, scoring='r2', n_jobs=-1)
grid_search.fit(X_train, y_train)

# Best pipeline
best_pipeline = grid_search.best_estimator_

# Evaluation on test set
y_pred = best_pipeline.predict(X_test)
print("Best Parameters:", grid_search.best_params_)
print("RMSE:", mean_squared_error(y_test, y_pred))
print("R2 Score:", r2_score(y_test, y_pred))

# Cross-validation R²
cv_scores = cross_val_score(best_pipeline, X, y, cv=5, scoring='r2')
print("Cross-Validated R2:", cv_scores.mean())

# Feature Importance Plot
model = best_pipeline.named_steps['model']
feature_names = best_pipeline.named_steps['pre'].get_feature_names_out()
importances = model.feature_importances_

# Plotting
plt.figure(figsize=(10, 6))
plt.barh(feature_names, importances)
plt.title("Feature Importances")
plt.xlabel("Importance")
plt.tight_layout()
plt.show()

# Export the Model
joblib.dump(pipeline, 'math_score_model.pkl')
