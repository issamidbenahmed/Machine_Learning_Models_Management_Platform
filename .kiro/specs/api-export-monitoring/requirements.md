# Requirements Document - API Export & Monitoring

## Introduction

Cette fonctionnalité permet d'exporter les modèles ML entraînés sous forme d'API REST exploitables, avec un système complet de monitoring pour suivre l'utilisation, les performances et les ressources consommées par chaque API.

## Glossary

- **API Export**: Processus de déploiement d'un modèle ML entraîné comme endpoint API REST
- **API Endpoint**: URL unique permettant d'effectuer des prédictions avec le modèle
- **API Key**: Clé d'authentification unique pour sécuriser l'accès à l'API
- **Prediction Request**: Requête HTTP POST contenant les données pour obtenir une prédiction
- **Monitoring Dashboard**: Interface affichant les statistiques d'utilisation des APIs
- **Usage Metrics**: Métriques d'utilisation (nombre de requêtes, temps de réponse, etc.)
- **Resource Metrics**: Métriques de ressources (CPU, mémoire, etc.)
- **API Status**: État de l'API (active, inactive, erreur)

## Requirements

### Requirement 1

**User Story:** En tant qu'utilisateur, je veux exporter mon modèle entraîné sous forme d'API, afin de pouvoir l'utiliser dans d'autres applications

#### Acceptance Criteria

1. WHEN a model is trained, THE Step4Result Component SHALL display an "Exporter sous forme API" button
2. WHEN the user clicks the export button, THE Backend API SHALL create a unique API endpoint for the model
3. THE Backend API SHALL generate a unique API key for authentication
4. THE Backend API SHALL return the API URL and API key to the user
5. THE Frontend SHALL display the API URL and API key in a modal with copy buttons

### Requirement 2

**User Story:** En tant qu'utilisateur, je veux utiliser l'API exportée pour faire des prédictions, afin d'intégrer le modèle dans mes applications

#### Acceptance Criteria

1. THE API Endpoint SHALL accept POST requests with JSON data containing input features
2. THE API Endpoint SHALL validate the API key in the request headers
3. THE API Endpoint SHALL validate that input features match the model's expected inputs
4. WHEN valid data is provided, THE API Endpoint SHALL return predictions in JSON format
5. THE API Endpoint SHALL log each request for monitoring purposes

### Requirement 3

**User Story:** En tant qu'utilisateur, je veux voir un dashboard de monitoring, afin de suivre l'utilisation de mes APIs exportées

#### Acceptance Criteria

1. THE Application SHALL provide a dedicated monitoring dashboard page
2. THE Monitoring Dashboard SHALL display a list of all exported APIs
3. FOR each API, THE Dashboard SHALL show the API name, model name, status, and creation date
4. THE Dashboard SHALL display usage statistics for each API
5. THE Dashboard SHALL allow filtering and sorting of APIs

### Requirement 4

**User Story:** En tant qu'utilisateur, je veux voir les statistiques d'utilisation de mes APIs, afin de comprendre comment elles sont utilisées

#### Acceptance Criteria

1. THE Monitoring Dashboard SHALL display the total number of requests per API
2. THE Monitoring Dashboard SHALL display the number of requests in the last 24 hours
3. THE Monitoring Dashboard SHALL display the average response time
4. THE Monitoring Dashboard SHALL display the success rate (successful vs failed requests)
5. THE Monitoring Dashboard SHALL display a graph showing request volume over time

### Requirement 5

**User Story:** En tant qu'utilisateur, je veux voir les métriques de ressources de mes APIs, afin de surveiller les performances

#### Acceptance Criteria

1. THE Monitoring Dashboard SHALL display CPU usage percentage for each API
2. THE Monitoring Dashboard SHALL display memory usage in MB
3. THE Monitoring Dashboard SHALL display the last request timestamp
4. THE Monitoring Dashboard SHALL show alerts when resource usage is high
5. THE Monitoring Dashboard SHALL display response time distribution

### Requirement 6

**User Story:** En tant qu'utilisateur, je veux gérer mes APIs exportées, afin de contrôler leur disponibilité

#### Acceptance Criteria

1. THE Monitoring Dashboard SHALL provide an option to activate/deactivate an API
2. WHEN an API is deactivated, THE API Endpoint SHALL return a 403 Forbidden status
3. THE Monitoring Dashboard SHALL provide an option to regenerate the API key
4. THE Monitoring Dashboard SHALL provide an option to delete an exported API
5. THE Monitoring Dashboard SHALL require confirmation before destructive actions

### Requirement 7

**User Story:** En tant qu'utilisateur, je veux voir la documentation de mon API, afin de savoir comment l'utiliser

#### Acceptance Criteria

1. THE Monitoring Dashboard SHALL provide a "View Documentation" button for each API
2. THE Documentation SHALL show the API endpoint URL
3. THE Documentation SHALL show example request with curl and Python
4. THE Documentation SHALL list all required input features with their types
5. THE Documentation SHALL show example response format
