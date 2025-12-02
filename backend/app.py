"""Application Flask principale"""
import os
import logging
from flask import Flask, jsonify
from config import config
from extensions import init_extensions, db
from routes.datasets import datasets_bp
from routes.ml_models import ml_models_bp
from routes.api_export import api_export_bp
from routes.prediction import prediction_bp
from routes.monitoring import monitoring_bp


def create_app(config_name='default'):
    """Factory pour créer l'application Flask"""
    app = Flask(__name__)
    
    # Configuration
    app.config.from_object(config[config_name])
    
    # Créer les dossiers nécessaires
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(app.config['MODEL_FOLDER'], exist_ok=True)
    
    # Initialiser les extensions
    init_extensions(app)
    
    # Configurer le logging
    logging.basicConfig(
        level=getattr(logging, app.config['LOG_LEVEL']),
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(app.config['LOG_FILE']),
            logging.StreamHandler()
        ]
    )
    
    # Enregistrer les blueprints
    app.register_blueprint(datasets_bp)
    app.register_blueprint(ml_models_bp)
    app.register_blueprint(api_export_bp)
    app.register_blueprint(prediction_bp)
    app.register_blueprint(monitoring_bp)
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': {'code': 'NOT_FOUND', 'message': 'Ressource introuvable'}}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        app.logger.error(f"Erreur interne: {str(error)}")
        return jsonify({'error': {'code': 'INTERNAL_ERROR', 'message': 'Une erreur est survenue'}}), 500
    
    # Route de santé
    @app.route('/health', methods=['GET'])
    def health():
        return jsonify({'status': 'ok'}), 200
    
    # Créer les tables
    with app.app_context():
        db.create_all()
    
    return app


if __name__ == '__main__':
    app = create_app(os.getenv('FLASK_ENV', 'development'))
    app.run(host='0.0.0.0', port=5000, debug=app.config['DEBUG'])
