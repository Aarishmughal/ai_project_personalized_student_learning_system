import pandas as pd
import numpy as np
import torch
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from typing import Dict, List, Tuple
import logging

logger = logging.getLogger(__name__)

class DataHandler:
    """Handles data loading, preprocessing, and feature management"""
    
    def __init__(self):
        self.scaler = StandardScaler()
        self.feature_columns = []
        self.is_fitted = False
    
    def load_and_prepare_data(self, data_path: str) -> Tuple[torch.Tensor, torch.Tensor]:
        """Load and prepare training data from CSV"""
        try:
            # Read CSV data
            df = pd.read_csv(data_path)
            logger.info(f"Loaded data with shape: {df.shape}")
            
            # Store feature columns (excluding student_id and target columns)
            excluded_cols = ['student_id', 'weighted_final_grade']
            self.feature_columns = [col for col in df.columns if col not in excluded_cols]
            
            # Prepare features (previous grades)
            X = df[self.feature_columns].values
            
            # Use weighted_final_grade as target if available, otherwise use last column
            if 'weighted_final_grade' in df.columns:
                y = df['weighted_final_grade'].values
                logger.info("Using weighted_final_grade as target")
            else:
                y = df[self.feature_columns[-1]].values
                logger.info(f"Using {self.feature_columns[-1]} as target")
            
            # Scale features
            X_scaled = self.scaler.fit_transform(X)
            self.is_fitted = True
            
            logger.info(f"Features: {len(self.feature_columns)}")
            logger.info(f"Feature columns: {self.feature_columns}")
            
            return torch.FloatTensor(X_scaled), torch.FloatTensor(y).unsqueeze(1)
            
        except Exception as e:
            logger.error(f"Error preparing data: {e}")
            raise
    
    def prepare_student_data(self, student_data: Dict) -> torch.Tensor:
        """Convert student data dictionary to scaled feature tensor"""
        if not self.is_fitted:
            raise ValueError("DataHandler must be fitted on training data first")
        
        try:
            # Convert student data to feature vector
            features = []
            for col in self.feature_columns:
                if col in student_data:
                    features.append(student_data[col])
                else:
                    features.append(0.0)  # Default value for missing features
                    logger.warning(f"Missing feature {col}, using default value 0.0")
            
            # Scale features using fitted scaler
            features_scaled = self.scaler.transform([features])
            return torch.FloatTensor(features_scaled)
            
        except Exception as e:
            logger.error(f"Error preparing student data: {e}")
            raise
    
    def split_data(self, X: torch.Tensor, y: torch.Tensor, 
                   validation_split: float = 0.2, random_state: int = 42) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor, torch.Tensor]:
        """Split data into training and validation sets"""
        return train_test_split(X, y, test_size=validation_split, random_state=random_state)
    
    def get_feature_info(self) -> Dict:
        """Get information about features"""
        return {
            "feature_columns": self.feature_columns,
            "num_features": len(self.feature_columns),
            "scaler_fitted": self.is_fitted,
            "scaler_mean": self.scaler.mean_.tolist() if self.is_fitted else None,
            "scaler_scale": self.scaler.scale_.tolist() if self.is_fitted else None
        }
    
    def validate_student_data(self, student_data: Dict) -> Dict:
        """Validate student data and return validation results"""
        validation_results = {
            "valid": True,
            "missing_features": [],
            "extra_features": [],
            "warnings": []
        }
        
        # Check for missing features
        for col in self.feature_columns:
            if col not in student_data:
                validation_results["missing_features"].append(col)
                validation_results["warnings"].append(f"Missing feature: {col}")
        
        # Check for extra features
        for col in student_data:
            if col not in self.feature_columns:
                validation_results["extra_features"].append(col)
                validation_results["warnings"].append(f"Unknown feature: {col}")
        
        if validation_results["missing_features"]:
            validation_results["valid"] = False
        
        return validation_results
