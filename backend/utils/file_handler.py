"""Utilitaires pour la gestion des fichiers"""
import os
import uuid
import pandas as pd
from werkzeug.utils import secure_filename


class FileHandler:
    """Classe pour gérer les opérations sur les fichiers"""
    
    @staticmethod
    def allowed_file(filename, allowed_extensions):
        """Vérifie si l'extension du fichier est autorisée"""
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions
    
    @staticmethod
    def generate_unique_filename(original_filename):
        """Génère un nom de fichier unique avec UUID"""
        ext = original_filename.rsplit('.', 1)[1].lower() if '.' in original_filename else ''
        unique_name = f"{uuid.uuid4().hex}.{ext}"
        return unique_name
    
    @staticmethod
    def save_uploaded_file(file, upload_folder):
        """Sauvegarde un fichier uploadé et retourne le chemin"""
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)
        
        original_filename = secure_filename(file.filename)
        unique_filename = FileHandler.generate_unique_filename(original_filename)
        file_path = os.path.join(upload_folder, unique_filename)
        
        file.save(file_path)
        return file_path, original_filename
    
    @staticmethod
    def validate_csv_size(file, max_size):
        """Valide la taille du fichier"""
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        return file_size <= max_size
    
    @staticmethod
    def check_csv_injection(file_path):
        """Vérifie les patterns d'injection CSV"""
        dangerous_patterns = ['=', '+', '-', '@', '\t', '\r']
        
        try:
            df = pd.read_csv(file_path, nrows=10)
            for col in df.columns:
                if any(str(col).startswith(pattern) for pattern in dangerous_patterns):
                    return False
            return True
        except Exception:
            return False
    
    @staticmethod
    def read_csv_file(file_path):
        """Lit un fichier CSV avec pandas - détecte automatiquement le délimiteur"""
        try:
            # Essayer de détecter le délimiteur automatiquement
            with open(file_path, 'r', encoding='utf-8') as f:
                first_line = f.readline()
                # Détecter le délimiteur le plus probable
                if ';' in first_line and first_line.count(';') > first_line.count(','):
                    delimiter = ';'
                elif '\t' in first_line:
                    delimiter = '\t'
                else:
                    delimiter = ','
            
            # Lire le CSV avec le délimiteur détecté
            df = pd.read_csv(file_path, sep=delimiter)
            return df
        except Exception as e:
            raise ValueError(f"Erreur lors de la lecture du CSV: {str(e)}")
    
    @staticmethod
    def extract_column_info(df):
        """Extrait les informations sur les colonnes"""
        columns = df.columns.tolist()
        dtypes = {col: str(dtype) for col, dtype in df.dtypes.items()}
        return columns, dtypes
    
    @staticmethod
    def get_preview(df, num_rows=10):
        """Retourne un aperçu du dataset"""
        preview_df = df.head(num_rows)
        preview = preview_df.values.tolist()
        return preview
