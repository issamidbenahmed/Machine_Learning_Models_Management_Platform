# Implementation Plan - API Export & Monitoring

- [ ] 1. Create database models and migrations
  - [x] 1.1 Create ExportedAPI model








    - Create `backend/models/exported_api.py`
    - Define table schema with all fields
    - Add relationship with MLModel
    - Add to_dict method for serialization
    - _Requirements: 1.2, 1.3_
  
  - [x] 1.2 Create APIRequest model

    - Create `backend/models/api_request.py`
    - Define table schema for logging requests
    - Add relationship with ExportedAPI
    - Add to_dict method
    - _Requirements: 2.5, 4.1_
  
  - [x] 1.3 Create APIMetrics model


    - Create `backend/models/api_metrics.py`
    - Define table schema for aggregated metrics
    - Add relationship with ExportedAPI
    - _Requirements: 4.1, 5.1_
  
  - [x] 1.4 Create database migration script


    - Create migration script to add new tables
    - Add indexes for performance
    - Test migration on SQLite
    - _Requirements: 1.2_

- [ ] 2. Implement API export funct
ionality
  - [x] 2.1 Create APIExportService


    - Create `backend/services/api_export_service.py`
    - Implement export_model method
    - Implement generate_api_key method (secure random)
    - Implement validate_api_key method
    - Implement deactivate_api method
    - Implement regenerate_api_key method
    - _Requirements: 1.2, 1.3, 6.1, 6.3_
  
  - [x] 2.2 Create API export routes


    - Create `backend/routes/api_export.py` blueprint
    - POST /api/export/{model_id} - Export model
    - GET /api/exports - List all exported APIs
    - GET /api/exports/{api_id} - Get API details
    - PUT /api/exports/{api_id}/status - Update status
    - POST /api/exports/{api_id}/regenerate-key - Regenerate key
    - DELETE /api/exports/{api_id} - Delete API
    - _Requirements: 1.2, 1.3, 6.1, 6.3, 6.4_
  
  - [x] 2.3 Register export routes in app


    - Import and register api_export blueprint in app.py
    - _Requirements: 1.2_

- [ ] 3. Implement prediction API
  - [x] 3.1 Create PredictionService


    - Create `backend/services/prediction_service.py`
    - Implement predict method with model loading
    - Implement input validation
    - Implement data preprocessing
    - Implement request logging
    - Add resource monitoring (CPU, memory)
    - _Requirements: 2.1, 2.3, 2.4, 2.5_
  
  - [x] 3.2 Create API authentication middleware


    - Create `backend/middleware/api_auth.py`
    - Implement require_api_key decorator
    - Validate API key from headers
    - Check API status (active/inactive)
    - Return appropriate error responses
    - _Requirements: 2.2, 6.2_
  
  - [x] 3.3 Create prediction routes


    - Create `backend/routes/prediction.py` blueprint
    - POST /api/predict/{api_id} - Make prediction
    - Apply api_auth middleware
    - Handle errors gracefully
    - Return predictions in JSON format
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [x] 3.4 Register prediction routes in app



    - Import and register prediction blueprint
    - Configure CORS for public access
    - _Requirements: 2.1_



- [ ] 4. Implement monitoring service
  - [ ] 4.1 Create MonitoringService
    - Create `backend/services/monitoring_service.py`
    - Implement get_api_stats method
    - Implement get_all_apis_summary method
    - Implement aggregate_metrics method (for cron)
    - Implement get_resource_usage method


    - Calculate success rate, avg response time, etc.
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 5.2_
  
  - [ ] 4.2 Create monitoring routes
    - Create `backend/routes/monitoring.py` blueprint
    - GET /api/monitoring/apis - List with stats


    - GET /api/monitoring/apis/{api_id}/stats - Detailed stats
    - GET /api/monitoring/apis/{api_id}/requests - Request history
    - GET /api/monitoring/apis/{api_id}/metrics - Aggregated metrics
    - _Requirements: 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [ ] 4.3 Register monitoring routes in app
    - Import and register monitoring blueprint
    - _Requirements: 3.1_

- [ ] 5. Create frontend types and API client
  - [x] 5.1 Add TypeScript types


    - Update `frontend/src/lib/types.ts`
    - Add ExportedAPI interface
    - Add APIRequest interface
    - Add APIStats interface
    - Add APIMetrics interface
    - _Requirements: 1.4, 3.2, 4.1_
  
  - [x] 5.2 Extend API client


    - Update `frontend/src/lib/api.ts`
    - Add exportModel method
    - Add getExportedAPIs method
    - Add getAPIDetails method
    - Add getAPIStats method
    - Add getAPIRequests method
    - Add updateAPIStatus method
    - Add regenerateAPIKey method
    - Add deleteAPI method
    - _Requirements: 1.4, 3.2, 4.1, 6.1, 6.3, 6.4_

- [ ] 6. Create export UI components
  - [x] 6.1 Add export button to Step4Result



    - Update `frontend/src/components/wizard/Step4Result.tsx`
    - Add "Exporter sous forme API" button
    - Handle export click
    - Show loading state during export
    - Open modal on success
    - _Requirements: 1.1_
  
  - [x] 6.2 Create ExportAPIModal component


    - Create `frontend/src/components/monitoring/ExportAPIModal.tsx`


    - Display API URL with copy button
    - Display API key with copy button (masked)
    - Show usage instructions
    - Link to documentation
    - Add animations with Framer Motion
    - _Requirements: 1.4, 1.5_



- [ ] 7. Create monitoring dashboard
  - [ ] 7.1 Create monitoring page
    - Create `frontend/src/app/monitoring/page.tsx`
    - Fetch list of exported APIs
    - Display global statistics
    - Show APIList component
    - Add filters and search


    - Add refresh button
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [ ] 7.2 Create APIList component
    - Create `frontend/src/components/monitoring/APIList.tsx`
    - Display cards for each API
    - Show status indicator (active/inactive)
    - Show quick stats (requests, response time)
    - Add action buttons (view, deactivate, delete)


    - Add stagger animations
    - _Requirements: 3.2, 3.3, 3.4_
  
  - [ ] 7.3 Create APIStatsCard component
    - Create `frontend/src/components/monitoring/APIStatsCard.tsx`
    - Display total requests
    - Display requests last 24h
    - Display avg response time


    - Display success rate
    - Display CPU/Memory usage
    - Use gradient backgrounds
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3_

- [ ] 8. Create API details page
  - [x] 8.1 Create API details page


    - Create `frontend/src/app/monitoring/[id]/page.tsx`
    - Fetch API details and stats
    - Display API information
    - Show detailed statistics
    - Display RequestsChart component
    - Display APIDocumentation component
    - Add management actions
    - _Requirements: 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ] 8.2 Create RequestsChart component
    - Create `frontend/src/components/monitoring/RequestsChart.tsx`
    - Use Recharts library for charts
    - Display line chart of requests over time
    - Add period filters (24h, 7d, 30d)
    - Show response time chart
    - Add animations
    - _Requirements: 4.5_
  
  - [ ] 8.3 Create APIDocumentation component
    - Create `frontend/src/components/monitoring/APIDocumentation.tsx`
    - Display endpoint URL
    - Display API key (masked with reveal button)
    - Show curl example with copy button
    - Show Python example with copy button
    - List input features with types
    - Show example response
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 9. Implement API management features
  - [ ] 9.1 Add activate/deactivate functionality
    - Add toggle switch in API details
    - Call updateAPIStatus API
    - Show confirmation dialog
    - Update UI on success


    - Show toast notification
    - _Requirements: 6.1, 6.2_
  
  - [ ] 9.2 Add regenerate API key functionality
    - Add "Regenerate Key" button
    - Show warning dialog
    - Call regenerateAPIKey API
    - Display new key in modal
    - Update UI
    - _Requirements: 6.3_
  
  - [ ] 9.3 Add delete API functionality
    - Add "Delete" button with danger styling
    - Show confirmation dialog with model name
    - Call deleteAPI API
    - Redirect to monitoring dashboard
    - Show success toast
    - _Requirements: 6.4, 6.5_

- [ ] 10. Add navigation and polish
  - [ ] 10.1 Add monitoring link to navigation
    - Update `frontend/src/app/layout.tsx`
    - Add "Monitoring" link in header
    - Add icon (Activity or BarChart)
    - Highlight active route
    - _Requirements: 3.1_
  
  - [ ] 10.2 Add loading states and error handling
    - Add skeleton loaders for monitoring page
    - Handle API errors gracefully
    - Show error messages with retry button
    - Add empty states for no APIs
    - _Requirements: 3.1, 3.2_
  
  - [ ] 10.3 Add responsive design
    - Ensure monitoring dashboard works on mobile
    - Make charts responsive
    - Test on different screen sizes
    - _Requirements: 3.1, 3.2_

- [ ] 11. Testing and optimization
  - [ ] 11.1 Test API export flow
    - Export a model
    - Verify API key generation
    - Test prediction endpoint with curl
    - Verify request logging
    - Check monitoring dashboard updates
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [ ] 11.2 Test monitoring features
    - Verify all statistics are accurate
    - Test charts with different time ranges
    - Verify resource metrics
    - Test filters and search
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ] 11.3 Test management features
    - Test activate/deactivate
    - Test API key regeneration
    - Test API deletion
    - Verify confirmations work
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [ ] 11.4 Performance optimization
    - Add model caching
    - Add database indexes
    - Optimize queries
    - Test with multiple concurrent requests
    - _Requirements: 2.1, 4.1_
  
  - [ ] 11.5 Security testing
    - Test with invalid API keys
    - Test with inactive APIs
    - Test input validation
    - Test rate limiting (if implemented)
    - _Requirements: 2.2, 2.3, 6.2_
