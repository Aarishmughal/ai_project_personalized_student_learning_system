import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import torch.optim as optim
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import pickle
import json
from typing import Dict, List, Tuple, Optional
import logging
import os
import sys

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class StudentScorePredictor(nn.Module):
    def __init__(self, input_size: int, hidden_sizes: List[int] = [64, 32, 16]):
        super(StudentScorePredictor, self).__init__()
        layers = []
        prev_size = input_size
        for hidden_size in hidden_sizes:
            layers.extend([
                nn.Linear(prev_size, hidden_size),
                nn.ReLU(),
                nn.Dropout(0.2)
            ])
            prev_size = hidden_size
        layers.append(nn.Linear(prev_size, 1))
        self.network = nn.Sequential(*layers)
    def forward(self, x):
        return self.network(x)

class ReinforcementLearningTrainer:    
    def __init__(self, model: StudentScorePredictor, learning_rate: float = 0.001):
        self.model = model
        self.optimizer = optim.Adam(model.parameters(), lr=learning_rate)
        self.scaler = StandardScaler()
        self.feature_columns = []
        self.feedback_buffer = []
        self.training_history = []
    def prepare_data(self, data_path: str) -> Tuple[torch.Tensor, torch.Tensor]:
        try:
            df = pd.read_csv(data_path)
            self.feature_columns = [col for col in df.columns if col != 'student_id']
            X = df[self.feature_columns].values

            y = df[self.feature_columns[-1]].values
            
            X_scaled = self.scaler.fit_transform(X)
            
            return torch.FloatTensor(X_scaled), torch.FloatTensor(y).unsqueeze(1)
            
        except Exception as e:
            logger.error(f"Error preparing data: {e}")
            raise
    
    def initial_training(self, data_path: str, epochs: int = 100, validation_split: float = 0.2):
        logger.info("Starting initial training...")
        
        X, y = self.prepare_data(data_path)
        X_train, X_val, y_train, y_val = train_test_split(
            X, y, test_size=validation_split, random_state=42
        )
        
        criterion = nn.MSELoss()
        
        for epoch in range(epochs):
            # Training
            self.model.train()
            self.optimizer.zero_grad()
            
            predictions = self.model(X_train)
            loss = criterion(predictions, y_train)
            
            loss.backward()
            self.optimizer.step()
            
            # Validation
            if epoch % 10 == 0:
                self.model.eval()
                with torch.no_grad():
                    val_predictions = self.model(X_val)
                    val_loss = criterion(val_predictions, y_val)
                
                logger.info(f"Epoch {epoch}: Train Loss: {loss.item():.4f}, Val Loss: {val_loss.item():.4f}")
        
        logger.info("Initial training completed!")
    
    def predict_score(self, student_data: Dict) -> float:
        """Predict score for a student given their previous grades"""
        try:
            # Convert student data to feature vector
            features = []
            for col in self.feature_columns:
                if col in student_data:
                    features.append(student_data[col])
                else:
                    features.append(0.0)  # Default value for missing features
            
            # Scale features
            features_scaled = self.scaler.transform([features])
            features_tensor = torch.FloatTensor(features_scaled)
            
            # Make prediction
            self.model.eval()
            with torch.no_grad():
                prediction = self.model(features_tensor)
            
            return prediction.item()
            
        except Exception as e:
            logger.error(f"Error making prediction: {e}")
            return 0.0
    
    def add_feedback(self, student_data: Dict, predicted_score: float, 
                    actual_score: float, teacher_feedback: str):
        """Add teacher feedback for reinforcement learning"""
        
        # Convert feedback to reward signal
        reward = self._calculate_reward(predicted_score, actual_score, teacher_feedback)
        
        feedback_entry = {
            'student_data': student_data,
            'predicted_score': predicted_score,
            'actual_score': actual_score,
            'teacher_feedback': teacher_feedback,
            'reward': reward,
            'prediction_error': abs(predicted_score - actual_score)
        }
        
        self.feedback_buffer.append(feedback_entry)
        logger.info(f"Added feedback: Reward={reward:.3f}, Error={feedback_entry['prediction_error']:.3f}")
    
    def _calculate_reward(self, predicted: float, actual: float, feedback: str) -> float:
        """Calculate reward based on prediction accuracy and teacher feedback"""
        
        # Base reward from prediction accuracy
        error = abs(predicted - actual)
        accuracy_reward = max(0, 1 - error)  # Higher reward for lower error
        
        # Teacher feedback modifier
        feedback_modifier = 1.0
        if feedback.lower() in ['excellent', 'very good', 'great']:
            feedback_modifier = 1.2
        elif feedback.lower() in ['good', 'satisfactory']:
            feedback_modifier = 1.0
        elif feedback.lower() in ['poor', 'bad', 'incorrect']:
            feedback_modifier = 0.5
        elif feedback.lower() in ['very poor', 'terrible', 'completely wrong']:
            feedback_modifier = 0.2
        
        return accuracy_reward * feedback_modifier
    
    def reinforcement_update(self, batch_size: int = 32):
        """Update model based on accumulated feedback using policy gradient"""
        
        if len(self.feedback_buffer) < batch_size:
            logger.warning("Not enough feedback samples for update")
            return
        
        # Sample from feedback buffer
        sample_indices = np.random.choice(len(self.feedback_buffer), batch_size, replace=False)
        batch = [self.feedback_buffer[i] for i in sample_indices]
        
        self.model.train()
        total_loss = 0
        
        for feedback in batch:
            # Prepare input
            features = []
            for col in self.feature_columns:
                if col in feedback['student_data']:
                    features.append(feedback['student_data'][col])
                else:
                    features.append(0.0)
            
            features_scaled = self.scaler.transform([features])
            features_tensor = torch.FloatTensor(features_scaled)
            
            # Forward pass
            self.optimizer.zero_grad()
            prediction = self.model(features_tensor)
            
            # Calculate loss with reward weighting
            target = torch.FloatTensor([[feedback['actual_score']]])
            base_loss = nn.MSELoss()(prediction, target)
            
            # Weight loss by reward (higher reward = lower loss weight)
            weighted_loss = base_loss * (2.0 - feedback['reward'])
            
            weighted_loss.backward()
            self.optimizer.step()
            
            total_loss += weighted_loss.item()
        
        avg_loss = total_loss / batch_size
        self.training_history.append(avg_loss)
        
        logger.info(f"Reinforcement update completed. Average loss: {avg_loss:.4f}")
        
        # Clear processed feedback
        for i in sorted(sample_indices, reverse=True):
            del self.feedback_buffer[i]
    
    def save_model(self, filepath: str):
        """Save model and training components"""
        save_dict = {
            'model_state_dict': self.model.state_dict(),
            'scaler': self.scaler,
            'feature_columns': self.feature_columns,
            'training_history': self.training_history
        }
        
        with open(filepath, 'wb') as f:
            pickle.dump(save_dict, f)
        
        logger.info(f"Model saved to {filepath}")
    
    def load_model(self, filepath: str):
        """Load model and training components"""
        with open(filepath, 'rb') as f:
            save_dict = pickle.load(f)
        
        self.model.load_state_dict(save_dict['model_state_dict'])
        self.scaler = save_dict['scaler']
        self.feature_columns = save_dict['feature_columns']
        self.training_history = save_dict['training_history']
        
        logger.info(f"Model loaded from {filepath}")

# Web application integration class
class StudentScorePredictorAPI:
    """API wrapper for web application integration"""
    
    def __init__(self, model_path: Optional[str] = None):
        # Initialize with appropriate input size (will be set during training)
        self.trainer = None
        
        if model_path:
            self.load_model(model_path)
    
    def train_initial_model(self, data_path: str, model_save_path: str = "data/student_predictor.pkl"):
        """Train initial model and save it"""
        # Determine input size from data
        df = pd.read_csv(data_path)
        input_size = len([col for col in df.columns if col != 'student_id'])
        
        # Initialize model and trainer
        model = StudentScorePredictor(input_size)
        self.trainer = ReinforcementLearningTrainer(model)
        
        # Train model
        self.trainer.initial_training(data_path)
        
        # Save model as .pkl
        if not model_save_path.endswith('.pkl'):
            model_save_path += '.pkl'
        self.trainer.save_model(model_save_path)
        
        return {"status": "success", "message": f"Model trained and saved successfully as {model_save_path}"}
    
    def predict_student_score(self, student_id: str, previous_grades: Dict) -> Dict:
        """Predict score for a student"""
        if not self.trainer:
            return {"error": "Model not loaded"}
        
        try:
            predicted_score = self.trainer.predict_score(previous_grades)
            
            return {
                "student_id": student_id,
                "predicted_score": round(predicted_score, 4),
                "status": "success"
            }
            
        except Exception as e:
            return {"error": str(e)}
    
    def submit_feedback(self, student_id: str, previous_grades: Dict, 
                       predicted_score: float, actual_score: float, 
                       teacher_feedback: str) -> Dict:
        """Submit teacher feedback for reinforcement learning"""
        if not self.trainer:
            return {"error": "Model not loaded"}
        
        try:
            self.trainer.add_feedback(
                previous_grades, predicted_score, actual_score, teacher_feedback
            )
            
            # Trigger reinforcement update if we have enough feedback
            if len(self.trainer.feedback_buffer) >= 10:  # Adjust threshold as needed
                self.trainer.reinforcement_update()
            
            return {"status": "success", "message": "Feedback submitted and model updated"}
            
        except Exception as e:
            return {"error": str(e)}
    
    def load_model(self, model_path: str):
        """Load pre-trained model"""
        try:
            # Load model info to get input size
            with open(model_path, 'rb') as f:
                save_dict = pickle.load(f)
            
            input_size = len(save_dict['feature_columns'])
            
            # Initialize model and trainer
            model = StudentScorePredictor(input_size)
            self.trainer = ReinforcementLearningTrainer(model)
            
            # Load saved state
            self.trainer.load_model(model_path)
            
            return {"status": "success", "message": "Model loaded successfully"}
            
        except Exception as e:
            return {"error": str(e)}
    
    def save_model(self, model_path: str = "models/student_predictor.pkl"):
        """Save current model"""
        if not self.trainer:
            return {"error": "No model to save"}
        
        try:
            if not model_path.endswith('.pkl'):
                model_path += '.pkl'
            self.trainer.save_model(model_path)
            return {"status": "success", "message": f"Model saved successfully as {model_path}"}
        except Exception as e:
            return {"error": str(e)}
def data_path(filename):
    return os.path.join(DATA_DIR, filename)

if __name__ == "__main__":
    import argparse, json
    parser = argparse.ArgumentParser()
    parser.add_argument("--action", required=True, choices=["predict", "train", "feedback"])
    parser.add_argument("--input", type=str, help="JSON input for prediction or feedback")
    args = parser.parse_args()

    DATA_DIR = os.path.dirname(os.path.abspath(__file__))
    api = StudentScorePredictorAPI(os.path.join(DATA_DIR, "student_predictor.pkl"))
    if args.action == "predict":
        data = json.loads(args.input)
        result = api.predict_student_score(data["student_id"], data["previous_grades"])
        print(json.dumps(result))
        sys.stdout.flush()
        sys.exit(0)
    elif args.action == "train":
        pass
    elif args.action == "feedback":
        data = json.loads(args.input)
        result = api.submit_feedback(
            data["student_id"],
            data["previous_grades"],
            data["predicted_score"],
            data["actual_score"],
            data["teacher_feedback"]
        )
        print(json.dumps(result))
        sys.stdout.flush()
        sys.exit(0)