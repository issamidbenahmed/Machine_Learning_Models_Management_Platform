# Requirements Document

## Introduction

Cette plateforme permet aux utilisateurs de créer, tester, entraîner et gérer des modèles de Machine Learning via une interface web moderne. Le système comprend un backend Flask avec MySQL pour la gestion des données et des modèles, et un frontend React/Next.js pour l'interface utilisateur. Les utilisateurs peuvent uploader des datasets CSV, sélectionner des features, tester automatiquement plusieurs algorithmes ML, et entraîner le modèle optimal.

## Glossary

- **ML Platform**: Le système complet de gestion de modèles Machine Learning
- **Dataset**: Un fichier CSV contenant des données pour l'entraînement de modèles
- **ML Model**: Un modèle de Machine Learning créé, configuré et entraîné dans la plateforme
- **Algorithm**: Un algorithme de Machine Learning (ex: KNN, Random Forest, SVM)
- **Input Features**: Les colonnes du dataset utilisées comme variables d'entrée
- **Output Features**: Les colonnes du dataset utilisées comme variables cibles
- **Training Score**: La métrique de précision calculée après l'entraînement d'un modèle
- **Wizard**: Interface multi-étapes guidant l'utilisateur dans la création d'un modèle
- **Backend API**: L'API Flask exposant les endpoints REST
- **Frontend Client**: L'application React/Next.js consommant l'API

## Requirements

### Requirement 1

**User Story:** En tant qu'utilisateur, je veux voir un dashboard avec des statistiques globales, afin de comprendre rapidement l'état de ma plateforme ML

#### Acceptance Criteria

1. WHEN l'utilisateur accède à la page d'accueil, THE Frontend Client SHALL afficher cinq cartes statistiques contenant le nombre total de modèles ML, le nombre de modèles entraînés, le nombre d'utilisations, le nombre de datasets uploadés, et la précision moyenne globale
2. WHEN une carte statistique est affichée, THE Frontend Client SHALL présenter une icône, une valeur numérique, et un label descriptif dans un style moderne type SaaS
3. WHEN l'utilisateur consulte le dashboard, THE Backend API SHALL calculer et retourner les statistiques en temps réel depuis la base de données MySQL
4. WHEN les statistiques sont demandées, THE Backend API SHALL retourner les données au format JSON avec un temps de réponse inférieur à 500ms

### Requirement 2

**User Story:** En tant qu'utilisateur, je veux voir la liste de mes modèles ML créés, afin de pouvoir les consulter et les gérer facilement

#### Acceptance Criteria

1. WHEN l'utilisateur accède au dashboard, THE Frontend Client SHALL afficher une liste des modèles ML avec le nom, la description, l'algorithme, le score de précision, et la date de création
2. WHEN un modèle est affiché dans la liste, THE Frontend Client SHALL fournir un bouton "Voir" ou "Gérer" pour accéder aux détails
3. WHEN l'utilisateur clique sur le bouton "Créer un modèle", THE Frontend Client SHALL ouvrir le wizard de création multi-étapes
4. WHEN la liste des modèles est demandée, THE Backend API SHALL retourner tous les modèles depuis la table ml_models avec leurs informations complètes

### Requirement 3

**User Story:** En tant qu'utilisateur, je veux uploader un dataset CSV via drag & drop, afin de préparer mes données pour l'entraînement d'un modèle

#### Acceptance Criteria

1. WHEN l'utilisateur est à l'étape 1 du wizard, THE Frontend Client SHALL afficher un formulaire avec les champs nom, description, et une zone de drag & drop pour l'upload de fichier CSV
2. WHEN l'utilisateur dépose un fichier CSV, THE Frontend Client SHALL envoyer le fichier au Backend API via l'endpoint POST /datasets/upload
3. WHEN le Backend API reçoit un fichier CSV, THE Backend API SHALL valider le format, analyser les colonnes, créer un enregistrement dans la table datasets, et sauvegarder le fichier sur le système de fichiers
4. WHEN l'upload est réussi, THE Backend API SHALL retourner l'ID du dataset, la liste des colonnes, et un aperçu des 10 premières lignes au format JSON
5. IF le fichier uploadé dépasse la taille limite configurée, THEN THE Backend API SHALL rejeter l'upload avec un message d'erreur HTTP 413

### Requirement 4

**User Story:** En tant qu'utilisateur, je veux sélectionner les colonnes d'input et d'output de mon dataset, afin de définir les features pour mon modèle ML

#### Acceptance Criteria

1. WHEN l'utilisateur accède à l'étape 2 du wizard, THE Frontend Client SHALL afficher automatiquement la liste des colonnes du dataset avec un aperçu des 10 premières lignes
2. WHEN les colonnes sont affichées, THE Frontend Client SHALL fournir des checkboxes pour sélectionner les inputs et des radio buttons ou checkboxes pour sélectionner les outputs
3. WHEN l'utilisateur clique sur "Suivant", THE Frontend Client SHALL envoyer la sélection au Backend API via l'endpoint POST /models/<id>/select-io
4. WHEN le Backend API reçoit la sélection, THE Backend API SHALL valider que au moins une colonne input et une colonne output sont sélectionnées, puis sauvegarder la configuration au format JSON dans la table ml_models
5. IF aucune colonne input ou output n'est sélectionnée, THEN THE Backend API SHALL retourner une erreur de validation HTTP 400

### Requirement 5

**User Story:** En tant qu'utilisateur, je veux tester automatiquement plusieurs algorithmes ML, afin de choisir le meilleur pour mon cas d'usage

#### Acceptance Criteria

1. WHEN l'utilisateur accède à l'étape 3 du wizard, THE Frontend Client SHALL appeler l'endpoint POST /models/<id>/test-algorithms du Backend API
2. WHEN le Backend API reçoit la requête de test, THE Backend API SHALL entraîner automatiquement les algorithmes Linear Regression, Logistic Regression, KNN, Decision Tree, Random Forest, et SVM avec un split train/test
3. WHEN chaque algorithme est testé, THE Backend API SHALL calculer le score de précision et retourner une liste triée par score décroissant au format JSON
4. WHEN les résultats sont reçus, THE Frontend Client SHALL afficher pour chaque algorithme une carte cliquable contenant le nom, une mini description, et le score de précision calculé
5. WHEN l'entraînement des algorithmes prend plus de 30 secondes, THE Backend API SHALL logger un avertissement dans les logs système

### Requirement 6

**User Story:** En tant qu'utilisateur, je veux entraîner et sauvegarder le modèle final avec l'algorithme choisi, afin de pouvoir l'utiliser pour des prédictions

#### Acceptance Criteria

1. WHEN l'utilisateur sélectionne un algorithme et clique sur "Sauvegarder et entraîner", THE Frontend Client SHALL envoyer la requête au Backend API via l'endpoint POST /models/<id>/train
2. WHEN le Backend API reçoit la requête d'entraînement, THE Backend API SHALL entraîner le modèle complet avec l'algorithme sélectionné sur l'ensemble du dataset
3. WHEN l'entraînement est terminé, THE Backend API SHALL sauvegarder le modèle entraîné dans le répertoire saved_models/ au format .pkl en utilisant joblib
4. WHEN le modèle est sauvegardé, THE Backend API SHALL mettre à jour la table ml_models avec l'algorithme, le score, et le chemin du fichier modèle
5. WHEN l'entraînement est réussi, THE Backend API SHALL retourner un JSON contenant le status "success", le score final, et le chemin du modèle

### Requirement 7

**User Story:** En tant qu'utilisateur, je veux voir une page de résultat après l'entraînement, afin de confirmer la création réussie de mon modèle

#### Acceptance Criteria

1. WHEN l'entraînement du modèle est terminé, THE Frontend Client SHALL afficher une page de résultat avec les informations de création, l'algorithme choisi, et le score final
2. WHEN la page de résultat est affichée, THE Frontend Client SHALL présenter une animation de training et un message de succès
3. WHEN l'utilisateur consulte les résultats, THE Frontend Client SHALL fournir un bouton pour retourner au dashboard ou voir les détails du modèle

### Requirement 8

**User Story:** En tant que développeur backend, je veux une architecture modulaire et scalable, afin de maintenir et étendre facilement la plateforme

#### Acceptance Criteria

1. THE Backend API SHALL être structuré avec des modules séparés pour models, routes, services, et utils
2. THE Backend API SHALL utiliser SQLAlchemy comme ORM pour toutes les interactions avec la base de données MySQL
3. THE Backend API SHALL utiliser Marshmallow pour la validation et la sérialisation des schémas de données
4. THE Backend API SHALL implémenter des services dédiés dataset_service et ml_service pour encapsuler la logique métier
5. THE Backend API SHALL créer un module ml_algorithms contenant des fonctions propres pour chaque algorithme ML supporté

### Requirement 9

**User Story:** En tant qu'administrateur système, je veux que la plateforme soit sécurisée et robuste, afin de protéger les données et assurer la stabilité

#### Acceptance Criteria

1. THE Backend API SHALL activer CORS via Flask-CORS pour permettre les requêtes cross-origin depuis le Frontend Client
2. WHEN une requête API est reçue, THE Backend API SHALL valider tous les inputs utilisateur avec Marshmallow avant traitement
3. WHEN une erreur survient, THE Backend API SHALL retourner une réponse JSON structurée avec un code HTTP approprié et un message d'erreur descriptif
4. THE Backend API SHALL logger toutes les opérations critiques incluant les entraînements, les erreurs de base de données, et les uploads de fichiers
5. THE Backend API SHALL limiter la taille maximale des fichiers uploadés à une valeur configurable pour prévenir les attaques par déni de service

### Requirement 10

**User Story:** En tant qu'utilisateur, je veux une interface moderne et responsive, afin d'utiliser la plateforme confortablement sur différents appareils

#### Acceptance Criteria

1. THE Frontend Client SHALL utiliser un design moderne et minimaliste inspiré de Vercel, Supabase, et Notion
2. THE Frontend Client SHALL être construit avec des composants modulaires et réutilisables
3. THE Frontend Client SHALL être entièrement responsive et s'adapter aux écrans desktop, tablette, et mobile
4. THE Frontend Client SHALL utiliser des icônes Material UI ou Lucide pour améliorer l'expérience visuelle
5. WHEN l'utilisateur navigue dans le wizard, THE Frontend Client SHALL fournir une expérience fluide avec des transitions et animations appropriées

### Requirement 11

**User Story:** En tant que développeur, je veux des endpoints API RESTful bien définis, afin d'intégrer facilement le frontend avec le backend

#### Acceptance Criteria

1. THE Backend API SHALL exposer l'endpoint GET /datasets/<id> pour récupérer les détails d'un dataset spécifique
2. THE Backend API SHALL exposer l'endpoint POST /models/create pour créer un nouveau modèle ML avec nom, description, et dataset_id
3. THE Backend API SHALL exposer l'endpoint GET /models pour lister tous les modèles ML avec pagination optionnelle
4. THE Backend API SHALL exposer l'endpoint GET /models/<id> pour récupérer les détails complets d'un modèle spécifique
5. WHEN un endpoint est appelé avec un ID invalide, THEN THE Backend API SHALL retourner une erreur HTTP 404 avec un message explicite

### Requirement 12

**User Story:** En tant qu'utilisateur, je veux que mes données soient persistées de manière fiable, afin de ne pas perdre mes modèles et datasets

#### Acceptance Criteria

1. THE Backend API SHALL créer une table datasets dans MySQL avec les colonnes id, filename, path, columns (JSON), et created_at
2. THE Backend API SHALL créer une table ml_models dans MySQL avec les colonnes id, name, description, dataset_id (FK), inputs (JSON), outputs (JSON), algorithm, score, model_path, et created_at
3. WHEN un dataset est uploadé, THE Backend API SHALL stocker les métadonnées dans la table datasets et le fichier physique dans un répertoire dédié
4. WHEN un modèle est entraîné, THE Backend API SHALL stocker le fichier .pkl dans le répertoire saved_models/ et le chemin dans la table ml_models
5. THE Backend API SHALL utiliser des transactions de base de données pour garantir la cohérence des données lors des opérations critiques
