# Requirements Document

## Introduction

Cette fonctionnalité permet aux utilisateurs de supprimer des modèles ML directement depuis le dashboard. Un bouton de suppression sera ajouté à côté du bouton de visualisation dans la liste des modèles, offrant une gestion complète du cycle de vie des modèles.

## Glossary

- **Dashboard**: La page principale de l'application affichant les statistiques et la liste des modèles ML
- **ModelList Component**: Le composant React qui affiche la liste des modèles ML avec leurs actions
- **ML Model**: Un modèle de machine learning créé par l'utilisateur avec ses métadonnées (nom, algorithme, score, etc.)
- **Backend API**: Le serveur Flask qui gère les opérations CRUD sur les modèles
- **Database**: La base de données (MySQL ou SQLite) qui stocke les modèles ML
- **Model Files**: Les fichiers physiques du modèle entraîné stockés sur le système de fichiers

## Requirements

### Requirement 1

**User Story:** En tant qu'utilisateur, je veux supprimer un modèle ML depuis le dashboard, afin de nettoyer les modèles obsolètes ou non désirés

#### Acceptance Criteria

1. WHEN the user views the dashboard, THE ModelList Component SHALL display a delete icon button next to each model's view button
2. WHEN the user clicks the delete icon, THE ModelList Component SHALL display a confirmation dialog before deletion
3. IF the user confirms deletion, THEN THE Backend API SHALL remove the model record from the Database
4. WHEN the model is successfully deleted, THE Dashboard SHALL refresh the model list and update the statistics
5. IF the deletion fails, THEN THE Dashboard SHALL display an error message to the user

### Requirement 2

**User Story:** En tant qu'utilisateur, je veux une confirmation avant de supprimer un modèle, afin d'éviter les suppressions accidentelles

#### Acceptance Criteria

1. WHEN the user clicks the delete button, THE ModelList Component SHALL display a modal dialog with the model name
2. THE confirmation dialog SHALL include a clear warning message about the irreversible nature of the action
3. THE confirmation dialog SHALL provide two buttons: "Annuler" and "Supprimer"
4. WHEN the user clicks "Annuler", THE ModelList Component SHALL close the dialog without deleting the model
5. WHEN the user clicks "Supprimer", THE ModelList Component SHALL proceed with the deletion request

### Requirement 3

**User Story:** En tant qu'utilisateur, je veux que les fichiers du modèle soient également supprimés, afin de libérer l'espace disque

#### Acceptance Criteria

1. WHEN a model is deleted, THE Backend API SHALL identify the associated Model Files path
2. IF Model Files exist on the filesystem, THEN THE Backend API SHALL delete the physical files
3. THE Backend API SHALL delete the model record from the Database after file deletion
4. IF file deletion fails, THEN THE Backend API SHALL log the error but continue with database deletion
5. THE Backend API SHALL return a success response when the model record is removed from the Database

### Requirement 4

**User Story:** En tant qu'utilisateur, je veux voir un feedback visuel pendant la suppression, afin de savoir que l'action est en cours

#### Acceptance Criteria

1. WHEN the user confirms deletion, THE delete button SHALL display a loading spinner
2. WHILE the deletion is in progress, THE delete button SHALL be disabled
3. WHEN the deletion completes successfully, THE ModelList Component SHALL show a success notification
4. IF the deletion fails, THEN THE ModelList Component SHALL show an error notification with the error message
5. THE ModelList Component SHALL re-enable the delete button after the operation completes
