import numpy as np
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)

class FeedbackManager:
    """Manages teacher feedback and reward calculation for reinforcement learning"""
    
    def __init__(self, buffer_size: int = 1000):
        self.feedback_buffer = []
        self.buffer_size = buffer_size
        self.feedback_history = []
        
    def add_feedback(self, student_data: Dict, predicted_score: float, 
                    actual_score: float, teacher_feedback: str) -> Dict:
        """Add teacher feedback for reinforcement learning"""
        
        # Convert feedback to reward signal
        reward = self._calculate_reward(predicted_score, actual_score, teacher_feedback)
        
        feedback_entry = {
            'student_data': student_data,
            'predicted_score': predicted_score,
            'actual_score': actual_score,
            'teacher_feedback': teacher_feedback,
            'reward': reward,
            'prediction_error': abs(predicted_score - actual_score),
            'timestamp': np.datetime64('now')
        }
        
        # Add to buffer
        self.feedback_buffer.append(feedback_entry)
        self.feedback_history.append(feedback_entry)
        
        # Maintain buffer size
        if len(self.feedback_buffer) > self.buffer_size:
            self.feedback_buffer.pop(0)
        
        logger.info(f"Added feedback: Reward={reward:.3f}, Error={feedback_entry['prediction_error']:.3f}")
        
        return {
            "reward": reward,
            "prediction_error": feedback_entry['prediction_error'],
            "buffer_size": len(self.feedback_buffer)
        }
    
    def _calculate_reward(self, predicted: float, actual: float, feedback: str) -> float:
        """Calculate reward based on prediction accuracy and teacher feedback"""
        
        # Base reward from prediction accuracy
        error = abs(predicted - actual)
        accuracy_reward = max(0, 1 - error)  # Higher reward for lower error
        
        # Teacher feedback modifier
        feedback_modifier = self._parse_feedback_sentiment(feedback)
        
        final_reward = accuracy_reward * feedback_modifier
        
        # Ensure reward is between 0 and 2 (with bonus for excellent feedback)
        return max(0, min(2, final_reward))
    
    def _parse_feedback_sentiment(self, feedback: str) -> float:
        """Parse teacher feedback and return sentiment modifier"""
        feedback_lower = feedback.lower()
        
        # Positive feedback
        if any(word in feedback_lower for word in ['excellent', 'outstanding', 'perfect', 'amazing']):
            return 1.5
        elif any(word in feedback_lower for word in ['very good', 'great', 'impressive']):
            return 1.3
        elif any(word in feedback_lower for word in ['good', 'nice', 'well done', 'correct']):
            return 1.1
        elif any(word in feedback_lower for word in ['satisfactory', 'okay', 'acceptable']):
            return 1.0
        
        # Negative feedback
        elif any(word in feedback_lower for word in ['poor', 'bad', 'incorrect', 'wrong']):
            return 0.7
        elif any(word in feedback_lower for word in ['very poor', 'terrible', 'awful']):
            return 0.4
        elif any(word in feedback_lower for word in ['completely wrong', 'totally off', 'horrible']):
            return 0.2
        
        # Neutral/unknown feedback
        else:
            return 1.0
    
    def get_feedback_batch(self, batch_size: int) -> List[Dict]:
        """Get a batch of feedback for training"""
        if len(self.feedback_buffer) < batch_size:
            return self.feedback_buffer.copy()
        
        # Sample randomly from buffer
        indices = np.random.choice(len(self.feedback_buffer), batch_size, replace=False)
        return [self.feedback_buffer[i] for i in indices]
    
    def remove_processed_feedback(self, indices: List[int]):
        """Remove processed feedback from buffer"""
        for i in sorted(indices, reverse=True):
            if 0 <= i < len(self.feedback_buffer):
                del self.feedback_buffer[i]
    
    def get_feedback_statistics(self) -> Dict:
        """Get statistics about feedback received"""
        if not self.feedback_history:
            return {"message": "No feedback received yet"}
        
        rewards = [f['reward'] for f in self.feedback_history]
        errors = [f['prediction_error'] for f in self.feedback_history]
        
        return {
            "total_feedback_count": len(self.feedback_history),
            "buffer_size": len(self.feedback_buffer),
            "average_reward": np.mean(rewards),
            "average_error": np.mean(errors),
            "reward_std": np.std(rewards),
            "error_std": np.std(errors),
            "min_error": np.min(errors),
            "max_error": np.max(errors),
            "recent_average_reward": np.mean(rewards[-10:]) if len(rewards) >= 10 else np.mean(rewards)
        }
    
    def clear_buffer(self):
        """Clear the feedback buffer (but keep history)"""
        self.feedback_buffer.clear()
        logger.info("Feedback buffer cleared")
    
    def export_feedback_data(self) -> List[Dict]:
        """Export all feedback data for analysis"""
        return [
            {
                'predicted_score': f['predicted_score'],
                'actual_score': f['actual_score'],
                'teacher_feedback': f['teacher_feedback'],
                'reward': f['reward'],
                'prediction_error': f['prediction_error'],
                'timestamp': str(f['timestamp'])
            }
            for f in self.feedback_history
        ]