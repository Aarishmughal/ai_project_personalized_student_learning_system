import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
from typing import Dict, List
import logging

from model import StudentScorePredictor
from data_handler import DataHandler
from feedback_manager import FeedbackManager

logger = logging.getLogger(__name__)

class ReinforcementLearningTrainer:
    """Handles training and reinforcement learning updates"""
    
    def __init__(self, model: StudentScorePredictor, learning_rate: float = 0.001):
        self.model = model
        self.optimizer = optim.Adam(model.parameters(), lr=learning_rate)
        self.data_handler = DataHandler()
        self.feedback_manager = FeedbackManager()
        self.training_history = []
        self.validation_history = []
        
    def initial_training(self, data_path: str, epochs: int = 100, 
                        validation_split: float = 0.2, patience: int = 10):
        """Initial training on historical data with early stopping"""
        logger.info("Starting initial training...")
        
        # Prepare data
        X, y = self.data_handler.load_and_prepare_data(data_path)
        X_train, X_val, y_train, y_val = self.data_handler.split_data(X, y, validation_split)
        
        criterion = nn.MSELoss()
        best_val_loss = float('inf')
        patience_counter = 0
        
        for epoch in range(epochs):
            # Training phase
            self.model.train()
            self.optimizer.zero_grad()
            
            predictions = self.model(X_train)
            train_loss = criterion(predictions, y_train)
            
            train_loss.backward()
            self.optimizer.step()
            
            # Validation phase
            self.model.eval()
            with torch.no_grad():
                val_predictions = self.model(X_val)
                val_loss = criterion(val_predictions, y_val)
            
            # Record history
            self.training_history.append(train_loss.item())
            self.validation_history.append(val_loss.item())
            
            # Early stopping check
            if val_loss.item() < best_val_loss:
                best_val_loss = val_loss.item()
                patience_counter = 0
                # Save best model state
                self.best_model_state = self.model.state_dict().copy()
            else:
                patience_counter += 1
            
            # Logging
            if epoch % 10 == 0:
                logger.info(f"Epoch {epoch}: Train Loss: {train_loss.item():.4f}, "
                           f"Val Loss: {val_loss.item():.4f}")
            
            # Early stopping
            if patience_counter >= patience:
                logger.info(f"Early stopping at epoch {epoch}")
                # Restore best model
                self.model.load_state_dict(self.best_model_state)
                break
        
        logger.info(f"Initial training completed! Best validation loss: {best_val_loss:.4f}")
        
        return {
            "final_train_loss": self.training_history[-1],
            "final_val_loss": self.validation_history[-1],
            "best_val_loss": best_val_loss,
            "epochs_trained": len(self.training_history)
        }
    
    def predict_score(self, student_data: Dict) -> float:
        """Predict score for a student given their previous grades"""
        try:
            # Prepare student data
            features_tensor = self.data_handler.prepare_student_data(student_data)
            
            # Make prediction
            self.model.eval()
            with torch.no_grad():
                prediction = self.model(features_tensor)
            
            return prediction.item()
            
        except Exception as e:
            logger.error(f"Error making prediction: {e}")
            return 0.0
    
    def add_feedback(self, student_data: Dict, predicted_score: float, 
                    actual_score: float, teacher_feedback: str) -> Dict:
        """Add teacher feedback for reinforcement learning"""
        return self.feedback_manager.add_feedback(
            student_data, predicted_score, actual_score, teacher_feedback
        )
    
    def reinforcement_update(self, batch_size: int = 32, update_threshold: int = 10) -> Dict:
        """Update model based on accumulated feedback using policy gradient"""
        
        if len(self.feedback_manager.feedback_buffer) < update_threshold:
            return {
                "status": "insufficient_feedback",
                "message": f"Need at least {update_threshold} feedback samples, have {len(self.feedback_manager.feedback_buffer)}"
            }
        
        # Get feedback batch
        batch = self.feedback_manager.get_feedback_batch(batch_size)
        
        self.model.train()
        total_loss = 0
        processed_indices = []
        
        for i, feedback in enumerate(batch):
            try:
                # Prepare input
                features_tensor = self.data_handler.prepare_student_data(feedback['student_data'])
                
                # Forward pass
                self.optimizer.zero_grad()
                prediction = self.model(features_tensor)
                
                # Calculate loss with reward weighting
                target = torch.FloatTensor([[feedback['actual_score']]])
                base_loss = nn.MSELoss()(prediction, target)
                
                # Weight loss by reward (higher reward = lower loss weight for punishment)
                # Reward ranges from 0-2, so we invert it for loss weighting
                loss_weight = max(0.1, 2.0 - feedback['reward'])
                weighted_loss = base_loss * loss_weight
                
                weighted_loss.backward()
                self.optimizer.step()
                
                total_loss += weighted_loss.item()
                processed_indices.append(i)
                
            except Exception as e:
                logger.error(f"Error processing feedback {i}: {e}")
                continue
        
        if processed_indices:
            avg_loss = total_loss / len(processed_indices)
            self.training_history.append(avg_loss)
            
            # Remove processed feedback
            self.feedback_manager.remove_processed_feedback(processed_indices)
            
            logger.info(f"Reinforcement update completed. Average loss: {avg_loss:.4f}")
            
            return {
                "status": "success",
                "average_loss": avg_loss,
                "samples_processed": len(processed_indices),
                "remaining_feedback": len(self.feedback_manager.feedback_buffer)
            }
        else:
            return {
                "status": "error",
                "message": "No feedback samples could be processed"
            }
    
    def evaluate_model(self, test_data_path: str = None) -> Dict:
        """Evaluate model performance"""
        if test_data_path:
            # Evaluate on separate test data
            X_test, y_test = self.data_handler.load_and_prepare_data(test_data_path)
        else:
            # Use validation data from last training
            if not hasattr(self, 'validation_history'):
                return {"error": "No validation data available"}
            
            # Return training statistics
            return {
                "training_epochs": len(self.training_history),
                "final_training_loss": self.training_history[-1] if self.training_history else None,
                "final_validation_loss": self.validation_history[-1] if self.validation_history else None,
                "feedback_stats": self.feedback_manager.get_feedback_statistics()
            }
        
        # Evaluate on test data
        self.model.eval()
        with torch.no_grad():
            predictions = self.model(X_test)
            mse_loss = nn.MSELoss()(predictions, y_test)
            mae_loss = nn.L1Loss()(predictions, y_test)
        
        return {
            "test_mse": mse_loss.item(),
            "test_mae": mae_loss.item(),
            "test_rmse": np.sqrt(mse_loss.item())
        }
    
    def get_training_progress(self) -> Dict:
        """Get training progress information"""
        return {
            "training_history": self.training_history,
            "validation_history": self.validation_history,
            "feedback_stats": self.feedback_manager.get_feedback_statistics(),
            "model_info": self.model.get_model_info(),
            "data_info": self.data_handler.get_feature_info()
        }