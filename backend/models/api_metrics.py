from datetime import datetime
from extensions import db

class APIMetrics(db.Model):
    """Model for storing aggregated API metrics by hour"""
    __tablename__ = 'api_metrics'
    
    id = db.Column(db.Integer, primary_key=True)
    api_id = db.Column(db.Integer, db.ForeignKey('exported_apis.id'), nullable=False)
    hour_timestamp = db.Column(db.DateTime, nullable=False)
    request_count = db.Column(db.Integer, default=0)
    avg_response_time = db.Column(db.Float, default=0.0)
    success_count = db.Column(db.Integer, default=0)
    error_count = db.Column(db.Integer, default=0)
    avg_cpu_usage = db.Column(db.Float, default=0.0)
    avg_memory_usage = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    api = db.relationship('ExportedAPI', backref=db.backref('metrics', lazy='dynamic'))
    
    def to_dict(self):
        return {
            'id': self.id,
            'api_id': self.api_id,
            'hour_timestamp': self.hour_timestamp.isoformat() if self.hour_timestamp else None,
            'request_count': self.request_count,
            'avg_response_time': self.avg_response_time,
            'success_count': self.success_count,
            'error_count': self.error_count,
            'avg_cpu_usage': self.avg_cpu_usage,
            'avg_memory_usage': self.avg_memory_usage,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
