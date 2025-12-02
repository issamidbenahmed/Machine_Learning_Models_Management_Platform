'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Input } from '../ui/Input';
import { FileUpload } from '../ui/FileUpload';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { apiClient } from '@/lib/api';

interface Step1Data {
  name: string;
  description: string;
  datasetId: number | null;
  file: File | null;
}

interface Step1InfoProps {
  data: Step1Data;
  onNext: (data: Step1Data) => void;
}

export const Step1Info: React.FC<Step1InfoProps> = ({ data, onNext }) => {
  const [formData, setFormData] = useState<Step1Data>(data);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (file: File) => {
    setFormData({ ...formData, file });
    setErrors({ ...errors, file: '' });
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom du modèle est requis';
    }

    if (!formData.file && !formData.datasetId) {
      newErrors.file = 'Veuillez sélectionner un fichier CSV';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validate()) return;

    try {
      setUploading(true);

      // Upload le fichier si nécessaire
      let datasetId = formData.datasetId;
      if (formData.file && !datasetId) {
        const uploadResult = await apiClient.uploadDataset(formData.file);
        datasetId = uploadResult.id;
      }

      onNext({
        ...formData,
        datasetId,
      });
    } catch (error) {
      setErrors({
        file: error instanceof Error ? error.message : 'Erreur lors de l\'upload',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-semibold text-purple-600">Étape 1</span>
        </div>
        <h2 className="text-3xl font-bold mb-3">
          <span className="gradient-text">Informations du modèle</span>
        </h2>
        <p className="text-gray-600 text-lg">
          Commencez par donner un nom à votre modèle et uploader votre dataset
        </p>
      </div>

      <Input
        label="Nom du modèle"
        placeholder="Ex: Prédiction des ventes"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        error={errors.name}
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description (optionnel)
        </label>
        <textarea
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          rows={3}
          placeholder="Décrivez brièvement votre modèle..."
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Dataset CSV
        </label>
        <FileUpload onFileSelect={handleFileSelect} />
        {errors.file && <p className="mt-2 text-sm text-red-600">{errors.file}</p>}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex justify-end pt-6"
      >
        <Button onClick={handleNext} disabled={uploading} size="lg">
          {uploading ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Upload en cours...
            </>
          ) : (
            'Suivant'
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
};
