"""Routes pour les modèles ML"""
import os
import sys
from flask import Blueprint, request, jsonify, current_app
from marshmallow import ValidationError
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.ml_service import MLService
from schemas.ml_model_schema import (
    MLModelSchema, CreateModelSchema, SelectFeaturesSchema, TrainModelSchema
)

ml_models_bp = Blueprint('ml_models', __name__, url_prefix='/models')


@ml_models_bp.route('/create', methods=['POST'])
def create_model():
    """Crée un nouveau modèle ML"""
    try:
        schema = CreateModelSchema()
        data = schema.load(request.json)
        
        ml_model = MLService.create_model(
            data['name'],
            data.get('description'),
            data['dataset_id']
        )
        
        result_schema = MLModelSchema()
        return jsonify(result_schema.dump(ml_model)), 201
        
    except ValidationError as e:
        return jsonify({'error': {'code': 'VALIDATION_ERROR', 'message': 'Données invalides', 'details': e.messages}}), 400
    except ValueError as e:
        return jsonify({'error': {'code': 'NOT_FOUND', 'message': str(e)}}), 404
    except Exception as e:
        current_app.logger.error(f"Erreur create model: {str(e)}")
        return jsonify({'error': {'code': 'INTERNAL_ERROR', 'message': 'Erreur lors de la création'}}), 500


@ml_models_bp.route('/<int:model_id>/select-io', methods=['POST'])
def select_features(model_id):
    """Configure les features input/output"""
    try:
        schema = SelectFeaturesSchema()
        data = schema.load(request.json)
        
        ml_model = MLService.configure_features(
            model_id,
            data['inputs'],
            data['outputs']
        )
        
        result_schema = MLModelSchema()
        return jsonify(result_schema.dump(ml_model)), 200
        
    except ValidationError as e:
        return jsonify({'error': {'code': 'VALIDATION_ERROR', 'message': 'Données invalides', 'details': e.messages}}), 400
    except ValueError as e:
        return jsonify({'error': {'code': 'NOT_FOUND', 'message': str(e)}}), 404
    except Exception as e:
        current_app.logger.error(f"Erreur select features: {str(e)}")
        return jsonify({'error': {'code': 'INTERNAL_ERROR', 'message': 'Erreur lors de la configuration'}}), 500


@ml_models_bp.route('/<int:model_id>/test-algorithms', methods=['POST'])
def test_algorithms(model_id):
    """Teste tous les algorithmes disponibles"""
    try:
        results = MLService.test_algorithms(model_id)
        return jsonify(results), 200
        
    except ValueError as e:
        return jsonify({'error': {'code': 'VALIDATION_ERROR', 'message': str(e)}}), 400
    except Exception as e:
        current_app.logger.error(f"Erreur test algorithms: {str(e)}")
        return jsonify({'error': {'code': 'TRAINING_ERROR', 'message': 'Erreur lors du test des algorithmes'}}), 500


@ml_models_bp.route('/<int:model_id>/train', methods=['POST'])
def train_model(model_id):
    """Entraîne le modèle final"""
    try:
        schema = TrainModelSchema()
        data = schema.load(request.json)
        
        result = MLService.train_final_model(
            model_id,
            data['algorithm'],
            current_app.config['MODEL_FOLDER']
        )
        
        return jsonify(result), 200
        
    except ValidationError as e:
        return jsonify({'error': {'code': 'VALIDATION_ERROR', 'message': 'Données invalides', 'details': e.messages}}), 400
    except ValueError as e:
        return jsonify({'error': {'code': 'TRAINING_ERROR', 'message': str(e)}}), 500
    except Exception as e:
        current_app.logger.error(f"Erreur train model: {str(e)}")
        return jsonify({'error': {'code': 'INTERNAL_ERROR', 'message': 'Erreur lors de l\'entraînement'}}), 500


@ml_models_bp.route('', methods=['GET'])
def get_models():
    """Liste tous les modèles ML"""
    try:
        from models.ml_model import MLModel
        models = MLModel.query.order_by(MLModel.created_at.desc()).all()
        
        schema = MLModelSchema(many=True)
        return jsonify(schema.dump(models)), 200
        
    except Exception as e:
        current_app.logger.error(f"Erreur get models: {str(e)}")
        return jsonify({'error': {'code': 'INTERNAL_ERROR', 'message': 'Erreur lors de la récupération'}}), 500


@ml_models_bp.route('/<int:model_id>', methods=['GET'])
def get_model(model_id):
    """Récupère un modèle par ID"""
    try:
        from models.ml_model import MLModel
        ml_model = MLModel.query.get(model_id)
        
        if not ml_model:
            return jsonify({'error': {'code': 'NOT_FOUND', 'message': f'Modèle {model_id} introuvable'}}), 404
        
        schema = MLModelSchema()
        return jsonify(schema.dump(ml_model)), 200
        
    except Exception as e:
        current_app.logger.error(f"Erreur get model: {str(e)}")
        return jsonify({'error': {'code': 'INTERNAL_ERROR', 'message': 'Erreur lors de la récupération'}}), 500


@ml_models_bp.route('/<int:model_id>', methods=['DELETE'])
def delete_model(model_id):
    """Supprime un modèle ML"""
    try:
        MLService.delete_model(model_id)
        return jsonify({'message': 'Modèle supprimé avec succès'}), 200
        
    except ValueError as e:
        return jsonify({'error': {'code': 'NOT_FOUND', 'message': str(e)}}), 404
    except Exception as e:
        current_app.logger.error(f"Erreur delete model: {str(e)}")
        return jsonify({'error': {'code': 'INTERNAL_ERROR', 'message': 'Erreur lors de la suppression'}}), 500


@ml_models_bp.route('/stats', methods=['GET'])
def get_stats():
    """Retourne les statistiques globales"""
    try:
        stats = MLService.get_model_stats()
        return jsonify(stats), 200
        
    except Exception as e:
        current_app.logger.error(f"Erreur get stats: {str(e)}")
        return jsonify({'error': {'code': 'INTERNAL_ERROR', 'message': 'Erreur lors du calcul des statistiques'}}), 500
