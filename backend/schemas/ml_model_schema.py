"""ML Model schemas pour validation et sérialisation"""
from marshmallow import Schema, fields, validate, validates, ValidationError


VALID_ALGORITHMS = [
    'linear_regression',
    'logistic_regression',
    'knn',
    'decision_tree',
    'random_forest',
    'svm'
]


class MLModelSchema(Schema):
    """Schéma pour la sérialisation des modèles ML"""
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True)
    description = fields.Str(allow_none=True)
    dataset_id = fields.Int(required=True)
    inputs = fields.List(fields.Str())
    outputs = fields.List(fields.Str())
    algorithm = fields.Str()
    score = fields.Float()
    model_path = fields.Str()
    status = fields.Str()
    created_at = fields.DateTime(dump_only=True)
    trained_at = fields.DateTime()


class CreateModelSchema(Schema):
    """Schéma pour la création d'un modèle ML"""
    name = fields.Str(required=True, validate=validate.Length(min=1, max=255))
    description = fields.Str(allow_none=True)
    dataset_id = fields.Int(required=True)


class SelectFeaturesSchema(Schema):
    """Schéma pour la sélection des features input/output"""
    inputs = fields.List(fields.Str(), required=True, validate=validate.Length(min=1))
    outputs = fields.List(fields.Str(), required=True, validate=validate.Length(min=1))
    
    @validates('inputs')
    def validate_inputs(self, value):
        if not value or len(value) == 0:
            raise ValidationError('Au moins une colonne input doit être sélectionnée')
    
    @validates('outputs')
    def validate_outputs(self, value):
        if not value or len(value) == 0:
            raise ValidationError('Au moins une colonne output doit être sélectionnée')


class TrainModelSchema(Schema):
    """Schéma pour l'entraînement d'un modèle"""
    algorithm = fields.Str(
        required=True,
        validate=validate.OneOf(VALID_ALGORITHMS)
    )


class AlgorithmResultSchema(Schema):
    """Schéma pour les résultats de test d'algorithmes"""
    algorithm = fields.Str()
    name = fields.Str()
    description = fields.Str()
    score = fields.Float()
    training_time = fields.Float()
