"""Dataset model"""
from datetime import datetime
from extensions import db


class Dataset(db.Model):
    """Modèle pour les datasets uploadés"""
    
    __tablename__ = 'datasets'
    
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    path = db.Column(db.String(500), nullable=False)
    columns = db.Column(db.JSON, nullable=False)
    row_count = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    # Relations
    ml_models = db.relationship('MLModel', backref='dataset', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Dataset {self.id}: {self.filename}>'
    
    def to_dict(self):
        """Convertit le dataset en dictionnaire"""
        return {
            'id': self.id,
            'filename': self.filename,
            'path': self.path,
            'columns': self.columns,
            'row_count': self.row_count,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
