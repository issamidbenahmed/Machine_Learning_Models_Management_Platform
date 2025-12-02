"""Extensions Flask initialisées ici pour éviter les imports circulaires"""

from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_cors import CORS

# Initialisation des extensions
db = SQLAlchemy()
ma = Marshmallow()
cors = CORS()


def init_extensions(app):
    """Initialise toutes les extensions avec l'application Flask"""
    db.init_app(app)
    ma.init_app(app)
    cors.init_app(
        app,
        resources={r"/*": {"origins": app.config['CORS_ORIGINS']}},
        supports_credentials=True
    )
