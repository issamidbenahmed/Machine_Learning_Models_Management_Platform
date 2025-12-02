"""Utilitaires pour les algorithmes ML"""
import time
import numpy as np
import pandas as pd
import logging
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.neighbors import KNeighborsClassifier, KNeighborsRegressor
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.svm import SVC, SVR
from sklearn.metrics import accuracy_score, r2_score, mean_squared_error, mean_absolute_error
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.impute import SimpleImputer

logger = logging.getLogger(__name__)


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
            'type': 'both'
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
            'type': 'both'
        }
    }
    
    @staticmethod
    def preprocess_data(X_train, X_test, y_train, y_test):
        """Prétraite les données: encode les catégories, gère les valeurs manquantes et normalise"""
        try:
            # Convertir en DataFrame pour faciliter le traitement
            X_train_df = pd.DataFrame(X_train) if not isinstance(X_train, pd.DataFrame) else X_train.copy()
            X_test_df = pd.DataFrame(X_test) if not isinstance(X_test, pd.DataFrame) else X_test.copy()
            
            # Identifier les colonnes catégorielles (object/string)
            categorical_columns = X_train_df.select_dtypes(include=['object']).columns.tolist()
            
            if categorical_columns:
                logger.info(f"Colonnes catégorielles détectées: {categorical_columns}")
                
                # Encoder les colonnes catégorielles
                label_encoders = {}
                for col in categorical_columns:
                    le = LabelEncoder()
                    # Fit sur train
                    X_train_df[col] = le.fit_transform(X_train_df[col].astype(str))
                    # Transform sur test (gérer les nouvelles catégories)
                    X_test_df[col] = X_test_df[col].astype(str).map(
                        lambda x: le.transform([x])[0] if x in le.classes_ else -1
                    )
                    label_encoders[col] = le
                    logger.info(f"Colonne '{col}' encodée: {len(le.classes_)} catégories")
            
            # Convertir en numpy array
            X_train_encoded = X_train_df.values.astype(float)
            X_test_encoded = X_test_df.values.astype(float)
            
            # Gérer les valeurs manquantes
            imputer = SimpleImputer(strategy='mean')
            X_train_imputed = imputer.fit_transform(X_train_encoded)
            X_test_imputed = imputer.transform(X_test_encoded)
            
            # Normaliser les données
            scaler = StandardScaler()
            X_train_scaled = scaler.fit_transform(X_train_imputed)
            X_test_scaled = scaler.transform(X_test_imputed)
            
            logger.info(f"Données prétraitées: {X_train_scaled.shape[0]} samples d'entraînement, {X_test_scaled.shape[0]} samples de test")
            logger.info(f"Features après encodage: {X_train_scaled.shape[1]}")
            
            return X_train_scaled, X_test_scaled, y_train, y_test, scaler, imputer
        except Exception as e:
            logger.error(f"Erreur lors du prétraitement: {str(e)}", exc_info=True)
            # Retourner les données originales en cas d'erreur
            return X_train, X_test, y_train, y_test, None, None
    
    @staticmethod
    def detect_problem_type(y_data):
        """Détecte si c'est un problème de classification ou régression"""
        unique_values = np.unique(y_data)
        
        logger.info(f"Détection du type de problème: {len(unique_values)} valeurs uniques, dtype: {y_data.dtype}")
        
        # Si le type est numérique et qu'il y a beaucoup de valeurs uniques, c'est de la régression
        if np.issubdtype(y_data.dtype, np.number):
            if len(unique_values) > 20:
                logger.info("Type détecté: REGRESSION")
                return 'regression'
            else:
                logger.info("Type détecté: CLASSIFICATION")
                return 'classification'
        else:
            logger.info("Type détecté: CLASSIFICATION (non-numérique)")
            return 'classification'
    
    @staticmethod
    def get_appropriate_algorithms(problem_type):
        """Retourne les algorithmes appropriés selon le type de problème"""
        appropriate = []
        for algo_key, algo_info in MLAlgorithms.ALGORITHMS.items():
            if algo_info['type'] == problem_type or algo_info['type'] == 'both':
                appropriate.append(algo_key)
        return appropriate
    
    @staticmethod
    def train_linear_regression(X_train, X_test, y_train, y_test):
        """Entraîne un modèle de régression linéaire"""
        model = LinearRegression()
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        
        r2 = r2_score(y_test, y_pred)
        mse = mean_squared_error(y_test, y_pred)
        mae = mean_absolute_error(y_test, y_pred)
        
        metrics = {
            'r2': r2,
            'mse': mse,
            'mae': mae,
            'rmse': np.sqrt(mse)
        }
        return model, r2, metrics
    
    @staticmethod
    def train_logistic_regression(X_train, X_test, y_train, y_test):
        """Entraîne un modèle de régression logistique"""
        model = LogisticRegression(max_iter=1000, random_state=42)
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        
        accuracy = accuracy_score(y_test, y_pred)
        metrics = {
            'accuracy': accuracy
        }
        return model, accuracy, metrics
    
    @staticmethod
    def train_knn(X_train, X_test, y_train, y_test, problem_type):
        """Entraîne un modèle KNN"""
        if problem_type == 'classification':
            model = KNeighborsClassifier(n_neighbors=5)
            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)
            score = accuracy_score(y_test, y_pred)
            metrics = {'accuracy': score}
        else:
            model = KNeighborsRegressor(n_neighbors=5)
            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)
            score = r2_score(y_test, y_pred)
            mse = mean_squared_error(y_test, y_pred)
            metrics = {'r2': score, 'mse': mse, 'rmse': np.sqrt(mse), 'mae': mean_absolute_error(y_test, y_pred)}
        return model, score, metrics
    
    @staticmethod
    def train_decision_tree(X_train, X_test, y_train, y_test, problem_type):
        """Entraîne un arbre de décision"""
        if problem_type == 'classification':
            model = DecisionTreeClassifier(random_state=42)
            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)
            score = accuracy_score(y_test, y_pred)
            metrics = {'accuracy': score}
        else:
            model = DecisionTreeRegressor(random_state=42)
            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)
            score = r2_score(y_test, y_pred)
            mse = mean_squared_error(y_test, y_pred)
            metrics = {'r2': score, 'mse': mse, 'rmse': np.sqrt(mse), 'mae': mean_absolute_error(y_test, y_pred)}
        return model, score, metrics
    
    @staticmethod
    def train_random_forest(X_train, X_test, y_train, y_test, problem_type):
        """Entraîne un Random Forest"""
        if problem_type == 'classification':
            model = RandomForestClassifier(n_estimators=100, random_state=42)
            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)
            score = accuracy_score(y_test, y_pred)
            metrics = {'accuracy': score}
        else:
            model = RandomForestRegressor(n_estimators=100, random_state=42)
            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)
            score = r2_score(y_test, y_pred)
            mse = mean_squared_error(y_test, y_pred)
            metrics = {'r2': score, 'mse': mse, 'rmse': np.sqrt(mse), 'mae': mean_absolute_error(y_test, y_pred)}
        return model, score, metrics
    
    @staticmethod
    def train_svm(X_train, X_test, y_train, y_test, problem_type):
        """Entraîne un SVM"""
        if problem_type == 'classification':
            model = SVC(random_state=42)
            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)
            score = accuracy_score(y_test, y_pred)
            metrics = {'accuracy': score}
        else:
            model = SVR()
            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)
            score = r2_score(y_test, y_pred)
            mse = mean_squared_error(y_test, y_pred)
            metrics = {'r2': score, 'mse': mse, 'rmse': np.sqrt(mse), 'mae': mean_absolute_error(y_test, y_pred)}
        return model, score, metrics
    
    @staticmethod
    def train_and_evaluate(algorithm, X_train, X_test, y_train, y_test, problem_type):
        """Entraîne un algorithme et retourne le score"""
        start_time = time.time()
        
        try:
            logger.info(f"Entraînement de {algorithm} pour {problem_type}")
            logger.info(f"Forme des données: X_train={X_train.shape}, X_test={X_test.shape}")
            
            # Prétraiter les données
            X_train_processed, X_test_processed, y_train_processed, y_test_processed, scaler, imputer = \
                MLAlgorithms.preprocess_data(X_train, X_test, y_train, y_test)
            
            if algorithm == 'linear_regression':
                model, score, metrics = MLAlgorithms.train_linear_regression(
                    X_train_processed, X_test_processed, y_train_processed, y_test_processed
                )
            elif algorithm == 'logistic_regression':
                model, score, metrics = MLAlgorithms.train_logistic_regression(
                    X_train_processed, X_test_processed, y_train_processed, y_test_processed
                )
            elif algorithm == 'knn':
                model, score, metrics = MLAlgorithms.train_knn(
                    X_train_processed, X_test_processed, y_train_processed, y_test_processed, problem_type
                )
            elif algorithm == 'decision_tree':
                model, score, metrics = MLAlgorithms.train_decision_tree(
                    X_train_processed, X_test_processed, y_train_processed, y_test_processed, problem_type
                )
            elif algorithm == 'random_forest':
                model, score, metrics = MLAlgorithms.train_random_forest(
                    X_train_processed, X_test_processed, y_train_processed, y_test_processed, problem_type
                )
            elif algorithm == 'svm':
                model, score, metrics = MLAlgorithms.train_svm(
                    X_train_processed, X_test_processed, y_train_processed, y_test_processed, problem_type
                )
            else:
                raise ValueError(f"Algorithme inconnu: {algorithm}")
            
            training_time = time.time() - start_time
            
            # Afficher le score brut (même s'il est négatif)
            logger.info(f"{algorithm}: score brut = {score}, temps = {training_time:.2f}s")
            
            # Pour la régression, afficher un avertissement si le score est négatif
            if problem_type == 'regression' and score < 0:
                logger.warning(f"{algorithm}: Score R² négatif ({score:.4f}) - le modèle performe moins bien qu'une simple moyenne")
                # Garder le score négatif mais l'afficher clairement
                display_score = score
            else:
                # Pour la classification ou scores positifs, garder tel quel
                display_score = max(0, score)  # Éviter les scores négatifs en classification
            
            return {
                'algorithm': algorithm,
                'name': MLAlgorithms.ALGORITHMS[algorithm]['name'],
                'description': MLAlgorithms.ALGORITHMS[algorithm]['description'],
                'score': round(display_score, 4),
                'metrics': {k: round(v, 4) for k, v in metrics.items()},
                'training_time': round(training_time, 2),
                'model_instance': model,
                'scaler': scaler,
                'imputer': imputer
            }
        except Exception as e:
            logger.error(f"Erreur lors de l'entraînement de {algorithm}: {str(e)}", exc_info=True)
            return {
                'algorithm': algorithm,
                'name': MLAlgorithms.ALGORITHMS[algorithm]['name'],
                'description': MLAlgorithms.ALGORITHMS[algorithm]['description'],
                'score': 0.0,
                'training_time': 0.0,
                'error': str(e),
                'model_instance': None
            }
