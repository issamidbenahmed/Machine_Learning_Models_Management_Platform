# Design Document - Model Deletion Feature

## Overview

Cette fonctionnalité ajoute la capacité de supprimer des modèles ML depuis le dashboard. Elle comprend:
- Un bouton de suppression avec icône dans l'interface utilisateur
- Une boîte de dialogue de confirmation
- Un endpoint API backend pour gérer la suppression
- La suppression des fichiers physiques du modèle et de l'enregistrement en base de données
- Des notifications de feedback utilisateur

## Architecture

### Frontend Architecture

```
Dashboard (page.tsx)
    ↓
ModelList Component
    ↓
[Delete Button] → [Confirmation Dialog] → API Call → Refresh Data
```

### Backend Architecture

```
DELETE /models/:id
    ↓
ml_models.py (route)
    ↓
MLService.delete_model()
    ↓
[Delete Physical Files] → [Delete DB Record] → Return Success
```

## Components and Interfaces

### 1. Frontend Components

#### ModelList Component Enhancement

**Location:** `frontend/src/components/dashboard/ModelList.tsx`

**Changes:**
- Ajouter un bouton de suppression avec icône `Trash2` de lucide-react
- Ajouter un état local pour gérer la boîte de dialogue de confirmation
- Ajouter un état de chargement pour chaque modèle pendant la suppression
- Implémenter la logique de confirmation et d'appel API

**Props:**
```typescript
interface ModelListProps {
  models: MLModel[];
  onViewModel: (id: number) => void;
  onDeleteModel: (id: number) => Promise<void>; // Nouvelle prop
}
```

**State:**
```typescript
const [deletingModelId, setDeletingModelId] = useState<number | null>(null);
const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
```

#### Confirmation Dialog Component

**Location:** `frontend/src/components/ui/ConfirmDialog.tsx` (nouveau composant)

**Props:**
```typescript
interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning';
}
```

**Features:**
- Modal overlay avec backdrop
- Boutons d'action stylisés selon le variant
- Fermeture avec ESC ou clic sur backdrop
- Accessible (ARIA labels)

#### Dashboard Page Enhancement

**Location:** `frontend/src/app/page.tsx`

**Changes:**
- Ajouter la fonction `handleDeleteModel` qui:
  - Appelle l'API de suppression
  - Affiche une notification de succès/erreur
  - Recharge les données (modèles et statistiques)
- Passer la fonction comme prop à ModelList

### 2. API Client Enhancement

**Location:** `frontend/src/lib/api.ts`

**New Method:**
```typescript
async deleteModel(id: number): Promise<void> {
  await this.client.delete(`/models/${id}`);
}
```

### 3. Backend Components

#### Route Handler

**Location:** `backend/routes/ml_models.py`

**New Route:**
```python
@ml_models_bp.route('/<int:model_id>', methods=['DELETE'])
def delete_model(model_id):
    """Supprime un modèle ML"""
    try:
        MLService.delete_model(model_id)
        return jsonify({'message': 'Modèle supprimé avec succès'}), 200
    except ValueError as e:
        return jsonify({'error': {'code': 'NOT_FOUND', 'message': str(e)}}), 404
    except Exception as e:
        current_app.logger.error(f"Erreur delete model: {str(e)}")
        return jsonify({'error': {'code': 'INTERNAL_ERROR', 'message': 'Erreur lors de la suppression'}}), 500
```

#### Service Layer

**Location:** `backend/services/ml_service.py`

**New Method:**
```python
@staticmethod
def delete_model(model_id):
    """Supprime un modèle ML et ses fichiers associés"""
    ml_model = MLModel.query.get(model_id)
    if not ml_model:
        raise ValueError(f"Modèle {model_id} introuvable")
    
    # Supprimer le fichier physique si existe
    if ml_model.model_path and os.path.exists(ml_model.model_path):
        try:
            os.remove(ml_model.model_path)
        except Exception as e:
            # Logger l'erreur mais continuer
            current_app.logger.warning(f"Impossible de supprimer le fichier {ml_model.model_path}: {str(e)}")
    
    # Supprimer l'enregistrement en base
    db.session.delete(ml_model)
    db.session.commit()
    
    return True
```

## Data Models

Aucune modification des modèles de données n'est nécessaire. Les modèles existants sont suffisants:

- `MLModel`: Contient déjà le champ `model_path` pour localiser les fichiers
- `Dataset`: Non affecté par la suppression de modèle

## Error Handling

### Frontend Error Scenarios

1. **Modèle introuvable (404)**
   - Message: "Le modèle n'existe plus"
   - Action: Rafraîchir la liste automatiquement

2. **Erreur serveur (500)**
   - Message: "Erreur lors de la suppression du modèle"
   - Action: Permettre de réessayer

3. **Erreur réseau**
   - Message: "Impossible de contacter le serveur"
   - Action: Permettre de réessayer

### Backend Error Scenarios

1. **Modèle introuvable**
   - Code: `NOT_FOUND`
   - Status: 404
   - Message: "Modèle {id} introuvable"

2. **Erreur de suppression de fichier**
   - Action: Logger l'erreur, continuer avec la suppression DB
   - Raison: Le fichier peut déjà être supprimé manuellement

3. **Erreur base de données**
   - Code: `INTERNAL_ERROR`
   - Status: 500
   - Message: "Erreur lors de la suppression"
   - Action: Rollback automatique de la transaction

## UI/UX Design

### Button Layout

```
[Model Card]
  Model Name
  Description
  [Algorithm Badge] [Score] [Status] [Date]
  
  [View Button] [Delete Button]
```

### Delete Button Styling

- Icône: `Trash2` de lucide-react
- Couleur: Rouge (danger)
- Taille: Small
- Variant: Outline avec bordure rouge
- Hover: Fond rouge léger
- Loading: Spinner remplace l'icône

### Confirmation Dialog

```
┌─────────────────────────────────────┐
│  Supprimer le modèle ?              │
│                                     │
│  Êtes-vous sûr de vouloir          │
│  supprimer le modèle "Model Name"? │
│                                     │
│  Cette action est irréversible.    │
│                                     │
│  [Annuler]  [Supprimer]            │
└─────────────────────────────────────┘
```

### Notifications

- **Succès**: Toast vert en haut à droite, 3 secondes
  - "Modèle supprimé avec succès"
  
- **Erreur**: Toast rouge en haut à droite, 5 secondes
  - Message d'erreur spécifique du serveur

## Testing Strategy

### Frontend Tests

1. **Component Tests (ModelList)**
   - Affichage du bouton de suppression
   - Ouverture de la boîte de dialogue au clic
   - Annulation de la suppression
   - Confirmation de la suppression
   - État de chargement pendant la suppression

2. **Component Tests (ConfirmDialog)**
   - Affichage/masquage selon `isOpen`
   - Appel de `onConfirm` au clic sur confirmer
   - Appel de `onCancel` au clic sur annuler
   - Fermeture avec ESC

3. **Integration Tests**
   - Suppression réussie met à jour la liste
   - Suppression réussie met à jour les statistiques
   - Erreur affiche une notification

### Backend Tests

1. **Unit Tests (MLService.delete_model)**
   - Suppression réussie d'un modèle avec fichier
   - Suppression réussie d'un modèle sans fichier
   - Erreur si modèle introuvable
   - Gestion d'erreur si fichier non supprimable

2. **Integration Tests (Route)**
   - DELETE /models/:id retourne 200 pour succès
   - DELETE /models/:id retourne 404 si introuvable
   - DELETE /models/:id retourne 500 en cas d'erreur serveur

3. **Database Tests**
   - Vérifier que le modèle est supprimé de la DB
   - Vérifier que les autres modèles ne sont pas affectés

## Security Considerations

1. **Authorization**: Pour l'instant, pas d'authentification. À ajouter dans une future version.

2. **Validation**: Valider que `model_id` est un entier positif

3. **SQL Injection**: Utiliser SQLAlchemy ORM (déjà en place)

4. **Path Traversal**: Utiliser uniquement `model_path` de la DB, pas de paramètres utilisateur

## Performance Considerations

1. **Suppression de fichier**: Opération synchrone acceptable car rapide

2. **Refresh des données**: Utiliser Promise.all pour charger modèles et stats en parallèle

3. **Optimistic UI**: Ne pas implémenter pour éviter les incohérences en cas d'erreur

## Future Enhancements

1. **Suppression en masse**: Sélectionner plusieurs modèles à supprimer

2. **Soft delete**: Marquer comme supprimé au lieu de supprimer physiquement

3. **Historique**: Garder un log des modèles supprimés

4. **Permissions**: Vérifier que l'utilisateur a le droit de supprimer

5. **Confirmation renforcée**: Demander de taper le nom du modèle pour les modèles entraînés
