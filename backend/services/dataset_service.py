"""Service pour la gestion des datasets"""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from extensions import db
from models.dataset import Dataset
from utils.file_handler import FileHandler


class DatasetService:
    """Service pour gérer les datasets"""
    
    @staticmethod
    def upload_dataset(file, upload_folder, max_size):
        """Upload et analyse un fichier CSV"""
        # Valider la taille
        if not FileHandler.validate_csv_size(file, max_size):
            raise ValueError("Le fichier est trop volumineux")
        
        # Sauvegarder le fichier
        file_path, original_filename = FileHandler.save_uploaded_file(file, upload_folder)
        
        # Vérifier les injections CSV
        if not FileHandler.check_csv_injection(file_path):
            os.remove(file_path)
            raise ValueError("Le fichier contient des patterns dangereux")
        
        # Analyser le CSV
        try:
            df = FileHandler.read_csv_file(file_path)
            columns, dtypes = FileHandler.extract_column_info(df)
            preview = FileHandler.get_preview(df, 10)
            row_count = len(df)
            
            # Créer l'enregistrement en base
            dataset = Dataset(
                filename=original_filename,
                path=file_path,
                columns=columns,
                row_count=row_count
            )
            db.session.add(dataset)
            db.session.commit()
            
            return {
                'id': dataset.id,
                'filename': original_filename,
                'columns': columns,
                'preview': preview,
                'row_count': row_count
            }
        except Exception as e:
            # Nettoyer en cas d'erreur
            if os.path.exists(file_path):
                os.remove(file_path)
            raise ValueError(f"Erreur lors de l'analyse du CSV: {str(e)}")
    
    @staticmethod
    def get_dataset(dataset_id):
        """Récupère un dataset par ID"""
        dataset = Dataset.query.get(dataset_id)
        if not dataset:
            raise ValueError(f"Dataset {dataset_id} introuvable")
        return dataset
    
    @staticmethod
    def analyze_csv(file_path):
        """Analyse un CSV et retourne les informations"""
        df = FileHandler.read_csv_file(file_path)
        columns, dtypes = FileHandler.extract_column_info(df)
        preview = FileHandler.get_preview(df, 10)
        row_count = len(df)
        
        return {
            'columns': columns,
            'dtypes': dtypes,
            'preview': preview,
            'row_count': row_count
        }
