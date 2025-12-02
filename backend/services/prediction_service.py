"""Service pour les prédictions via API"""
import joblib
import json
import time
import psutil
import os
import logging
import numpy as np
import pandas as pd
from datetime import datetime
from extensions import db
from models.exported_api import ExportedAPI
from models.api_request import APIRequest

logger = logging.getLogger(__name__)


class PredictionService:
    """Service pour effectuer des prédictions via les APIs exportées"""
    
    # Cache pour les modèles chargés (évite de recharger à chaque requête)
    _model_cache = {}
    _cache_size = 10
    
    @staticmethod
    def predict(api_id, input_data):
        """
        Effectue une prédiction avec le modèle
        
        Args:
            api_id: ID de l'API
            input_data: Dictionnaire avec les données d'entrée
            
        Returns:
            dict: Résultat de la prédiction
        """
        start_time = time.time()
        process = psutil.Process(os.getpid())
        cpu_before = process.cpu_percent()
        mem_before = process.memory_info().rss / 1024 / 1024  # MB
        
        try:
            # Récupérer l'API
            api = ExportedAPI.query.get(api_id)
            if not api:
                raise ValueError(f"API {api_id} introuvable")
            
            if api.status != 'active':
                raise ValueError(f"API {api_id} est inactive")
            
            # Charger le modèle
            model = PredictionService._load_model(api.model)
            
            # Valider les inputs
            PredictionService._validate_inputs(input_data, api.model.inputs)
            
            # Préparer les données
            X = PredictionService._prepare_data(input_data, api.model.inputs)
            
            # Faire la prédiction
            prediction = model.predict(X)
            
            # Formater le résultat
            result = {
                'prediction': prediction.tolist() if hasattr(prediction, 'tolist') else list(prediction),
                'model_id': api.model_id,
                'model_name': api.model.name,
                'timestamp': datetime.utcnow().isoformat()
            }
            
            # Calculer les métriques
            response_time = time.time() - start_time
            cpu_after = process.cpu_percent()
            mem_after = process.memory_info().rss / 1024 / 1024
            
            # Logger la requête
            PredictionService.log_request(
                api_id=api_id,
                request_data=json.dumps(input_data),
                response_data=json.dumps(result),
                response_time=response_time,
                status_code=200,
                cpu_usage=(cpu_before + cpu_after) / 2,
                memory_usage=(mem_before + mem_after) / 2
            )
            
            # Mettre à jour les stats de l'API
            api.total_requests += 1
            api.last_used_at = datetime.utcnow()
            db.session.commit()
            
            return result
            
        except Exception as e:
            # Logger l'erreur
            response_time = time.time() - start_time
            PredictionService.log_request(
                api_id=api_id,
                request_data=json.dumps(input_data) if input_data else None,
                response_data=None,
                response_time=response_time,
                status_code=500,
                error=str(e)
            )
            raise
    
    @staticmethod
    def _load_model(ml_model):
        """
        Charge le modèle depuis le fichier .pkl
        
        Args:
            ml_model: Instance de MLModel
            
        Returns:
            Le modèle chargé
        """
        model_id = ml_model.id
        
        # Vérifier le cache
        if model_id in PredictionService._model_cache:
            logger.debug(f"Modèle {model_id} chargé depuis le cache")
            return PredictionService._model_cache[model_id]
        
        # Charger depuis le fichier
        if not ml_model.model_path or not os.path.exists(ml_model.model_path):
            raise ValueError(f"Fichier du modèle introuvable: {ml_model.model_path}")
        
        try:
            model = joblib.load(ml_model.model_path)
            
            # Ajouter au cache
            if len(PredictionService._model_cache) >= PredictionService._cache_size:
                # Supprimer le plus ancien
                PredictionService._model_cache.pop(next(iter(PredictionService._model_cache)))
            
            PredictionService._model_cache[model_id] = model
            logger.info(f"Modèle {model_id} chargé et mis en cache")
            
            return model
        except Exception as e:
            logger.error(f"Erreur lors du chargement du modèle {model_id}: {str(e)}")
            raise ValueError(f"Impossible de charger le modèle: {str(e)}")
    
    @staticmethod
    def _validate_inputs(input_data, expected_inputs):
        """
        Valide que les données d'entrée correspondent aux inputs attendus
        
        Args:
            input_data: Dictionnaire des données
            expected_inputs: Liste des colonnes attendues
        """
        if not input_data:
            raise ValueError("Aucune donnée fournie")
        
        if not isinstance(input_data, dict):
            raise ValueError("Les données doivent être un objet JSON")
        
        # Vérifier que toutes les colonnes requises sont présentes
        missing = set(expected_inputs) - set(input_data.keys())
        if missing:
            raise ValueError(f"Colonnes manquantes: {', '.join(missing)}")
        
        # Vérifier qu'il n'y a pas de colonnes en trop
        extra = set(input_data.keys()) - set(expected_inputs)
        if extra:
            logger.warning(f"Colonnes supplémentaires ignorées: {', '.join(extra)}")
    
    @staticmethod
    def _prepare_data(input_data, expected_inputs):
        """
        Prépare les données pour la prédiction
        
        Args:
            input_data: Dictionnaire des données
            expected_inputs: Liste des colonnes dans l'ordre
            
        Returns:
            numpy array: Données préparées
        """
        # Créer un DataFrame avec les colonnes dans le bon ordre
        df = pd.DataFrame([input_data])
        df = df[expected_inputs]  # Réordonner selon l'ordre attendu
        
        return df.values
    
    @staticmethod
    def log_request(api_id, request_data, response_data, response_time, status_code, cpu_usage=None, memory_usage=None, error=None):
        """
        Log une requête API
        
        Args:
            api_id: ID de l'API
            request_data: Données de la requête (JSON string)
            response_data: Données de la réponse (JSON string)
            response_time: Temps de réponse en secondes
            status_code: Code HTTP
            cpu_usage: Usage CPU en %
            memory_usage: Usage mémoire en MB
            error: Message d'erreur si applicable
        """
        try:
            api_request = APIRequest(
                api_id=api_id,
                request_data=request_data,
                response_data=response_data,
                response_time=response_time,
                status_code=status_code,
                cpu_usage=cpu_usage,
                memory_usage=memory_usage,
                error_message=error
            )
            
            db.session.add(api_request)
            db.session.commit()
            
            logger.debug(f"Requête loggée pour API {api_id}")
        except Exception as e:
            logger.error(f"Erreur lors du logging de la requête: {str(e)}")
            # Ne pas propager l'erreur pour ne pas bloquer la prédiction
