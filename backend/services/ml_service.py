"""Service pour la gestion des modèles ML"""
import os
import sys
import joblib
import pandas as pd
import logging
from datetime import datetime
from sklearn.model_selection import train_test_split
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from extensions import db
from models.ml_model import MLModel
from models.dataset import Dataset
from utils.ml_algorithms import MLAlgorithms
from utils.file_handler import FileHandler

logger = logging.getLogger(__name__)


class MLService:
    """Service pour gérer les modèles ML"""
    
    @staticmethod
    def create_model(name, description, dataset_id):
        """Crée un nouveau modèle ML"""
        # Vérifier que le dataset existe
        dataset = Dataset.query.get(dataset_id)
        if not dataset:
            raise ValueError(f"Dataset {dataset_id} introuvable")
        
        # Créer le modèle
        ml_model = MLModel(
            name=name,
            description=description,
            dataset_id=dataset_id,
            status='created'
        )
        db.session.add(ml_model)
        db.session.commit()
        
        return ml_model
    
    @staticmethod
    def configure_features(model_id, inputs, outputs):
        """Configure les features input/output"""
        ml_model = MLModel.query.get(model_id)
        if not ml_model:
            raise ValueError(f"Modèle {model_id} introuvable")
        
        # Valider que les colonnes existent dans le dataset
        dataset = ml_model.dataset
        available_columns = dataset.columns
        
        for col in inputs + outputs:
            if col not in available_columns:
                raise ValueError(f"Colonne {col} introuvable dans le dataset")
        
        # Mettre à jour le modèle
        ml_model.inputs = inputs
        ml_model.outputs = outputs
        ml_model.status = 'configured'
        db.session.commit()
        
        return ml_model
    
    @staticmethod
    def test_algorithms(model_id):
        """Teste tous les algorithmes disponibles"""
        ml_model = MLModel.query.get(model_id)
        if not ml_model:
            raise ValueError(f"Modèle {model_id} introuvable")
        
        if not ml_model.inputs or not ml_model.outputs:
            raise ValueError("Les features input/output doivent être configurées")
        
        logger.info(f"Test des algorithmes pour le modèle {model_id}")
        
        # Charger le dataset
        dataset = ml_model.dataset
        df = FileHandler.read_csv_file(dataset.path)
        
        logger.info(f"Dataset chargé: {df.shape[0]} lignes, {df.shape[1]} colonnes")
        logger.info(f"Inputs: {ml_model.inputs}, Outputs: {ml_model.outputs}")
        
        # Préparer les données (garder en DataFrame pour préserver les types)
        X = df[ml_model.inputs]
        y = df[ml_model.outputs[0]].values  # Prendre la première colonne output
        
        logger.info(f"Données préparées: X shape={X.shape}, y shape={y.shape}")
        logger.info(f"Types de colonnes X: {X.dtypes.to_dict()}")
        logger.info(f"Valeurs uniques dans y: {len(pd.Series(y).unique())}")
        logger.info(f"Valeurs manquantes: X={X.isnull().sum().sum()}, y={pd.Series(y).isnull().sum()}")
        
        # Détecter le type de problème
        problem_type = MLAlgorithms.detect_problem_type(y)
        
        # Obtenir les algorithmes appropriés
        appropriate_algos = MLAlgorithms.get_appropriate_algorithms(problem_type)
        logger.info(f"Algorithmes à tester: {appropriate_algos}")
        
        # Split train/test
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Tester chaque algorithme
        results = []
        for algo in appropriate_algos:
            logger.info(f"Test de l'algorithme: {algo}")
            result = MLAlgorithms.train_and_evaluate(
                algo, X_train, X_test, y_train, y_test, problem_type
            )
            # Ne pas inclure l'instance du modèle dans les résultats
            result_dict = {
                'algorithm': result['algorithm'],
                'name': result['name'],
                'description': result['description'],
                'score': result['score'],
                'metrics': result.get('metrics', {}),
                'training_time': result['training_time']
            }
            if 'error' in result:
                result_dict['error'] = result['error']
                logger.error(f"Erreur pour {algo}: {result['error']}")
            else:
                logger.info(f"Résultat pour {algo}: score={result['score']:.4f}")
            results.append(result_dict)
        
        # Trier par score décroissant
        results.sort(key=lambda x: x['score'], reverse=True)
        
        logger.info(f"Test terminé. Meilleur score: {results[0]['score']:.4f} ({results[0]['algorithm']})")
        
        return results
    
    @staticmethod
    def train_final_model(model_id, algorithm, model_folder):
        """Entraîne et sauvegarde le modèle final"""
        ml_model = MLModel.query.get(model_id)
        if not ml_model:
            raise ValueError(f"Modèle {model_id} introuvable")
        
        if not ml_model.inputs or not ml_model.outputs:
            raise ValueError("Les features input/output doivent être configurées")
        
        # Charger le dataset
        dataset = ml_model.dataset
        df = FileHandler.read_csv_file(dataset.path)
        
        # Préparer les données (garder en DataFrame pour préserver les types)
        X = df[ml_model.inputs]
        y = df[ml_model.outputs[0]].values
        
        # Détecter le type de problème
        problem_type = MLAlgorithms.detect_problem_type(y)
        
        # Split pour évaluation
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Entraîner le modèle
        result = MLAlgorithms.train_and_evaluate(
            algorithm, X_train, X_test, y_train, y_test, problem_type
        )
        
        if 'error' in result:
            raise ValueError(f"Erreur lors de l'entraînement: {result['error']}")
        
        # Créer le dossier si nécessaire
        if not os.path.exists(model_folder):
            os.makedirs(model_folder)
        
        # Sauvegarder le modèle
        model_filename = f"model_{model_id}.pkl"
        model_path = os.path.join(model_folder, model_filename)
        joblib.dump(result['model_instance'], model_path)
        
        # Mettre à jour le modèle en base
        ml_model.algorithm = algorithm
        ml_model.score = result['score']
        ml_model.model_path = model_path
        ml_model.status = 'trained'
        ml_model.trained_at = datetime.utcnow()
        db.session.commit()
        
        return {
            'status': 'success',
            'score': result['score'],
            'model_path': model_path,
            'algorithm': algorithm
        }
    
    @staticmethod
    def delete_model(model_id):
        """Supprime un modèle ML et ses fichiers associés"""
        from flask import current_app
        
        ml_model = MLModel.query.get(model_id)
        if not ml_model:
            raise ValueError(f"Modèle {model_id} introuvable")
        
        # Supprimer le fichier physique si existe
        if ml_model.model_path and os.path.exists(ml_model.model_path):
            try:
                os.remove(ml_model.model_path)
                current_app.logger.info(f"Fichier modèle supprimé: {ml_model.model_path}")
            except Exception as e:
                # Logger l'erreur mais continuer
                current_app.logger.warning(f"Impossible de supprimer le fichier {ml_model.model_path}: {str(e)}")
        
        # Supprimer l'enregistrement en base
        db.session.delete(ml_model)
        db.session.commit()
        
        return True
    
    @staticmethod
    def get_model_stats():
        """Calcule les statistiques globales"""
        total_models = MLModel.query.count()
        trained_models = MLModel.query.filter_by(status='trained').count()
        total_datasets = Dataset.query.count()
        
        # Calculer la précision moyenne
        trained_models_list = MLModel.query.filter(
            MLModel.status == 'trained',
            MLModel.score.isnot(None)
        ).all()
        
        if trained_models_list:
            avg_score = sum(m.score for m in trained_models_list) / len(trained_models_list)
        else:
            avg_score = 0.0
        
        # Total uses (pour l'instant, on compte le nombre de modèles entraînés)
        total_uses = trained_models
        
        return {
            'total_models': total_models,
            'trained_models': trained_models,
            'total_datasets': total_datasets,
            'avg_score': round(avg_score, 4),
            'total_uses': total_uses
        }
