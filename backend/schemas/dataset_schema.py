"""Dataset schemas pour validation et sérialisation"""
from marshmallow import Schema, fields, validate


class DatasetSchema(Schema):
    """Schéma pour la sérialisation des datasets"""
    id = fields.Int(dump_only=True)
    filename = fields.Str(required=True)
    path = fields.Str(required=True)
    columns = fields.List(fields.Str(), required=True)
    row_count = fields.Int()
    created_at = fields.DateTime(dump_only=True)


class UploadDatasetSchema(Schema):
    """Schéma pour la validation de l'upload de dataset"""
    name = fields.Str(required=True, validate=validate.Length(min=1, max=255))
    description = fields.Str(allow_none=True)


class DatasetPreviewSchema(Schema):
    """Schéma pour l'aperçu d'un dataset"""
    id = fields.Int()
    filename = fields.Str()
    columns = fields.List(fields.Str())
    preview = fields.List(fields.List(fields.Raw()))
    row_count = fields.Int()
