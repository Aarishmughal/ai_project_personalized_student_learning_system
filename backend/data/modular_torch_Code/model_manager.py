import pickle
import json
import torch
from typing import Dict, Optional
import logging
from pathlib import Path

from model import StudentScorePredictor
from trainer import ReinforcementLearningTrainer

logger = logging.getLogger(__name__)

class ModelManager:
    """Handles model saving, loading, and version management"""
    
    def __init__(self, model_dir: str = "models"):
        self.model_dir = Path(model_dir)
        self.model_dir.mkdir(exist_ok=True)
        
    def save_model(self, trainer: ReinforcementLearningTrainer, 
                   model_name: str = "student_predictor", 
                   version: Optional[str] = None) -> Dict:
        """Save model and all associated data"""
        try:
            if version is None:
                version = self._generate_version()
            
            model_path = self.model_dir / f"{model_name}_v{version}"
            model_path.mkdir(exist_ok=True)
            
            # Save model state
            model_file = model_path / "model.pth"
            torch.save({
                'model_state_dict': trainer.model.state_dict(),
                'model_architecture': {
                    'input_size': trainer.model.network[0].in_features,
                    'hidden_sizes': self._extract_hidden_sizes(trainer.model)
                }
            }, model_file)
            
            # Save training components
            components_file = model_path / "components.pkl"
            save_dict = {
                'data_handler': trainer.data_handler,
                'feedback_manager': trainer.feedback_manager,
                'training_history': trainer.training_history,
                'validation_history': trainer.validation_history
            }
            
            with open(components_file, 'wb') as f:
                pickle.dump(save_dict, f)
            
            # Save metadata
            metadata = {
                'version': version,
                'model_name': model_name,
                'feature_columns': trainer.data_handler.feature_columns,
                'model_info': trainer.model.get_model_info(),
                'training_epochs': len(trainer.training_history),
                'feedback_count': len(trainer.feedback_manager.feedback_history)
            }
            
            metadata_file = model_path / "metadata.json"
            with open(metadata_file, 'w') as f:
                json.dump(metadata, f, indent=2)
            
            logger.info(f"Model saved successfully to {model_path}")
            
            return {
                "status": "success",
                "model_path": str(model_path),
                "version": version,
                "files_saved": ["model.pth", "components.pkl", "metadata.json"]
            }
            
        except Exception as e:
            logger.error(f"Error saving model: {e}")
            return {"status": "error", "message": str(e)}
    
    def load_model(self, model_name: str = "student_predictor", 
                   version: Optional[str] = None) -> ReinforcementLearningTrainer:
        """Load model and return configured trainer"""
        try:
            if version is None:
                version = self._get_latest_version(model_name)
            
            model_path = self.model_dir / f"{model_name}_v{version}"
            
            if not model_path.exists():
                raise FileNotFoundError(f"Model {model_name} version {version} not found")
            
            # Load metadata
            metadata_file = model_path / "metadata.json"
            with open(metadata_file, 'r') as f:
                metadata = json.load(f)
            
            # Load model
            model_file = model_path / "model.pth"
            checkpoint = torch.load(model_file, map_location='cpu')
            
            # Recreate model with correct architecture
            arch = checkpoint['model_architecture']
            model = StudentScorePredictor(
                input_size=arch['input_size'],
                hidden_sizes=arch['hidden_sizes']
            )
            model.load_state_dict(checkpoint['model_state_dict'])
            
            # Create trainer
            trainer = ReinforcementLearningTrainer(model)
            
            # Load training components
            components_file = model_path / "components.pkl"
            with open(components_file, 'rb') as f:
                components = pickle.load(f)
            
            trainer.data_handler = components['data_handler']
            trainer.feedback_manager = components['feedback_manager']
            trainer.training_history = components['training_history']
            trainer.validation_history = components['validation_history']
            
            logger.info(f"Model {model_name} version {version} loaded successfully")
            
            return trainer
            
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            raise
    
    def list_models(self) -> Dict:
        """List all available models and versions"""
        models = {}
        for model_path in self.model_dir.iterdir():
            if model_path.is_dir():
                try:
                    # Parse model name and version
                    name_version = model_path.name
                    if '_v' in name_version:
                        model_name, version = name_version.rsplit('_v', 1)
                    else:
                        continue
                    # Load metadata
                    metadata_file = model_path / "metadata.json"
                    if metadata_file.exists():
                        with open(metadata_file, 'r') as f:
                            metadata = json.load(f)
                        if model_name not in models:
                            models[model_name] = []
                        models[model_name].append({
                            'version': version,
                            'path': str(model_path),
                            'training_epochs': metadata.get('training_epochs', 0),
                            'feedback_count': metadata.get('feedback_count', 0),
                            'feature_columns': metadata.get('feature_columns', [])
                        })
                except Exception as e:
                    logger.warning(f"Error reading model {model_path}: {e}")
                    continue
        # Sort versions for each model
        for model_name in models:
            models[model_name].sort(key=lambda x: x['version'], reverse=True)
        return models
    
    def delete_model(self, model_name: str, version: str) -> Dict:
        """Delete a specific model version"""
        try:
            model_path = self.model_dir / f"{model_name}_v{version}"
            
            if not model_path.exists():
                return {"status": "error", "message": "Model not found"}
            
            # Remove all files in the model directory
            for file_path in model_path.iterdir():
                file_path.unlink()
            
            # Remove the directory
            model_path.rmdir()
            
            logger.info(f"Model {model_name} version {version} deleted")
            
            return {"status": "success", "message": f"Model {model_name}_v{version} deleted"}
            
        except Exception as e:
            logger.error(f"Error deleting model: {e}")
            return {"status": "error", "message": str(e)}
    
    def _generate_version(self) -> str:
        """Generate a new version number based on timestamp"""
        from datetime import datetime
        return datetime.now().strftime("%Y%m%d_%H%M%S")
    
    def _get_latest_version(self, model_name: str) -> str:
        """Get the latest version of a model"""
        models = self.list_models()
        if model_name not in models or not models[model_name]:
            raise ValueError(f"No versions found for model {model_name}")
        
        return models[model_name][0]['version']  # Already sorted in descending order
    
    def _extract_hidden_sizes(self, model: StudentScorePredictor) -> list:
        """Extract hidden layer sizes from model architecture"""
        hidden_sizes = []
        
        for layer in model.network:
            if isinstance(layer, torch.nn.Linear):
                hidden_sizes.append(layer.out_features)
        
        # Remove the last layer (output layer)
        return hidden_sizes[:-1]
    
    def export_model_info(self, model_name: str, version: str) -> Dict:
        """Export detailed model information"""
        try:
            trainer = self.load_model(model_name, version)
            model_info = trainer.model.get_model_info()
            
            return {
                "status": "success",
                "model_name": model_name,
                "version": version,
                "model_info": model_info,
                "feature_columns": trainer.data_handler.feature_columns
            }
        except Exception as e:
            logger.error(f"Error exporting model info: {e}")
            return {"status": "error", "message": str(e)}

