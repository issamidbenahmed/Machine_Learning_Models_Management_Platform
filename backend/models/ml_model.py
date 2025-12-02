"""ML Model"""
from datetime import datetime
from extensions import db


class MLModel(db.Model):
    """Modèle pour les modèles ML créés"""
    
    __tablename__ = 'ml_models'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    dataset_id = db.Column(db.Integer, db.ForeignKey('datasets.id'), nullable=False)
    inputs = db.Column(db.JSON)
    outputs = db.Column(db.JSON)
    algorithm = db.Column(db.String(100))
    score = db.Column(db.Float)
    model_path = db.Column(db.String(500))
    status = db.Column(db.String(50), default='created', nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    trained_at = db.Column(db.DateTime)
    
    def __repr__(self):
        return f'<MLModel {self.id}: {self.name}>'
    
    def to_dict(self):
        """Convertit le modèle en dictionnaire"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'dataset_id': self.dataset_id,
            'inputs': self.inputs,
            'outputs': self.outputs,
            'algorithm': self.algorithm,
            'score': self.score,
            'model_path': self.model_path,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'trained_at': self.trained_at.isoformat() if self.trained_at else None
        }
