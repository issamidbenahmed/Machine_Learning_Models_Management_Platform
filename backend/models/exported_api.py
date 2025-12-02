"""Exported API Model"""
from datetime import datetime
from extensions import db


class ExportedAPI(db.Model):
    """Modèle pour les APIs exportées"""
    
    __tablename__ = 'exported_apis'
    
    id = db.Column(db.Integer, primary_key=True)
    model_id = db.Column(db.Integer, db.ForeignKey('ml_models.id'), nullable=False)
    api_key = db.Column(db.String(64), unique=True, nullable=False)
    api_endpoint = db.Column(db.String(255), unique=True, nullable=False)
    status = db.Column(db.String(20), default='active', nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    last_used_at = db.Column(db.DateTime)
    total_requests = db.Column(db.Integer, default=0, nullable=False)
    
    # Relationships
    model = db.relationship('MLModel', backref='exported_api')
    
    def __repr__(self):
        return f'<ExportedAPI {self.id}: {self.api_endpoint}>'
    
    def to_dict(self):
        """Convertit le modèle en dictionnaire"""
        return {
            'id': self.id,
            'model_id': self.model_id,
            'model_name': self.model.name if self.model else None,
            'api_key': self.api_key,
            'api_endpoint': self.api_endpoint,
            'api_url': f"/api/predict/{self.id}",
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_used_at': self.last_used_at.isoformat() if self.last_used_at else None,
            'total_requests': self.total_requests
        }
