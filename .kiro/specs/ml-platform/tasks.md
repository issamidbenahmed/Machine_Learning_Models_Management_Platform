# Implementation Plan

## Backend Implementation

- [ ] 1. Set up backend project structure and core configuration
  - Create the backend directory structure with all required folders (models, routes, services, utils, schemas, saved_models, uploads, migrations)
  - Write config.py with database URL, upload limits, secret key, and environment configurations
  - Write extensions.py to initialize SQLAlchemy, CORS, and Marshmallow
  - Create requirements.txt with all dependencies (Flask, SQLAlchemy, pandas, scikit-learn, joblib, Flask-CORS, marshmallow, mysql-connector-python)
  - _Requirements: 8.1, 8.2, 9.1_

- [ ] 2. Implement database models with SQLAlchemy
  - [ ] 2.1 Create Dataset model
    - Write models/dataset.py with Dataset class containing id, filename, path, columns (JSON), row_count, created_at
    - Define relationship with MLModel
    - _Requirements: 12.1, 3.3_
  
  - [ ] 2.2 Create MLModel model
    - Write models/ml_model.py with MLModel class containing id, name, description, dataset_id (FK), inputs (JSON), outputs (JSON), algorithm, score, model_path, status, created_at, trained_at
    - Define foreign key relationship to Dataset
    - _Requirements: 12.2, 6.4_

- [ ] 3. Create Marshmallow schemas for validation
  - [ ] 3.1 Write dataset schemas
    - Create schemas/dataset_schema.py with DatasetSchema for serialization and UploadDatasetSchema for validation
    - _Requirements: 8.3, 9.2_
  
  - [ ] 3.2 Write ML model schemas
    - Create schemas/ml_model_schema.py with MLModelSchema, CreateModelSchema, SelectFeaturesSchema, and TrainModelSchema
    - Add validation rules (at least one input/output, valid algorithm names)
    - _Requirements: 8.3, 9.2, 4.4_

- [ ] 4. Implement file handling utilities
  - Write utils/file_handler.py with functions to save uploaded files with UUID names, validate CSV format and size, read CSV with pandas, and extract column information
  - Add CSV injection protection by scanning for malicious patterns
  - _Requirements: 3.3, 3.4, 9.5_

- [ ] 5. Implement ML algorithms utility
  - [ ] 5.1 Create algorithm definitions and detection
    - Write utils/ml_algorithms.py with ALGORITHMS dictionary containing metadata for each algorithm
    - Implement detect_problem_type() to determine if it's classification or regression based on target variable
    - Implement get_appropriate_algorithms() to filter algorithms by problem type
    - _Requirements: 5.2, 8.5_
  
  - [ ] 5.2 Implement training functions for each algorithm
    - Write train_linear_regression() using sklearn.linear_model.LinearRegression
    - Write train_logistic_regression() using sklearn.linear_model.LogisticRegression
    - Write train_knn() using sklearn.neighbors.KNeighborsClassifier
    - Write train_decision_tree() using sklearn.tree.DecisionTreeClassifier/Regressor
    - Write train_random_forest() using sklearn.ensemble.RandomForestClassifier/Regressor
    - Write train_svm() using sklearn.svm.SVC/SVR
    - _Requirements: 5.2, 8.5_
  
  - [ ] 5.3 Implement train_and_evaluate function
    - Write train_and_evaluate() that takes algorithm name, train/test data, trains the model, calculates score, and returns results with timing
    - Handle both classification (accuracy) and regression (R² score) metrics
    - _Requirements: 5.2, 5.3_

- [ ] 6. Implement dataset service
  - Write services/dataset_service.py with upload_dataset() to handle file upload, save to filesystem, analyze with pandas, and create database record
  - Implement get_dataset() to retrieve dataset by ID
  - Implement analyze_csv() to extract columns, preview (10 rows), row count, and data types
  - _Requirements: 3.3, 3.4, 11.1_

- [ ] 7. Implement ML service
  - [ ] 7.1 Create model management functions
    - Write services/ml_service.py with create_model() to create new MLModel record
    - Implement configure_features() to save inputs/outputs and update model status
    - Implement get_model_stats() to calculate total models, trained models, total datasets, average score, and total uses
    - _Requirements: 11.2, 1.3, 4.4_
  
  - [ ] 7.2 Implement algorithm testing
    - Write test_algorithms() to load dataset, split train/test (80/20), detect problem type, test all appropriate algorithms, and return sorted results by score
    - Add timing measurement for each algorithm
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [ ] 7.3 Implement final model training
    - Write train_final_model() to train selected algorithm on full dataset, save model with joblib to saved_models/, update database with algorithm/score/path, and return training results
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 8. Implement dataset routes
  - Write routes/datasets.py with Blueprint for dataset endpoints
  - Implement POST /datasets/upload endpoint with file validation, upload handling, and response with dataset ID, columns, and preview
  - Implement GET /datasets/<id> endpoint to retrieve dataset details
  - Add error handling for file too large, invalid format, and not found
  - _Requirements: 3.2, 3.5, 11.1_

- [ ] 9. Implement ML model routes
  - [ ] 9.1 Create model CRUD endpoints
    - Write routes/ml_models.py with Blueprint for model endpoints
    - Implement POST /models/create endpoint with validation and model creation
    - Implement GET /models endpoint to list all models with optional pagination
    - Implement GET /models/<id> endpoint to retrieve model details
    - Implement GET /models/stats endpoint to return dashboard statistics
    - _Requirements: 11.2, 11.3, 11.4, 11.5, 1.3_
  
  - [ ] 9.2 Create model configuration and training endpoints
    - Implement POST /models/<id>/select-io endpoint to configure input/output features
    - Implement POST /models/<id>/test-algorithms endpoint to test all algorithms and return sorted results
    - Implement POST /models/<id>/train endpoint to train final model with selected algorithm
    - Add validation and error handling for each endpoint
    - _Requirements: 4.3, 4.4, 5.1, 6.1_

- [ ] 10. Create Flask application entry point
  - Write app.py to initialize Flask app, register blueprints, configure CORS, set up error handlers, configure logging, and create database tables
  - Add global error handler for ValidationError, NotFound, and generic exceptions
  - Configure upload folder and max file size
  - _Requirements: 8.1, 9.1, 9.3, 9.4_

- [ ] 11. Create database initialization script
  - Write a script to create MySQL database, run migrations, and optionally seed with sample data
  - _Requirements: 12.1, 12.2_

## Frontend Implementation

- [ ] 12. Set up Next.js project structure
  - Initialize Next.js 13+ project with TypeScript and Tailwind CSS
  - Create directory structure (app, components, lib, styles)
  - Install dependencies (axios, lucide-react, react-hook-form, date-fns)
  - Configure next.config.js with API base URL environment variable
  - _Requirements: 10.1, 10.2_

- [ ] 13. Create API client and TypeScript types
  - [ ] 13.1 Define TypeScript interfaces
    - Write lib/types.ts with interfaces for Dataset, MLModel, AlgorithmResult, Stats, CreateModelData, TrainingResult
    - _Requirements: 11.1, 11.2_
  
  - [ ] 13.2 Implement API client
    - Write lib/api.ts with APIClient class containing methods for all backend endpoints
    - Configure axios with base URL and error interceptors
    - Implement uploadDataset, getDataset, createModel, selectFeatures, testAlgorithms, trainModel, getModels, getModel, getStats
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [ ] 14. Create reusable UI components
  - [ ] 14.1 Create base UI components
    - Write components/ui/Button.tsx with variants (primary, secondary, outline) and sizes
    - Write components/ui/Card.tsx for card container with modern styling
    - Write components/ui/Input.tsx for form inputs
    - Write components/ui/Spinner.tsx for loading states
    - _Requirements: 10.1, 10.3_
  
  - [ ] 14.2 Create FileUpload component
    - Write components/ui/FileUpload.tsx with drag & drop functionality, file validation, and preview
    - Add visual feedback for drag over state
    - _Requirements: 3.1, 10.5_

- [ ] 15. Implement dashboard components
  - [ ] 15.1 Create StatCard component
    - Write components/dashboard/StatCard.tsx to display icon, value, and label in modern card style
    - Add optional trend indicator
    - _Requirements: 1.1, 1.2, 10.1_
  
  - [ ] 15.2 Create ModelList component
    - Write components/dashboard/ModelList.tsx to display models in a table or grid with name, description, algorithm, score, date, and action buttons
    - Add empty state when no models exist
    - _Requirements: 2.1, 2.2_

- [ ] 16. Create dashboard page
  - Write app/page.tsx to fetch and display statistics using StatCard components
  - Display ModelList component with all models
  - Add "Créer un modèle" CTA button that navigates to wizard
  - Implement loading and error states
  - _Requirements: 1.1, 2.1, 2.3_

- [ ] 17. Implement wizard layout and navigation
  - Write components/wizard/WizardLayout.tsx with step indicator, navigation buttons, and state management
  - Implement step validation before allowing navigation
  - Add progress bar showing current step
  - _Requirements: 10.5_

- [ ] 18. Create wizard Step 1 - Model Information
  - Write components/wizard/Step1Info.tsx with form for name and description
  - Integrate FileUpload component for CSV upload
  - Handle file upload and store dataset ID in wizard state
  - Add form validation (required fields, file format)
  - _Requirements: 3.1, 3.2_

- [ ] 19. Create wizard Step 2 - Feature Selection
  - Write components/wizard/Step2Features.tsx to display dataset columns and preview
  - Implement checkboxes for input selection and radio/checkboxes for output selection
  - Display first 10 rows of dataset in a table
  - Add validation to ensure at least one input and one output are selected
  - Call selectFeatures API on next button click
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 20. Create wizard Step 3 - Algorithm Selection
  - Write components/wizard/Step3Algorithm.tsx to call testAlgorithms API and display results
  - Show loading spinner during algorithm testing
  - Display algorithm cards with name, description, and score
  - Implement card selection (radio button style)
  - Add visual ranking indicator (best, good, average)
  - _Requirements: 5.1, 5.4_

- [ ] 21. Create wizard Step 4 - Training Result
  - Write components/wizard/Step4Result.tsx to call train API and display results
  - Show training animation/spinner during model training
  - Display success message with model info, chosen algorithm, and final score
  - Add buttons to return to dashboard or view model details
  - _Requirements: 6.5, 7.1, 7.2, 7.3_

- [ ] 22. Create wizard page with all steps
  - Write app/models/create/page.tsx to integrate WizardLayout with all step components
  - Implement wizard state management (current step, form data)
  - Handle navigation between steps
  - Add error handling and user feedback
  - _Requirements: 3.1, 4.1, 5.1, 7.1_

- [ ] 23. Create model details page
  - Write app/models/[id]/page.tsx to display full model information
  - Show dataset details, selected features, algorithm, score, and training date
  - Add option to download model or view predictions (future feature)
  - _Requirements: 2.2, 11.4_

- [ ] 24. Add global layout and styling
  - Write app/layout.tsx with navigation header, footer, and global providers
  - Configure Tailwind CSS with custom theme (colors, fonts) matching modern SaaS design
  - Add global styles in styles/globals.css
  - Implement responsive design breakpoints
  - _Requirements: 10.1, 10.3, 10.4_

- [ ] 25. Add error handling and toast notifications
  - Implement toast notification system for success/error/warning messages
  - Add ErrorBoundary component for React error catching
  - Create error pages (404, 500)
  - _Requirements: 9.3_

## Integration and Final Setup

- [ ] 26. Create environment configuration files
  - Create backend/.env with DATABASE_URL, UPLOAD_FOLDER, MAX_UPLOAD_SIZE, SECRET_KEY, FLASK_ENV
  - Create frontend/.env.local with NEXT_PUBLIC_API_BASE_URL
  - Add .env.example files for both projects
  - _Requirements: 8.1, 9.1_

- [ ] 27. Write setup and run scripts
  - Create backend/run.py to run Flask development server
  - Add npm scripts in frontend/package.json for dev, build, and start
  - Create README.md with setup instructions for both backend and frontend
  - _Requirements: 8.1_

- [ ] 28. Create sample datasets for testing
  - Add sample CSV files (iris.csv, housing.csv, titanic.csv) to a test_data folder
  - Document the structure and purpose of each dataset
  - _Requirements: 5.2_
