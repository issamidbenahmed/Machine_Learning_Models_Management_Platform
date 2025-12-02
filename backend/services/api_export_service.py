"""Service pour l'export de modèles en API"""
import secrets
import logging
from extensions import db
from models.exported_api import ExportedAPI
from models.ml_model import MLModel

logger = logging.getLogger(__name__)


class APIExportService:
    """Service pour gérer l'export de modèles ML en APIs"""
    
    @staticmethod
    def export_model(model_id):
        """
        Exporte un modèle ML comme API REST
        
        Args:
            model_id: ID du modèle à exporter
            
        Returns:
            dict: Informations de l'API exportée (URL, clé, etc.)
        """
        # Vérifier que le modèle existe et est entraîné
        model = MLModel.query.get(model_id)
        if not model:
            raise ValueError(f"Modèle {model_id} introuvable")
        
        if model.status != 'trained':
            raise ValueError(f"Le modèle doit être entraîné avant d'être exporté (statut actuel: {model.status})")
        
        # Vérifier si le modèle n'est pas déjà exporté
        existing_api = ExportedAPI.query.filter_by(model_id=model_id).first()
        if existing_api:
            raise ValueError(f"Ce modèle est déjà exporté (API ID: {existing_api.id})")
        
        # Générer une clé API unique
        api_key = APIExportService.generate_api_key()
        
        # Créer l'endpoint unique basé sur le nom du modèle
        api_endpoint = APIExportService.generate_endpoint(model.name, model_id)
        
        # Créer l'enregistrement dans la base
        exported_api = ExportedAPI(
            model_id=model_id,
            api_key=api_key,
            api_endpoint=api_endpoint,
            status='active'
        )
        
        db.session.add(exported_api)
        db.session.commit()
        
        logger.info(f"Modèle {model_id} exporté avec succès (API ID: {exported_api.id})")
        
        return {
            'id': exported_api.id,
            'model_id': model_id,
            'model_name': model.name,
            'api_key': api_key,
            'api_endpoint': api_endpoint,
            'api_url': f"/api/predict/{exported_api.id}",
            'status': 'active',
            'total_requests': 0,
            'created_at': exported_api.created_at.isoformat()
        }
    
    @staticmethod
    def generate_api_key():
        """
        Génère une clé API unique et sécurisée
        
        Returns:
            str: Clé API de 64 caractères
        """
        return secrets.token_urlsafe(48)  # Génère ~64 caractères
    
    @staticmethod
    def generate_endpoint(model_name, model_id):
        """
        Génère un endpoint unique basé sur le nom du modèle
        
        Args:
            model_name: Nom du modèle
            model_id: ID du modèle
            
        Returns:
            str: Endpoint unique
        """
        # Nettoyer le nom du modèle (enlever espaces et caractères spéciaux)
        clean_name = model_name.lower().replace(' ', '-').replace('_', '-')
        # Garder seulement les caractères alphanumériques et tirets
        clean_name = ''.join(c for c in clean_name if c.isalnum() or c == '-')
        
        return f"{clean_name}-{model_id}"
    
    @staticmethod
    def validate_api_key(api_key):
        """
        Valide une clé API
        
        Args:
            api_key: Clé API à valider
            
        Returns:
            ExportedAPI: L'API correspondante si valide, None sinon
        """
        if not api_key:
            return None
        
        api = ExportedAPI.query.filter_by(api_key=api_key).first()
        return api
    
    @staticmethod
    def deactivate_api(api_id):
        """
        Désactive une API
        
        Args:
            api_id: ID de l'API à désactiver
        """
        api = ExportedAPI.query.get(api_id)
        if not api:
            raise ValueError(f"API {api_id} introuvable")
        
        api.status = 'inactive'
        db.session.commit()
        
        logger.info(f"API {api_id} désactivée")
        return api.to_dict()
    
    @staticmethod
    def activate_api(api_id):
        """
        Active une API
        
        Args:
            api_id: ID de l'API à activer
        """
        api = ExportedAPI.query.get(api_id)
        if not api:
            raise ValueError(f"API {api_id} introuvable")
        
        api.status = 'active'
        db.session.commit()
        
        logger.info(f"API {api_id} activée")
        return api.to_dict()
    
    @staticmethod
    def regenerate_api_key(api_id):
        """
        Régénère la clé API
        
        Args:
            api_id: ID de l'API
            
        Returns:
            dict: Nouvelle clé API
        """
        api = ExportedAPI.query.get(api_id)
        if not api:
            raise ValueError(f"API {api_id} introuvable")
        
        # Générer nouvelle clé
        new_key = APIExportService.generate_api_key()
        api.api_key = new_key
        db.session.commit()
        
        logger.info(f"Clé API régénérée pour l'API {api_id}")
        
        return {
            'api_key': new_key,
            'api_id': api_id
        }
    
    @staticmethod
    def delete_api(api_id):
        """
        Supprime une API exportée
        
        Args:
            api_id: ID de l'API à supprimer
        """
        api = ExportedAPI.query.get(api_id)
        if not api:
            raise ValueError(f"API {api_id} introuvable")
        
        db.session.delete(api)
        db.session.commit()
        
        logger.info(f"API {api_id} supprimée")
        return True
    
    @staticmethod
    def get_all_apis():
        """
        Récupère toutes les APIs exportées
        
        Returns:
            list: Liste des APIs
        """
        apis = ExportedAPI.query.order_by(ExportedAPI.created_at.desc()).all()
        return [api.to_dict() for api in apis]
    
    @staticmethod
    def get_api_details(api_id):
        """
        Récupère les détails d'une API
        
        Args:
            api_id: ID de l'API
            
        Returns:
            dict: Détails de l'API
        """
        api = ExportedAPI.query.get(api_id)
        if not api:
            raise ValueError(f"API {api_id} introuvable")
        
        return api.to_dict()
