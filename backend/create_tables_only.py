"""Script pour créer uniquement les tables (sans créer la DB)"""
import os
from dotenv import load_dotenv

load_dotenv()

from app import create_app
from extensions import db

print("Création des tables...")
app = create_app()
with app.app_context():
    try:
        db.create_all()
        print("✓ Tables créées avec succès")
    except Exception as e:
        print(f"✗ Erreur: {e}")
        print("\n💡 Solutions possibles:")
        print("1. Vérifiez que MySQL est démarré: net start MySQL80")
        print("2. Vérifiez le mot de passe dans .env")
        print("3. Essayez de vous connecter manuellement: mysql -u root -p")
