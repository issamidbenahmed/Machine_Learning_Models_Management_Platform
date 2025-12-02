"""Middleware pour l'authentification des APIs"""
from functools import wraps
from flask import request, jsonify
from services.api_export_service import APIExportService


def require_api_key(f):
    """
    Décorateur pour valider l'API key
    
    Usage:
        @require_api_key
        def my_route(api, ...):
            # api est l'objet ExportedAPI validé
            pass
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Récupérer l'API key depuis les headers
        api_key = request.headers.get('X-API-Key')
        
        if not api_key:
            return jsonify({
                'error': {
                    'code': 'MISSING_API_KEY',
                    'message': 'API key required. Please provide X-API-Key header.'
                }
            }), 401
        
        # Valider l'API key
        api = APIExportService.validate_api_key(api_key)
        
        if not api:
            return jsonify({
                'error': {
                    'code': 'INVALID_API_KEY',
                    'message': 'Invalid API key'
                }
            }), 403
        
        if api.status != 'active':
            return jsonify({
                'error': {
                    'code': 'INACTIVE_API',
                    'message': 'This API is currently inactive'
                }
            }), 403
        
        # Passer l'API validée à la fonction
        return f(api, *args, **kwargs)
    
    return decorated_function
