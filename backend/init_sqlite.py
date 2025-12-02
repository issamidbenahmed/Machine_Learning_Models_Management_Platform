"""Script simple pour initialiser SQLite"""
import os
import sys

# Forcer l'utilisation de SQLite
os.environ['DATABASE_URL'] = 'sqlite:///ml_platform.db'

print("=" * 50)
print("Initialisation avec SQLite")
print("=" * 50)
print()

try:
    from app import create_app
    from extensions import db
    
    print("✓ Modules importés")
    
    # Créer l'application
    app = create_app('development')
    
    print("✓ Application créée")
    
    # Créer les tables
    with app.app_context():
        db.create_all()
        print("✓ Tables créées dans ml_platform.db")
    
    print()
    print("=" * 50)
    print("✅ Initialisation réussie !")
    print("=" * 50)
    print()
    print("Base de données: ml_platform.db")
    print()
    print("Pour lancer le serveur:")
    print("  venv\\Scripts\\python.exe run.py")
    print()
    
except Exception as e:
    print(f"✗ Erreur: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
