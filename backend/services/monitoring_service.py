from datetime import datetime, timedelta
from sqlalchemy import func
from extensions import db
from models.exported_api import ExportedAPI
from models.api_request import APIRequest
from models.api_metrics import APIMetrics

class MonitoringService:
    """Service for monitoring API usage and performance"""
    
    @staticmethod
    def get_api_stats(api_id, time_range='24h'):
        """Get statistics for a specific API"""
        api = ExportedAPI.query.get(api_id)
        if not api:
            return None
        
        # Calculate time range
        now = datetime.utcnow()
        if time_range == '24h':
            start_time = now - timedelta(hours=24)
        elif time_range == '7d':
            start_time = now - timedelta(days=7)
        elif time_range == '30d':
            start_time = now - timedelta(days=30)
        else:
            start_time = now - timedelta(hours=24)
        
        # Get requests in time range
        requests = APIRequest.query.filter(
            APIRequest.api_id == api_id,
            APIRequest.timestamp >= start_time
        ).all()
        
        # Calculate statistics
        total_requests = len(requests)
        success_requests = len([r for r in requests if 200 <= r.status_code < 300])
        error_requests = len([r for r in requests if r.status_code >= 400])
        
        avg_response_time = 0
        avg_cpu_usage = 0
        avg_memory_usage = 0
        
        if requests:
            response_times = [r.response_time for r in requests if r.response_time]
            cpu_usages = [r.cpu_usage for r in requests if r.cpu_usage]
            memory_usages = [r.memory_usage for r in requests if r.memory_usage]
            
            avg_response_time = sum(response_times) / len(response_times) if response_times else 0
            avg_cpu_usage = sum(cpu_usages) / len(cpu_usages) if cpu_usages else 0
            avg_memory_usage = sum(memory_usages) / len(memory_usages) if memory_usages else 0
        
        success_rate = (success_requests / total_requests * 100) if total_requests > 0 else 0
        error_rate = (error_requests / total_requests * 100) if total_requests > 0 else 0
        
        # Get requests for different time periods
        requests_24h = APIRequest.query.filter(
            APIRequest.api_id == api_id,
            APIRequest.timestamp >= now - timedelta(hours=24)
        ).count()
        
        requests_7d = APIRequest.query.filter(
            APIRequest.api_id == api_id,
            APIRequest.timestamp >= now - timedelta(days=7)
        ).count()
        
        # Get last request time
        last_request = APIRequest.query.filter(
            APIRequest.api_id == api_id
        ).order_by(APIRequest.timestamp.desc()).first()
        
        return {
            'total_requests': api.total_requests,
            'requests_24h': requests_24h,
            'requests_7d': requests_7d,
            'avg_response_time': round(avg_response_time, 2),
            'success_rate': round(success_rate, 2),
            'error_rate': round(error_rate, 2),
            'avg_cpu_usage': round(avg_cpu_usage, 2),
            'avg_memory_usage': round(avg_memory_usage, 2),
            'last_request': last_request.timestamp.isoformat() if last_request else None
        }
    
    @staticmethod
    def get_all_apis_summary():
        """Get summary statistics for all APIs"""
        apis = ExportedAPI.query.all()
        
        total_apis = len(apis)
        active_apis = len([api for api in apis if api.status == 'active'])
        total_requests = sum(api.total_requests for api in apis)
        
        # Get requests in last 24h
        now = datetime.utcnow()
        requests_24h = APIRequest.query.filter(
            APIRequest.timestamp >= now - timedelta(hours=24)
        ).count()
        
        return {
            'total_apis': total_apis,
            'active_apis': active_apis,
            'total_requests': total_requests,
            'requests_24h': requests_24h
        }
    
    @staticmethod
    def get_api_requests(api_id, limit=100):
        """Get recent requests for an API"""
        requests = APIRequest.query.filter(
            APIRequest.api_id == api_id
        ).order_by(APIRequest.timestamp.desc()).limit(limit).all()
        
        return [req.to_dict() for req in requests]
    
    @staticmethod
    def get_api_metrics(api_id, time_range='24h'):
        """Get aggregated metrics for an API"""
        now = datetime.utcnow()
        
        if time_range == '24h':
            start_time = now - timedelta(hours=24)
        elif time_range == '7d':
            start_time = now - timedelta(days=7)
        elif time_range == '30d':
            start_time = now - timedelta(days=30)
        else:
            start_time = now - timedelta(hours=24)
        
        metrics = APIMetrics.query.filter(
            APIMetrics.api_id == api_id,
            APIMetrics.hour_timestamp >= start_time
        ).order_by(APIMetrics.hour_timestamp.asc()).all()
        
        return [metric.to_dict() for metric in metrics]
    
    @staticmethod
    def aggregate_metrics():
        """Aggregate metrics for all APIs (to be run periodically)"""
        now = datetime.utcnow()
        current_hour = now.replace(minute=0, second=0, microsecond=0)
        last_hour = current_hour - timedelta(hours=1)
        
        apis = ExportedAPI.query.all()
        
        for api in apis:
            # Get requests from last hour
            requests = APIRequest.query.filter(
                APIRequest.api_id == api.id,
                APIRequest.timestamp >= last_hour,
                APIRequest.timestamp < current_hour
            ).all()
            
            if not requests:
                continue
            
            # Calculate aggregated metrics
            request_count = len(requests)
            success_count = len([r for r in requests if 200 <= r.status_code < 300])
            error_count = len([r for r in requests if r.status_code >= 400])
            
            response_times = [r.response_time for r in requests if r.response_time]
            cpu_usages = [r.cpu_usage for r in requests if r.cpu_usage]
            memory_usages = [r.memory_usage for r in requests if r.memory_usage]
            
            avg_response_time = sum(response_times) / len(response_times) if response_times else 0
            avg_cpu_usage = sum(cpu_usages) / len(cpu_usages) if cpu_usages else 0
            avg_memory_usage = sum(memory_usages) / len(memory_usages) if memory_usages else 0
            
            # Check if metric already exists
            existing_metric = APIMetrics.query.filter(
                APIMetrics.api_id == api.id,
                APIMetrics.hour_timestamp == last_hour
            ).first()
            
            if existing_metric:
                # Update existing metric
                existing_metric.request_count = request_count
                existing_metric.avg_response_time = avg_response_time
                existing_metric.success_count = success_count
                existing_metric.error_count = error_count
                existing_metric.avg_cpu_usage = avg_cpu_usage
                existing_metric.avg_memory_usage = avg_memory_usage
            else:
                # Create new metric
                metric = APIMetrics(
                    api_id=api.id,
                    hour_timestamp=last_hour,
                    request_count=request_count,
                    avg_response_time=avg_response_time,
                    success_count=success_count,
                    error_count=error_count,
                    avg_cpu_usage=avg_cpu_usage,
                    avg_memory_usage=avg_memory_usage
                )
                db.session.add(metric)
        
        db.session.commit()
        return {'status': 'success', 'message': 'Metrics aggregated successfully'}
