# Design Document - API Export & Monitoring

## Overview

Ce système permet d'exporter des modèles ML entraînés sous forme d'APIs REST sécurisées, avec un dashboard complet de monitoring pour suivre l'utilisation, les performances et les ressources. Le système comprend:
- Export de modèles en APIs REST
- Authentification par API key
- Logging automatique des requêtes
- Dashboard de monitoring en temps réel
- Métriques d'utilisation et de ressources
- Gestion du cycle de vie des APIs

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
├─────────────────────────────────────────────────────────────┤
│  Dashboard    │  Monitoring   │  API Docs   │  Management   │
└────────┬──────────────┬────────────┬──────────────┬─────────┘
         │              │            │              │
         ▼              ▼            ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API (Flask)                       │
├─────────────────────────────────────────────────────────────┤
│  Export API  │  Prediction   │  Monitoring  │  Management   │
│  Endpoints   │  Endpoints    │  Endpoints   │  Endpoints    │
└────────┬──────────────┬────────────┬──────────────┬─────────┘
         │              │            │              │
         ▼              ▼            ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Database Layer                          │
├─────────────────────────────────────────────────────────────┤
│  exported_apis  │  api_requests  │  api_metrics             │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

**Export Flow:**
```
User clicks "Export" → Backend creates API → Generate API key → 
Store in DB → Return URL + Key → Display to user
```

**Prediction Flow:**
```
External app → POST /api/predict/{api_id} → Validate API key → 
Load model → Preprocess data → Predict → Log request → Return result
```

**Monitoring Flow:**
```
Dashboard loads → Fetch APIs list → Fetch metrics → 
Aggregate stats → Display charts → Auto-refresh
```

## Database Schema

### Table: exported_apis

```sql
CREATE TABLE exported_apis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_id INTEGER NOT NULL,
    api_key VARCHAR(64) UNIQUE NOT NULL,
    api_endpoint VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'active',  -- active, inactive, error
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_used_at DATETIME,
    total_requests INTEGER DEFAULT 0,
    FOREIGN KEY (model_id) REFERENCES ml_models(id) ON DELETE CASCADE
);
```

### Table: api_requests

```sql
CREATE TABLE api_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    api_id INTEGER NOT NULL,
    request_data TEXT,  -- JSON des inputs
    response_data TEXT,  -- JSON de la prédiction
    response_time FLOAT,  -- en secondes
    status_code INTEGER,  -- 200, 400, 500, etc.
    error_message TEXT,
    cpu_usage FLOAT,  -- pourcentage
    memory_usage FLOAT,  -- en MB
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (api_id) REFERENCES exported_apis(id) ON DELETE CASCADE
);
```

### Table: api_metrics (agrégées par heure)

```sql
CREATE TABLE api_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    api_id INTEGER NOT NULL,
    hour_timestamp DATETIME NOT NULL,
    request_count INTEGER DEFAULT 0,
    avg_response_time FLOAT,
    success_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    avg_cpu_usage FLOAT,
    avg_memory_usage FLOAT,
    FOREIGN KEY (api_id) REFERENCES exported_apis(id) ON DELETE CASCADE,
    UNIQUE(api_id, hour_timestamp)
);
```

## Backend Components

### 1. Models

**Location:** `backend/models/exported_api.py`

```python
class ExportedAPI(db.Model):
    __tablename__ = 'exported_apis'
    
    id = db.Column(db.Integer, primary_key=True)
    model_id = db.Column(db.Integer, db.ForeignKey('ml_models.id'), nullable=False)
    api_key = db.Column(db.String(64), unique=True, nullable=False)
    api_endpoint = db.Column(db.String(255), unique=True, nullable=False)
    status = db.Column(db.String(20), default='active')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_used_at = db.Column(db.DateTime)
    total_requests = db.Column(db.Integer, default=0)
    
    # Relationships
    model = db.relationship('MLModel', backref='exported_api')
    requests = db.relationship('APIRequest', backref='api', cascade='all, delete-orphan')
```

**Location:** `backend/models/api_request.py`

```python
class APIRequest(db.Model):
    __tablename__ = 'api_requests'
    
    id = db.Column(db.Integer, primary_key=True)
    api_id = db.Column(db.Integer, db.ForeignKey('exported_apis.id'), nullable=False)
    request_data = db.Column(db.Text)
    response_data = db.Column(db.Text)
    response_time = db.Column(db.Float)
    status_code = db.Column(db.Integer)
    error_message = db.Column(db.Text)
    cpu_usage = db.Column(db.Float)
    memory_usage = db.Column(db.Float)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
```

### 2. Services

**Location:** `backend/services/api_export_service.py`

```python
class APIExportService:
    @staticmethod
    def export_model(model_id):
        """Exporte un modèle comme API"""
        # Générer API key unique
        # Créer endpoint unique
        # Sauvegarder en DB
        # Retourner URL et key
        
    @staticmethod
    def generate_api_key():
        """Génère une clé API unique et sécurisée"""
        
    @staticmethod
    def validate_api_key(api_key):
        """Valide une clé API"""
        
    @staticmethod
    def deactivate_api(api_id):
        """Désactive une API"""
        
    @staticmethod
    def regenerate_api_key(api_id):
        """Régénère la clé API"""
```

**Location:** `backend/services/prediction_service.py`

```python
class PredictionService:
    @staticmethod
    def predict(api_id, input_data):
        """Effectue une prédiction avec le modèle"""
        # Charger le modèle
        # Valider les inputs
        # Prétraiter les données
        # Faire la prédiction
        # Logger la requête
        # Retourner le résultat
        
    @staticmethod
    def log_request(api_id, request_data, response_data, response_time, status_code, error=None):
        """Log une requête API"""
```

**Location:** `backend/services/monitoring_service.py`

```python
class MonitoringService:
    @staticmethod
    def get_api_stats(api_id, time_range='24h'):
        """Récupère les statistiques d'une API"""
        
    @staticmethod
    def get_all_apis_summary():
        """Récupère le résumé de toutes les APIs"""
        
    @staticmethod
    def aggregate_metrics():
        """Agrège les métriques par heure"""
        
    @staticmethod
    def get_resource_usage(api_id):
        """Récupère l'usage des ressources"""
```

### 3. Routes

**Location:** `backend/routes/api_export.py`

```python
# POST /api/export/{model_id} - Exporter un modèle
# GET /api/exports - Liste des APIs exportées
# GET /api/exports/{api_id} - Détails d'une API
# PUT /api/exports/{api_id}/status - Activer/Désactiver
# POST /api/exports/{api_id}/regenerate-key - Régénérer la clé
# DELETE /api/exports/{api_id} - Supprimer une API
```

**Location:** `backend/routes/prediction.py`

```python
# POST /api/predict/{api_id} - Faire une prédiction (API publique)
```

**Location:** `backend/routes/monitoring.py`

```python
# GET /api/monitoring/apis - Liste avec stats
# GET /api/monitoring/apis/{api_id}/stats - Stats détaillées
# GET /api/monitoring/apis/{api_id}/requests - Historique des requêtes
# GET /api/monitoring/apis/{api_id}/metrics - Métriques agrégées
```

### 4. Middleware

**Location:** `backend/middleware/api_auth.py`

```python
def require_api_key(f):
    """Décorateur pour valider l'API key"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        if not api_key:
            return jsonify({'error': 'API key required'}), 401
        
        api = ExportedAPI.query.filter_by(api_key=api_key).first()
        if not api or api.status != 'active':
            return jsonify({'error': 'Invalid or inactive API key'}), 403
            
        return f(api, *args, **kwargs)
    return decorated_function
```

## Frontend Components

### 1. Pages

**Location:** `frontend/src/app/monitoring/page.tsx`

Dashboard principal de monitoring avec:
- Liste des APIs exportées
- Statistiques globales
- Graphiques de tendances
- Filtres et recherche

**Location:** `frontend/src/app/monitoring/[id]/page.tsx`

Page de détails d'une API avec:
- Informations de l'API
- Statistiques détaillées
- Graphiques de performance
- Historique des requêtes
- Documentation

### 2. Components

**Location:** `frontend/src/components/monitoring/APIList.tsx`

Liste des APIs avec:
- Carte par API
- Status indicator
- Stats rapides
- Actions (view, deactivate, delete)

**Location:** `frontend/src/components/monitoring/APIStatsCard.tsx`

Carte de statistiques:
- Total requests
- Requests 24h
- Avg response time
- Success rate
- CPU/Memory usage

**Location:** `frontend/src/components/monitoring/RequestsChart.tsx`

Graphique des requêtes:
- Line chart avec Recharts
- Requests over time
- Filtres de période

**Location:** `frontend/src/components/monitoring/APIDocumentation.tsx`

Documentation de l'API:
- Endpoint URL
- API key (masquée avec bouton copy)
- Exemple curl
- Exemple Python
- Input/Output schema

**Location:** `frontend/src/components/monitoring/ExportAPIModal.tsx`

Modal après export:
- API URL avec bouton copy
- API key avec bouton copy
- Instructions d'utilisation
- Lien vers documentation

### 3. API Client

**Location:** `frontend/src/lib/api.ts`

Nouvelles méthodes:
```typescript
// Export
async exportModel(modelId: number): Promise<ExportedAPI>

// Monitoring
async getExportedAPIs(): Promise<ExportedAPI[]>
async getAPIDetails(apiId: number): Promise<APIDetails>
async getAPIStats(apiId: number, timeRange: string): Promise<APIStats>
async getAPIRequests(apiId: number, limit: number): Promise<APIRequest[]>

// Management
async updateAPIStatus(apiId: number, status: string): Promise<void>
async regenerateAPIKey(apiId: number): Promise<{api_key: string}>
async deleteAPI(apiId: number): Promise<void>
```

## Security

### 1. API Key Generation
- Utiliser `secrets.token_urlsafe(48)` pour générer des clés sécurisées
- Stocker en clair (pas de hash car besoin de comparer)
- Clés de 64 caractères minimum

### 2. Rate Limiting
- Implémenter rate limiting par API key
- Limite: 100 requêtes/minute par défaut
- Retourner 429 Too Many Requests si dépassé

### 3. Input Validation
- Valider que les inputs matchent le schéma du modèle
- Sanitizer les données
- Limiter la taille des requêtes (max 1MB)

### 4. CORS
- Configurer CORS pour permettre les requêtes cross-origin
- Whitelist optionnelle de domaines

## Performance Optimization

### 1. Model Caching
- Garder les modèles en mémoire (LRU cache)
- Éviter de recharger à chaque requête
- Cache size: 10 modèles max

### 2. Database Indexing
```sql
CREATE INDEX idx_api_key ON exported_apis(api_key);
CREATE INDEX idx_api_requests_timestamp ON api_requests(api_id, timestamp);
CREATE INDEX idx_api_metrics_hour ON api_metrics(api_id, hour_timestamp);
```

### 3. Metrics Aggregation
- Job cron pour agréger les métriques toutes les heures
- Nettoyer les vieilles requêtes (> 30 jours)

## Monitoring Metrics

### Usage Metrics
- Total requests (all time)
- Requests last 24h
- Requests last 7 days
- Requests per hour/day (chart)
- Success rate (%)
- Error rate (%)

### Performance Metrics
- Average response time
- P50, P95, P99 response times
- Response time distribution (histogram)
- Slowest requests

### Resource Metrics
- CPU usage (%)
- Memory usage (MB)
- Peak CPU/Memory
- Resource usage over time (chart)

## Error Handling

### API Errors
- 400: Invalid input data
- 401: Missing API key
- 403: Invalid or inactive API key
- 404: API not found
- 429: Rate limit exceeded
- 500: Internal server error

### Error Response Format
```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "Missing required field: age",
    "details": {
      "missing_fields": ["age"]
    }
  }
}
```

## Future Enhancements

1. **Versioning**: Support multiple versions of the same API
2. **Webhooks**: Notify on specific events
3. **Custom domains**: Allow custom domain mapping
4. **API Gateway**: Centralized gateway with load balancing
5. **Auto-scaling**: Scale based on load
6. **A/B Testing**: Test different model versions
7. **Billing**: Track usage for billing purposes
8. **SLA Monitoring**: Track uptime and SLA compliance
