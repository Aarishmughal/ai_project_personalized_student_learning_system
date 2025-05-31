import torch
import torch.nn as nn
from typing import List

class StudentScorePredictor(nn.Module):
    """Neural network for predicting student scores with reinforcement learning capabilities"""
    
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
        
        # Output layer for score prediction
        layers.append(nn.Linear(prev_size, 1))
        
        self.network = nn.Sequential(*layers)
    
    def forward(self, x):
        return self.network(x)
    
    def get_model_info(self):
        """Get information about the model architecture"""
        total_params = sum(p.numel() for p in self.parameters())
        trainable_params = sum(p.numel() for p in self.parameters() if p.requires_grad)
        
        return {
            "total_parameters": total_params,
            "trainable_parameters": trainable_params,
            "architecture": str(self.network)
        }
