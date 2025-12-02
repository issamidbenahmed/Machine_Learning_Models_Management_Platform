"""Routes pour l'export de modèles en API"""
from flask import Blueprint, jsonify, current_app
from services.api_export_service import APIExportService

api_export_bp = Blueprint('api_export', __name__, url_prefix='/api/export')


@api_export_bp.route('/<int:model_id>', methods=['POST'])
def export_model(model_id):
    """Exporte un modèle comme API"""
    try:
        result = APIExportService.export_model(model_id)
        return jsonify(result), 201
    except ValueError as e:
        return jsonify({'error': {'code': 'VALIDATION_ERROR', 'message': str(e)}}), 400
    except Exception as e:
        current_app.logger.error(f"Erreur export model: {str(e)}")
        return jsonify({'error': {'code': 'INTERNAL_ERROR', 'message': 'Erreur lors de l\'export'}}), 500


@api_export_bp.route('s', methods=['GET'])
def get_all_apis():
    """Liste toutes les APIs exportées"""
    try:
        apis = APIExportService.get_all_apis()
        return jsonify(apis), 200
    except Exception as e:
        current_app.logger.error(f"Erreur get APIs: {str(e)}")
        return jsonify({'error': {'code': 'INTERNAL_ERROR', 'message': 'Erreur lors de la récupération'}}), 500


@api_export_bp.route('s/<int:api_id>', methods=['GET'])
def get_api_details(api_id):
    """Récupère les détails d'une API"""
    try:
        api = APIExportService.get_api_details(api_id)
        return jsonify(api), 200
    except ValueError as e:
        return jsonify({'error': {'code': 'NOT_FOUND', 'message': str(e)}}), 404
    except Exception as e:
        current_app.logger.error(f"Erreur get API details: {str(e)}")
        return jsonify({'error': {'code': 'INTERNAL_ERROR', 'message': 'Erreur lors de la récupération'}}), 500


@api_export_bp.route('s/<int:api_id>/status', methods=['PUT'])
def update_api_status(api_id):
    """Active ou désactive une API"""
    try:
        from flask import request
        data = request.json
        status = data.get('status')
        
        if status not in ['active', 'inactive']:
            return jsonify({'error': {'code': 'VALIDATION_ERROR', 'message': 'Status doit être active ou inactive'}}), 400
        
        if status == 'active':
            api = APIExportService.activate_api(api_id)
        else:
            api = APIExportService.deactivate_api(api_id)
        
        return jsonify(api), 200
    except ValueError as e:
        return jsonify({'error': {'code': 'NOT_FOUND', 'message': str(e)}}), 404
    except Exception as e:
        current_app.logger.error(f"Erreur update status: {str(e)}")
        return jsonify({'error': {'code': 'INTERNAL_ERROR', 'message': 'Erreur lors de la mise à jour'}}), 500


@api_export_bp.route('s/<int:api_id>/regenerate-key', methods=['POST'])
def regenerate_api_key(api_id):
    """Régénère la clé API"""
    try:
        result = APIExportService.regenerate_api_key(api_id)
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({'error': {'code': 'NOT_FOUND', 'message': str(e)}}), 404
    except Exception as e:
        current_app.logger.error(f"Erreur regenerate key: {str(e)}")
        return jsonify({'error': {'code': 'INTERNAL_ERROR', 'message': 'Erreur lors de la régénération'}}), 500


@api_export_bp.route('s/<int:api_id>', methods=['DELETE'])
def delete_api(api_id):
    """Supprime une API exportée"""
    try:
        APIExportService.delete_api(api_id)
        return jsonify({'message': 'API supprimée avec succès'}), 200
    except ValueError as e:
        return jsonify({'error': {'code': 'NOT_FOUND', 'message': str(e)}}), 404
    except Exception as e:
        current_app.logger.error(f"Erreur delete API: {str(e)}")
        return jsonify({'error': {'code': 'INTERNAL_ERROR', 'message': 'Erreur lors de la suppression'}}), 500
