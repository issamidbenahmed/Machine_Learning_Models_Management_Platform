"""Modèle pour les requêtes API"""
from extensions import db
from datetime import datetime


class APIRequest(db.Model):
    """Modèle représentant une requête faite à une API exportée"""
    __tablename__ = 'api_requests'
    
    id = db.Column(db.Integer, primary_key=True)
    api_id = db.Column(db.Integer, db.ForeignKey('exported_apis.id', ondelete='CASCADE'), nullable=False)
    request_data = db.Column(db.Text)  # JSON des inputs
    response_data = db.Column(db.Text)  # JSON de la prédiction
    response_time = db.Column(db.Float)  # en secondes
    status_code = db.Column(db.Integer)  # 200, 400, 500, etc.
    error_message = db.Column(db.Text)
    cpu_usage = db.Column(db.Float)  # pourcentage
    memory_usage = db.Column(db.Float)  # en MB
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    # Relationship
    api = db.relationship('ExportedAPI', backref='requests')
    
    def to_dict(self):
        """Convertit l'objet en dictionnaire"""
        return {
            'id': self.id,
            'api_id': self.api_id,
            'request_data': self.request_data,
            'response_data': self.response_data,
            'response_time': self.response_time,
            'status_code': self.status_code,
            'error_message': self.error_message,
            'cpu_usage': self.cpu_usage,
            'memory_usage': self.memory_usage,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }
    
    def __repr__(self):
        return f'<APIRequest {self.id} - API {self.api_id}>'
