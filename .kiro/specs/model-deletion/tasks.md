# Implementation Plan

- [x] 1. Create backend delete endpoint and service method

  - [x] 1.1 Add delete_model method to MLService


    - Implement logic to retrieve model by ID
    - Delete physical model file if it exists
    - Delete model record from database
    - Handle errors gracefully (log file deletion errors but continue)
    - _Requirements: 1.3, 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [x] 1.2 Add DELETE route in ml_models.py


    - Create DELETE endpoint at `/models/<int:model_id>`
    - Call MLService.delete_model with model_id
    - Return success response (200) with message
    - Handle ValueError for not found (404)
    - Handle general exceptions (500)
    - _Requirements: 1.3, 1.5_

- [x] 2. Create confirmation dialog component

  - [x] 2.1 Create ConfirmDialog UI component


    - Create new file `frontend/src/components/ui/ConfirmDialog.tsx`
    - Implement modal with backdrop overlay
    - Add title, message, and action buttons
    - Support danger variant with red styling
    - Add keyboard support (ESC to cancel)
    - Make component accessible with ARIA labels
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 3. Add delete functionality to API client

  - [x] 3.1 Add deleteModel method to APIClient


    - Implement DELETE request to `/models/${id}`
    - Handle response and errors
    - _Requirements: 1.3, 1.4_

- [x] 4. Enhance ModelList component with delete button

  - [x] 4.1 Add delete button UI to ModelList


    - Import Trash2 icon from lucide-react
    - Add delete button next to view button
    - Style button with red outline variant
    - Add state for tracking deleting model ID
    - Add state for confirmation dialog (confirmDeleteId)
    - _Requirements: 1.1, 4.1_
  
  - [x] 4.2 Implement delete confirmation flow

    - Show ConfirmDialog when delete button clicked
    - Pass model name to confirmation dialog
    - Handle cancel action (close dialog)
    - Handle confirm action (call onDeleteModel prop)
    - Show loading spinner on delete button during deletion
    - Disable delete button while deletion in progress
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 4.1, 4.2, 4.5_
  
  - [x] 4.3 Update ModelList props interface

    - Add onDeleteModel prop: `(id: number) => Promise<void>`
    - _Requirements: 1.4_

- [x] 5. Integrate delete functionality in Dashboard page

  - [x] 5.1 Implement handleDeleteModel function


    - Call apiClient.deleteModel with model ID
    - Show success notification on successful deletion
    - Show error notification on failure
    - Reload models and stats after successful deletion
    - Handle network errors appropriately
    - _Requirements: 1.3, 1.4, 1.5, 4.3, 4.4_
  
  - [x] 5.2 Pass handleDeleteModel to ModelList

    - Update ModelList component usage in Dashboard
    - Pass handleDeleteModel as onDeleteModel prop
    - _Requirements: 1.4_

- [x] 6. Add notification system for user feedback


  - [x] 6.1 Create toast notification component


    - Create `frontend/src/components/ui/Toast.tsx`
    - Support success and error variants
    - Auto-dismiss after timeout
    - Position in top-right corner
    - _Requirements: 4.3, 4.4_
  
  - [x] 6.2 Integrate toast notifications in Dashboard

    - Add toast state management
    - Show success toast after deletion
    - Show error toast on failure with error message
    - _Requirements: 4.3, 4.4_
