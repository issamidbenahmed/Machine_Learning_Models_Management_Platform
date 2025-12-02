# Design Document

## Overview

La plateforme ML est une application full-stack moderne permettant la gestion complète du cycle de vie des modèles Machine Learning. L'architecture suit un pattern client-serveur avec un frontend Next.js pour l'interface utilisateur et un backend Flask pour la logique métier et l'entraînement des modèles.

**Choix technologique frontend : Next.js**
- Rendu hybride (SSR + CSR) pour de meilleures performances
- Routing intégré et optimisations automatiques
- Meilleure expérience développeur avec TypeScript
- Support natif des API routes si besoin d'un BFF futur

## Architecture

### Architecture Globale

```mermaid
graph TB
    subgraph "Frontend - Next.js"
        UI[Pages React/Next.js]
        Components[Composants UI]
        API_Client[API Client Axios]
    end
    
    subgraph "Backend - Flask"
        Routes[Flask Routes/Blueprints]
        Services[Business Logic Services]
        ML_Engine[ML Engine]
        ORM[SQLAlchemy ORM]
    end
    
    subgraph "Storage"
        MySQL[(MySQL Database)]
        FileSystem[File System - CSV & Models]
    end
    
    UI --> Components
    Components --> API_Client
    API_Client -->|HTTP/REST| Routes
    Routes --> Services
    Services --> ML_Engine
    Services --> ORM
    ORM --> MySQL
    ML_Engine --> FileSystem
    Services --> FileSystem
```

### Architecture Backend (Flask)

```
backend/
├── app.py                      # Point d'entrée Flask
├── config.py                   # Configuration (DB, upload limits, etc.)
├── extensions.py               # Initialisation extensions (SQLAlchemy, CORS, etc.)
├── models/                     # Modèles SQLAlchemy
│   ├── __init__.py
│   ├── dataset.py             # Modèle Dataset
│   └── ml_model.py            # Modèle MLModel
├── routes/                     # Blueprints Flask
│   ├── __init__.py
│   ├── datasets.py            # Routes /datasets/*
│   └── ml_models.py           # Routes /models/*
├── services/                   # Logique métier
│   ├── __init__.py
│   ├── dataset_service.py     # Service gestion datasets
│   └── ml_service.py          # Service ML (training, testing)
├── utils/                      # Utilitaires
│   ├── __init__.py
│   ├── file_handler.py        # Gestion fichiers CSV
│   └── ml_algorithms.py       # Implémentations algorithmes ML
├── schemas/                    # Schémas Marshmallow
│   ├── __init__.py
│   ├── dataset_schema.py
│   └── ml_model_schema.py
├── saved_models/              # Modèles ML entraînés (.pkl)
├── uploads/                   # Datasets CSV uploadés
├── migrations/                # Migrations Alembic
└── requirements.txt           # Dépendances Python
```

### Architecture Frontend (Next.js)

```
frontend/
├── src/
│   ├── app/                   # App Router Next.js 13+
│   │   ├── layout.tsx        # Layout principal
│   │   ├── page.tsx          # Dashboard (home)
│   │   └── models/
│   │       ├── create/
│   │       │   └── page.tsx  # Wizard création
│   │       └── [id]/
│   │           └── page.tsx  # Détails modèle
│   ├── components/            # Composants React
│   │   ├── dashboard/
│   │   │   ├── StatCard.tsx
│   │   │   └── ModelList.tsx
│   │   ├── wizard/
│   │   │   ├── WizardLayout.tsx
│   │   │   ├── Step1Info.tsx
│   │   │   ├── Step2Features.tsx
│   │   │   ├── Step3Algorithm.tsx
│   │   │   └── Step4Result.tsx
│   │   └── ui/               # Composants UI réutilisables
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       └── FileUpload.tsx
│   ├── lib/                   # Utilitaires
│   │   ├── api.ts            # Client API Axios
│   │   └── types.ts          # Types TypeScript
│   └── styles/
│       └── globals.css       # Styles globaux (Tailwind)
├── public/
├── package.json
└── next.config.js
```

## Components and Interfaces

### Backend Components

#### 1. Models (SQLAlchemy)

**Dataset Model**
```python
class Dataset(db.Model):
    __tablename__ = 'datasets'
    
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    path = db.Column(db.String(500), nullable=False)
    columns = db.Column(db.JSON, nullable=False)  # Liste des colonnes
    row_count = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relations
    ml_models = db.relationship('MLModel', backref='dataset', lazy=True)
```

**MLModel Model**
```python
class MLModel(db.Model):
    __tablename__ = 'ml_models'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    dataset_id = db.Column(db.Integer, db.ForeignKey('datasets.id'), nullable=False)
    inputs = db.Column(db.JSON)  # Liste des colonnes input
    outputs = db.Column(db.JSON)  # Liste des colonnes output
    algorithm = db.Column(db.String(100))
    score = db.Column(db.Float)
    model_path = db.Column(db.String(500))
    status = db.Column(db.String(50), default='created')  # created, configured, trained
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    trained_at = db.Column(db.DateTime)
```

#### 2. Services

**DatasetService**
```python
class DatasetService:
    @staticmethod
    def upload_dataset(file) -> dict:
        """
        Upload et analyse un fichier CSV
        Returns: {id, filename, columns, preview}
        """
        
    @staticmethod
    def get_dataset(dataset_id: int) -> Dataset:
        """Récupère un dataset par ID"""
        
    @staticmethod
    def analyze_csv(file_path: str) -> dict:
        """
        Analyse un CSV avec pandas
        Returns: {columns, preview, row_count, dtypes}
        """
```

**MLService**
```python
class MLService:
    @staticmethod
    def create_model(name: str, description: str, dataset_id: int) -> MLModel:
        """Crée un nouveau modèle ML"""
        
    @staticmethod
    def configure_features(model_id: int, inputs: list, outputs: list) -> MLModel:
        """Configure les features input/output"""
        
    @staticmethod
    def test_algorithms(model_id: int) -> list:
        """
        Teste tous les algorithmes disponibles
        Returns: [{algorithm, score, training_time}] trié par score
        """
        
    @staticmethod
    def train_final_model(model_id: int, algorithm: str) -> dict:
        """
        Entraîne et sauvegarde le modèle final
        Returns: {status, score, model_path}
        """
        
    @staticmethod
    def get_model_stats() -> dict:
        """
        Calcule les statistiques globales
        Returns: {total_models, trained_models, total_datasets, avg_score, total_uses}
        """
```

#### 3. ML Algorithms Utility

```python
class MLAlgorithms:
    """Classe contenant les implémentations des algorithmes ML"""
    
    ALGORITHMS = {
        'linear_regression': {
            'name': 'Linear Regression',
            'description': 'Régression linéaire pour prédictions continues',
            'type': 'regression'
        },
        'logistic_regression': {
            'name': 'Logistic Regression',
            'description': 'Classification binaire ou multi-classe',
            'type': 'classification'
        },
        'knn': {
            'name': 'K-Nearest Neighbors',
            'description': 'Classification basée sur la proximité',
            'type': 'classification'
        },
        'decision_tree': {
            'name': 'Decision Tree',
            'description': 'Arbre de décision pour classification/régression',
            'type': 'both'
        },
        'random_forest': {
            'name': 'Random Forest',
            'description': 'Ensemble d\'arbres pour meilleure précision',
            'type': 'both'
        },
        'svm': {
            'name': 'Support Vector Machine',
            'description': 'Classification avec marges maximales',
            'type': 'classification'
        }
    }
    
    @staticmethod
    def train_and_evaluate(algorithm: str, X_train, X_test, y_train, y_test) -> dict:
        """
        Entraîne un algorithme et retourne le score
        Returns: {algorithm, score, training_time, model_instance}
        """
        
    @staticmethod
    def detect_problem_type(y_data) -> str:
        """Détecte si c'est un problème de classification ou régression"""
        
    @staticmethod
    def get_appropriate_algorithms(problem_type: str) -> list:
        """Retourne les algorithmes appropriés selon le type de problème"""
```

#### 4. API Routes

**Dataset Routes**
```python
# POST /datasets/upload
# GET /datasets/<id>
```

**ML Model Routes**
```python
# POST /models/create
# POST /models/<id>/select-io
# POST /models/<id>/test-algorithms
# POST /models/<id>/train
# GET /models
# GET /models/<id>
# GET /models/stats
```

### Frontend Components

#### 1. Dashboard Components

**StatCard Component**
```typescript
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  trend?: number;  // Optionnel: variation en %
}
```

**ModelList Component**
```typescript
interface ModelListProps {
  models: MLModel[];
  onViewModel: (id: number) => void;
}

interface MLModel {
  id: number;
  name: string;
  description: string;
  algorithm: string;
  score: number;
  status: string;
  created_at: string;
}
```

#### 2. Wizard Components

**WizardLayout Component**
- Gère la navigation entre les étapes
- Affiche la progression (stepper)
- Maintient l'état du wizard

**Step1Info Component**
```typescript
interface Step1Data {
  name: string;
  description: string;
  file: File | null;
}
```

**Step2Features Component**
```typescript
interface Step2Data {
  selectedInputs: string[];
  selectedOutputs: string[];
  datasetPreview: any[][];
  columns: string[];
}
```

**Step3Algorithm Component**
```typescript
interface AlgorithmResult {
  algorithm: string;
  name: string;
  description: string;
  score: number;
  training_time: number;
}
```

**Step4Result Component**
- Affiche les résultats finaux
- Animation de succès
- Boutons d'action (retour dashboard, voir détails)

#### 3. API Client

```typescript
class APIClient {
  private baseURL: string;
  
  // Datasets
  async uploadDataset(file: File, name: string, description: string): Promise<Dataset>;
  async getDataset(id: number): Promise<Dataset>;
  
  // Models
  async createModel(data: CreateModelData): Promise<MLModel>;
  async selectFeatures(modelId: number, inputs: string[], outputs: string[]): Promise<MLModel>;
  async testAlgorithms(modelId: number): Promise<AlgorithmResult[]>;
  async trainModel(modelId: number, algorithm: string): Promise<TrainingResult>;
  async getModels(): Promise<MLModel[]>;
  async getModel(id: number): Promise<MLModel>;
  async getStats(): Promise<Stats>;
}
```

## Data Models

### Database Schema

```sql
CREATE TABLE datasets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    path VARCHAR(500) NOT NULL,
    columns JSON NOT NULL,
    row_count INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_created_at (created_at)
);

CREATE TABLE ml_models (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    dataset_id INT NOT NULL,
    inputs JSON,
    outputs JSON,
    algorithm VARCHAR(100),
    score FLOAT,
    model_path VARCHAR(500),
    status VARCHAR(50) DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    trained_at DATETIME,
    FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);
```

### Data Flow

#### Upload Dataset Flow
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant FS as FileSystem
    participant DB as MySQL
    
    U->>F: Upload CSV file
    F->>B: POST /datasets/upload
    B->>FS: Save CSV file
    B->>B: Analyze with pandas
    B->>DB: Insert dataset record
    DB-->>B: Dataset ID
    B-->>F: {id, columns, preview}
    F-->>U: Show preview
```

#### Test Algorithms Flow
```mermaid
sequenceDiagram
    participant F as Frontend
    participant B as Backend
    participant DB as MySQL
    participant ML as ML Engine
    
    F->>B: POST /models/<id>/test-algorithms
    B->>DB: Get model + dataset
    B->>ML: Load dataset
    B->>ML: Split train/test
    loop For each algorithm
        B->>ML: Train algorithm
        ML-->>B: Score
    end
    B->>B: Sort by score
    B-->>F: [{algorithm, score}]
    F-->>F: Display results
```

## Error Handling

### Backend Error Handling

**Error Response Format**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Description lisible de l'erreur",
    "details": {
      "field": "inputs",
      "reason": "Au moins une colonne input doit être sélectionnée"
    }
  }
}
```

**Error Categories**
- `VALIDATION_ERROR` (400): Données invalides
- `NOT_FOUND` (404): Ressource introuvable
- `FILE_TOO_LARGE` (413): Fichier trop volumineux
- `UNSUPPORTED_FORMAT` (415): Format de fichier non supporté
- `TRAINING_ERROR` (500): Erreur lors de l'entraînement
- `DATABASE_ERROR` (500): Erreur base de données

**Error Handling Strategy**
```python
@app.errorhandler(Exception)
def handle_error(error):
    if isinstance(error, ValidationError):
        return jsonify({"error": {...}}), 400
    elif isinstance(error, NotFound):
        return jsonify({"error": {...}}), 404
    else:
        logger.error(f"Unexpected error: {str(error)}")
        return jsonify({"error": {"code": "INTERNAL_ERROR", "message": "Une erreur est survenue"}}), 500
```

### Frontend Error Handling

**Toast Notifications**
- Succès: Confirmation des actions
- Erreur: Messages d'erreur clairs
- Warning: Avertissements (ex: entraînement long)
- Info: Informations contextuelles

**Error Boundaries**
- Composant ErrorBoundary pour capturer les erreurs React
- Fallback UI avec option de retry
- Logging des erreurs côté client

## Testing Strategy

### Backend Testing

**Unit Tests**
- Tests des services (dataset_service, ml_service)
- Tests des utilitaires (ml_algorithms, file_handler)
- Tests des modèles SQLAlchemy
- Mocking de la base de données avec SQLite in-memory

**Integration Tests**
- Tests des endpoints API avec Flask test client
- Tests du flow complet upload → configuration → training
- Tests avec une vraie base de données MySQL de test

**ML Tests**
- Tests des algorithmes avec des datasets synthétiques
- Validation des scores (doivent être dans des ranges attendus)
- Tests de performance (temps d'entraînement)

### Frontend Testing

**Component Tests**
- Tests unitaires des composants avec Jest + React Testing Library
- Tests des interactions utilisateur
- Tests des états du wizard

**Integration Tests**
- Tests du flow complet du wizard
- Tests des appels API avec MSW (Mock Service Worker)

**E2E Tests (Optionnel)**
- Tests Playwright du parcours utilisateur complet
- Tests de bout en bout upload → training → résultat

### Test Data

**Sample Datasets**
- `iris.csv`: Classification multi-classe (150 rows, 5 columns)
- `housing.csv`: Régression (500 rows, 10 columns)
- `titanic.csv`: Classification binaire (891 rows, 12 columns)

## Security Considerations

### Backend Security

**File Upload Security**
- Validation de l'extension (.csv uniquement)
- Limite de taille (configurable, défaut: 50MB)
- Scan du contenu pour détecter les injections CSV
- Génération de noms de fichiers uniques (UUID)
- Stockage hors du webroot

**Input Validation**
- Marshmallow schemas pour tous les endpoints
- Validation des types de données
- Sanitization des inputs utilisateur
- Protection contre les injections SQL (via SQLAlchemy ORM)

**CORS Configuration**
```python
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000"],  # Frontend URL
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type"]
    }
})
```

**Rate Limiting**
- Limitation des uploads (ex: 10 par heure par IP)
- Limitation des entraînements (ex: 5 par heure)

### Frontend Security

**XSS Prevention**
- React échappe automatiquement les données
- Validation des inputs côté client
- Sanitization des données affichées

**CSRF Protection**
- Tokens CSRF pour les mutations (si authentification ajoutée)

## Performance Optimization

### Backend Performance

**Database Optimization**
- Index sur les colonnes fréquemment requêtées
- Pagination pour les listes de modèles
- Eager loading des relations avec SQLAlchemy

**ML Performance**
- Utilisation de joblib pour la parallélisation
- Cache des datasets chargés en mémoire (LRU cache)
- Entraînement asynchrone pour les gros datasets (Celery optionnel)

**File Handling**
- Streaming des fichiers CSV volumineux
- Chunked reading avec pandas

### Frontend Performance

**Next.js Optimizations**
- Server-side rendering pour le dashboard
- Static generation pour les pages statiques
- Image optimization automatique
- Code splitting automatique

**React Optimizations**
- Lazy loading des composants du wizard
- Memoization avec useMemo/useCallback
- Virtual scrolling pour les grandes listes

**API Optimization**
- Caching des statistiques (SWR ou React Query)
- Debouncing des recherches
- Optimistic updates

## Deployment Considerations

### Backend Deployment

**Environment Variables**
```
DATABASE_URL=mysql://user:pass@host:3306/mlplatform
UPLOAD_FOLDER=/var/uploads
MAX_UPLOAD_SIZE=52428800
SECRET_KEY=...
FLASK_ENV=production
```

**Production Setup**
- Gunicorn comme WSGI server
- Nginx comme reverse proxy
- Supervisor pour la gestion des processus
- Logging vers fichiers rotatifs

### Frontend Deployment

**Build Configuration**
```javascript
// next.config.js
module.exports = {
  env: {
    API_BASE_URL: process.env.API_BASE_URL
  },
  output: 'standalone'
}
```

**Deployment Options**
- Vercel (recommandé pour Next.js)
- Docker container
- Static export si pas de SSR nécessaire

### Database Setup

**MySQL Configuration**
- InnoDB engine pour les transactions
- UTF8MB4 charset
- Backups automatiques quotidiens
- Réplication master-slave (optionnel)

## Design Decisions & Rationales

### Next.js vs React

**Choix: Next.js**
- Routing intégré et optimisé
- SSR pour de meilleures performances initiales
- Optimisations automatiques (images, fonts, code splitting)
- Meilleure expérience développeur
- Écosystème mature et bien documenté

### SQLAlchemy ORM

**Rationale**
- Abstraction de la base de données
- Protection contre les injections SQL
- Migrations faciles avec Alembic
- Relations et lazy loading
- Support de multiples SGBD

### Marshmallow pour Validation

**Rationale**
- Validation déclarative et claire
- Sérialisation/désérialisation automatique
- Intégration native avec Flask
- Messages d'erreur personnalisables

### Joblib pour Sauvegarde Modèles

**Rationale**
- Format optimisé pour scikit-learn
- Compression automatique
- Sérialisation rapide
- Standard de l'industrie ML

### JSON pour Colonnes

**Rationale**
- Flexibilité pour stocker des listes de colonnes
- Pas besoin de tables de jointure
- Requêtes JSON supportées par MySQL 8+
- Simplicité de l'implémentation
