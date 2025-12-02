"""Script pour initialiser la base de données"""
import os
import sys
import mysql.connector
from dotenv import load_dotenv

# Ajouter le dossier parent au path pour les imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from extensions import db

load_dotenv()


def create_database():
    """Crée la base de données MySQL si elle n'existe pas"""
    db_url = os.getenv('DATABASE_URL', 'mysql+mysqlconnector://root:password@localhost:3306/ml_platform')
    
    # Parser l'URL
    parts = db_url.split('/')
    db_name = parts[-1]
    host_parts = parts[2].split('@')[-1].split(':')
    host = host_parts[0]
    port = int(host_parts[1]) if len(host_parts) > 1 else 3306
    
    user_pass = parts[2].split('@')[0].split(':')
    user = user_pass[0]
    password = user_pass[1] if len(user_pass) > 1 else ''
    
    try:
        # Connexion sans spécifier la base
        conn = mysql.connector.connect(
            host=host,
            port=port,
            user=user,
            password=password
        )
        cursor = conn.cursor()
        
        # Créer la base de données
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        print(f"✓ Base de données '{db_name}' créée ou déjà existante")
        
        cursor.close()
        conn.close()
        
    except mysql.connector.Error as e:
        print(f"✗ Erreur lors de la création de la base: {e}")
        return False
    
    return True


def init_tables():
    """Initialise les tables"""
    app = create_app()
    with app.app_context():
        db.create_all()
        print("✓ Tables créées avec succès")


if __name__ == '__main__':
    print("Initialisation de la base de données...")
    if create_database():
        init_tables()
        print("\n✓ Initialisation terminée avec succès!")
    else:
        print("\n✗ Échec de l'initialisation")
