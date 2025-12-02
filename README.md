# ML Platform - Plateforme de Machine Learning

Plateforme full-stack moderne pour créer, entraîner, déployer et monitorer des modèles de Machine Learning via une interface web intuitive.

## 🎯 Fonctionnalités

- **Wizard guidé en 4 étapes** pour créer des modèles ML
- **Test automatique** de 6+ algorithmes (Régression et Classification)
- **Export en API REST** sécurisée avec clé API
- **Dashboard de monitoring** avec métriques temps réel (CPU, RAM, requêtes)
- **Documentation API automatique** (curl, Python, JavaScript)
- **Interface moderne** et responsive

## 🏗️ Stack Technique

**Backend**: Flask • SQLAlchemy • SQLite • Scikit-learn • psutil  
**Frontend**: Next.js 14 • TypeScript • Tailwind CSS • Framer Motion • Recharts

## 📦 Installation

### Prérequis
- Python 3.10+
- Node.js 18+

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
python run.py                  # Démarre sur http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev                    # Démarre sur http://localhost:3000
```

## 🚀 Utilisation

### Créer un modèle
1. Accéder à http://localhost:3000
2. Uploader un dataset CSV
3. Sélectionner les features et la variable cible
4. Tester les algorithmes automatiquement
5. Entraîner le modèle optimal

### Exporter en API
1. Cliquer sur "Exporter en API" après l'entraînement
2. Copier la clé API et l'URL
3. Faire des prédictions via l'API

**Exemple curl:**
```bash
curl -X POST http://localhost:5000/api/predict/{api_id} \
  -H "X-API-Key: votre_cle_api" \
  -H "Content-Type: application/json" \
  -d '{"feature1": 5.1, "feature2": 3.5}'
```

### Monitoring
Accéder à `/monitoring` pour voir:
- Statistiques des APIs (requêtes, temps de réponse, taux de succès)
- Métriques système (CPU, RAM)
- Graphiques de performance
- Historique des requêtes

## 📊 Algorithmes Supportés

**Régression**: Linear, Ridge, Lasso, Random Forest, Gradient Boosting  
**Classification**: Logistic, Decision Tree, Random Forest, SVM, KNN, Naive Bayes, MLP

## 📁 Structure

```
ml-platform/
├── backend/
│   ├── models/          # SQLAlchemy models
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic
│   ├── middleware/      # API authentication
│   └── saved_models/    # Trained models (.pkl)
├── frontend/
│   └── src/
│       ├── app/         # Next.js pages
│       ├── components/  # React components
│       └── lib/         # API client & types
└── test_data/           # Sample datasets
```

## 🔌 API Endpoints

**Datasets**: `POST /datasets/upload`, `GET /datasets`, `DELETE /datasets/<id>`  
**Models**: `POST /models`, `POST /models/<id>/train`, `GET /models`, `DELETE /models/<id>`  
**Export**: `POST /api/export/<model_id>`, `PATCH /api/export/<id>/toggle`  
**Prediction**: `POST /api/predict/<api_id>` (nécessite X-API-Key)  
**Monitoring**: `GET /api/monitoring/apis`, `GET /api/monitoring/apis/<id>/stats`

## 🔒 Sécurité

- Authentification par clé API (X-API-Key header)
- Validation des fichiers CSV
- Protection contre les injections
- Limite de taille des uploads (50MB)
- APIs activables/désactivables

## 🧪 Datasets d'exemple

Disponibles dans `test_data/`:
- `iris.csv` - Classification (3 classes)
- `housing.csv` - Régression (prix)
- `titanic.csv` - Classification binaire
- `Loan_approval_data_2025.csv` - Classification


---

**Développé par**: ID BEN AHMED Aissam  

