"""Script pour créer les tables des APIs exportées"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from extensions import db
from models.exported_api import ExportedAPI
from models.api_request import APIRequest

def create_api_tables():
    """Crée les tables pour les APIs exportées"""
    app = create_app()
    
    with app.app_context():
        # Créer les tables
        db.create_all()
        print("✓ Tables créées avec succès!")
        print("  - exported_apis")
        print("  - api_requests")

if __name__ == '__main__':
    create_api_tables()
