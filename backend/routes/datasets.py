"""Routes pour les datasets"""
import os
import sys
from flask import Blueprint, request, jsonify, current_app
from marshmallow import ValidationError
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.dataset_service import DatasetService
from schemas.dataset_schema import DatasetSchema

datasets_bp = Blueprint('datasets', __name__, url_prefix='/datasets')


@datasets_bp.route('/upload', methods=['POST'])
def upload_dataset():
    """Upload un dataset CSV"""
    try:
        # Vérifier qu'un fichier est présent
        if 'file' not in request.files:
            return jsonify({'error': {'code': 'NO_FILE', 'message': 'Aucun fichier fourni'}}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': {'code': 'EMPTY_FILENAME', 'message': 'Nom de fichier vide'}}), 400
        
        # Vérifier l'extension
        if not file.filename.endswith('.csv'):
            return jsonify({'error': {'code': 'INVALID_FORMAT', 'message': 'Seuls les fichiers CSV sont acceptés'}}), 415
        
        # Upload et analyse
        result = DatasetService.upload_dataset(
            file,
            current_app.config['UPLOAD_FOLDER'],
            current_app.config['MAX_UPLOAD_SIZE']
        )
        
        return jsonify(result), 201
        
    except ValueError as e:
        if 'trop volumineux' in str(e):
            return jsonify({'error': {'code': 'FILE_TOO_LARGE', 'message': str(e)}}), 413
        return jsonify({'error': {'code': 'VALIDATION_ERROR', 'message': str(e)}}), 400
    except Exception as e:
        current_app.logger.error(f"Erreur upload dataset: {str(e)}")
        return jsonify({'error': {'code': 'INTERNAL_ERROR', 'message': 'Erreur lors de l\'upload'}}), 500


@datasets_bp.route('/<int:dataset_id>', methods=['GET'])
def get_dataset(dataset_id):
    """Récupère un dataset par ID avec aperçu"""
    try:
        dataset = DatasetService.get_dataset(dataset_id)
        
        # Charger l'aperçu du dataset
        from utils.file_handler import FileHandler
        df = FileHandler.read_csv_file(dataset.path)
        preview = FileHandler.get_preview(df, 10)
        
        result = {
            'id': dataset.id,
            'filename': dataset.filename,
            'columns': dataset.columns,
            'row_count': dataset.row_count,
            'preview': preview,
            'created_at': dataset.created_at.isoformat() if dataset.created_at else None
        }
        
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({'error': {'code': 'NOT_FOUND', 'message': str(e)}}), 404
    except Exception as e:
        current_app.logger.error(f"Erreur get dataset: {str(e)}")
        return jsonify({'error': {'code': 'INTERNAL_ERROR', 'message': 'Erreur lors de la récupération'}}), 500
