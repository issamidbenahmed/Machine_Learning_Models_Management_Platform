"""Script pour lancer le serveur Flask"""
import os
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

# Forcer SQLite
os.environ['DATABASE_URL'] = 'sqlite:///ml_platform.db'

from app import create_app

# Créer l'application
app = create_app(os.getenv('FLASK_ENV', 'development'))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=app.config['DEBUG'])
