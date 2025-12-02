from flask import Blueprint, jsonify, request
from services.monitoring_service import MonitoringService
from models.exported_api import ExportedAPI

monitoring_bp = Blueprint('monitoring', __name__, url_prefix='/api/monitoring')

@monitoring_bp.route('/apis', methods=['GET'])
def get_all_apis():
    """Get all exported APIs with basic stats"""
    try:
        # Get all APIs
        apis = ExportedAPI.query.all()
        
        # Get summary stats
        summary = MonitoringService.get_all_apis_summary()
        
        # Add basic stats to each API
        apis_with_stats = []
        for api in apis:
            api_dict = api.to_dict()
            # Get quick stats (24h)
            stats = MonitoringService.get_api_stats(api.id, '24h')
            api_dict['stats'] = {
                'requests_24h': stats['requests_24h'],
                'avg_response_time': stats['avg_response_time'],
                'success_rate': stats['success_rate']
            }
            apis_with_stats.append(api_dict)
        
        return jsonify({
            'apis': apis_with_stats,
            'summary': summary
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@monitoring_bp.route('/apis/<int:api_id>/stats', methods=['GET'])
def get_api_stats(api_id):
    """Get detailed statistics for a specific API"""
    try:
        time_range = request.args.get('range', '24h')
        
        stats = MonitoringService.get_api_stats(api_id, time_range)
        
        if stats is None:
            return jsonify({'error': 'API not found'}), 404
        
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@monitoring_bp.route('/apis/<int:api_id>/requests', methods=['GET'])
def get_api_requests(api_id):
    """Get request history for a specific API"""
    try:
        limit = request.args.get('limit', 100, type=int)
        
        requests = MonitoringService.get_api_requests(api_id, limit)
        
        return jsonify(requests), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@monitoring_bp.route('/apis/<int:api_id>/metrics', methods=['GET'])
def get_api_metrics(api_id):
    """Get aggregated metrics for a specific API"""
    try:
        time_range = request.args.get('range', '24h')
        
        metrics = MonitoringService.get_api_metrics(api_id, time_range)
        
        return jsonify(metrics), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@monitoring_bp.route('/aggregate', methods=['POST'])
def aggregate_metrics():
    """Manually trigger metrics aggregation (can be called by cron)"""
    try:
        result = MonitoringService.aggregate_metrics()
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
