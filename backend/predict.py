import os
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestRegressor
import joblib

# For RL, we will use a simple Q-learning-like update for demonstration
# In production, consider using a proper RL library (e.g., stable-baselines3)

DATA_PATH = os.path.join(os.path.dirname(__file__), 'data', 'training_data.csv')
MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'models', 'student_marks_predictor.pkl')

class StudentScorePredictor:
    def __init__(self):
        self.model = None
        self.label_encoder = None
        self.feature_cols = None
        self.target_col = None

    def load_data(self):
        df = pd.read_csv(DATA_PATH)
        return df

    def preprocess(self, df, target_col):
        # Encode student_id
        le = LabelEncoder()
        df['student_id_enc'] = le.fit_transform(df['student_id'])
        feature_cols = [col for col in df.columns if col not in ['student_id', target_col]]
        X = df[feature_cols]
        y = df[target_col]
        self.label_encoder = le
        self.feature_cols = feature_cols
        self.target_col = target_col
        return X, y

    def train(self, target_col):
        df = self.load_data()
        X, y = self.preprocess(df, target_col)
        model = RandomForestRegressor()
        model.fit(X, y)
        self.model = model
        # Save model and encoder
        joblib.dump({'model': model, 'label_encoder': self.label_encoder, 'feature_cols': self.feature_cols, 'target_col': self.target_col}, MODEL_PATH)
        print(f"Model trained and saved to {MODEL_PATH}")

    def predict(self, student_id, features):
        # features: dict of previous grades, keys must match feature_cols
        if self.model is None:
            data = joblib.load(MODEL_PATH)
            self.model = data['model']
            self.label_encoder = data['label_encoder']
            self.feature_cols = data['feature_cols']
        features = features.copy()
        features['student_id_enc'] = self.label_encoder.transform([student_id])[0]
        X_pred = np.array([features[col] for col in self.feature_cols]).reshape(1, -1)
        return self.model.predict(X_pred)[0]

    def reinforce(self, student_id, features, true_score, alpha=0.1):
        # Simple RL: after getting feedback, update the model with the new data point
        # features: dict of previous grades, keys must match feature_cols
        # true_score: actual score given by teacher
        df = self.load_data()
        features = features.copy()
        features['student_id_enc'] = self.label_encoder.transform([student_id])[0]
        new_row = {col: features[col] for col in self.feature_cols}
        new_row[self.target_col] = true_score
        df = df.append(new_row, ignore_index=True)
        # Retrain model with new data
        X, y = self.preprocess(df, self.target_col)
        self.model.fit(X, y)
        joblib.dump({'model': self.model, 'label_encoder': self.label_encoder, 'feature_cols': self.feature_cols, 'target_col': self.target_col}, MODEL_PATH)
        print("Model updated with new feedback.")

if __name__ == "__main__":
    # Example usage
    predictor = StudentScorePredictor()
    # Choose which assessment to predict (e.g., last column)
    df = predictor.load_data()
    target_col = df.columns[-1]  # Predict the last assessment
    predictor.train(target_col)
    # Example prediction
    student_id = df['student_id'].iloc[0]
    features = df.iloc[0].to_dict()
    features.pop('student_id')
    features.pop(target_col)
    pred = predictor.predict(student_id, features)
    print(f"Predicted score for student {student_id}: {pred}")
    # Example reinforcement (feedback from teacher)
    # predictor.reinforce(student_id, features, true_score=0.5)
