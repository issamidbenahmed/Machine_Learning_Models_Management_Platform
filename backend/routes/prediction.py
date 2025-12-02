"""Routes pour les prédictions via API"""
from flask import Blueprint, request, jsonify, current_app
from middleware.api_auth import require_api_key
from services.prediction_service import PredictionService

prediction_bp = Blueprint('prediction', __name__, url_prefix='/api/predict')


@prediction_bp.route('/<int:api_id>', methods=['POST'])
@require_api_key
def predict(api, api_id):
    """
    Effectue une prédiction avec le modèle
    
    Headers requis:
        X-API-Key: Clé API pour l'authentification
    
    Body (JSON):
        {
            "feature1": value1,
            "feature2": value2,
            ...
        }
    
    Response:
        {
            "prediction": [result],
            "model_id": 1,
            "model_name": "Mon Modèle",
            "timestamp": "2025-01-01T12:00:00"
        }
    """
    try:
        # Vérifier que l'API ID correspond
        if api.id != api_id:
            return jsonify({
                'error': {
                    'code': 'API_MISMATCH',
                    'message': 'API key does not match the requested API'
                }
            }), 403
        
        # Récupérer les données
        input_data = request.json
        
        if not input_data:
            return jsonify({
                'error': {
                    'code': 'MISSING_DATA',
                    'message': 'Request body is required'
                }
            }), 400
        
        # Effectuer la prédiction
        result = PredictionService.predict(api_id, input_data)
        
        return jsonify(result), 200
        
    except ValueError as e:
        return jsonify({
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': str(e)
            }
        }), 400
    except Exception as e:
        current_app.logger.error(f"Erreur prediction: {str(e)}", exc_info=True)
        return jsonify({
            'error': {
                'code': 'PREDICTION_ERROR',
                'message': 'An error occurred during prediction'
            }
        }), 500


@prediction_bp.route('/<int:api_id>/info', methods=['GET'])
@require_api_key
def get_api_info(api, api_id):
    """
    Récupère les informations sur l'API (inputs attendus, etc.)
    
    Headers requis:
        X-API-Key: Clé API pour l'authentification
    """
    try:
        if api.id != api_id:
            return jsonify({
                'error': {
                    'code': 'API_MISMATCH',
                    'message': 'API key does not match the requested API'
                }
            }), 403
        
        return jsonify({
            'api_id': api.id,
            'model_id': api.model_id,
            'model_name': api.model.name,
            'status': api.status,
            'inputs': api.model.inputs,
            'outputs': api.model.outputs,
            'algorithm': api.model.algorithm,
            'created_at': api.created_at.isoformat()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Erreur get info: {str(e)}")
        return jsonify({
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'An error occurred'
            }
        }), 500
