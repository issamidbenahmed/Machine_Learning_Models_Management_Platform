'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { apiClient } from '@/lib/api';
import { ChevronLeft, Sparkles, ArrowRight, ArrowLeft as ArrowLeftIcon } from 'lucide-react';

interface Step2Data {
  inputs: string[];
  outputs: string[];
}

interface Step2FeaturesProps {
  datasetId: number;
  modelId: number;
  data: Step2Data;
  onNext: (data: Step2Data) => void;
  onBack: () => void;
}

export const Step2Features: React.FC<Step2FeaturesProps> = ({
  datasetId,
  modelId,
  data,
  onNext,
  onBack,
}) => {
  const [columns, setColumns] = useState<string[]>([]);
  const [preview, setPreview] = useState<any[][]>([]);
  const [selectedInputs, setSelectedInputs] = useState<string[]>(data.inputs);
  const [selectedOutputs, setSelectedOutputs] = useState<string[]>(data.outputs);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDataset();
  }, [datasetId]);

  const loadDataset = async () => {
    try {
      setLoading(true);
      const dataset = await apiClient.getDataset(datasetId);
      setColumns(dataset.columns);
      setPreview(dataset.preview || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleInputToggle = (column: string) => {
    setSelectedInputs((prev) =>
      prev.includes(column)
        ? prev.filter((c) => c !== column)
        : [...prev, column]
    );
  };

  const handleOutputToggle = (column: string) => {
    setSelectedOutputs([column]); // Une seule output pour simplifier
  };

  const validate = (): boolean => {
    if (selectedInputs.length === 0) {
      setError('Veuillez sélectionner au moins une colonne input');
      return false;
    }
    if (selectedOutputs.length === 0) {
      setError('Veuillez sélectionner une colonne output');
      return false;
    }
    setError('');
    return true;
  };

  const handleNext = async () => {
    if (!validate()) return;

    try {
      setSaving(true);
      await apiClient.selectFeatures(modelId, {
        inputs: selectedInputs,
        outputs: selectedOutputs,
      });
      onNext({ inputs: selectedInputs, outputs: selectedOutputs });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

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
          <span className="text-sm font-semibold text-purple-600">Étape 2</span>
        </div>
        <h2 className="text-3xl font-bold mb-3">
          <span className="gradient-text">Sélection des features</span>
        </h2>
        <p className="text-gray-600 text-lg">
          Choisissez les colonnes à utiliser comme inputs et output
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Aperçu du dataset */}
      {preview.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Aperçu du Dataset (10 premières lignes)
          </h3>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {preview.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-50">
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap"
                      >
                        {cell !== null && cell !== undefined ? String(cell) : '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inputs */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
              <ArrowLeftIcon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold gradient-text-blue">
              Colonnes Input
            </h3>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {columns.map((column, index) => (
              <motion.label
                key={column}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="flex items-center space-x-3 p-3 hover:bg-white/50 rounded-lg cursor-pointer transition-all"
              >
                <input
                  type="checkbox"
                  checked={selectedInputs.includes(column)}
                  onChange={() => handleInputToggle(column)}
                  disabled={selectedOutputs.includes(column)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">{column}</span>
              </motion.label>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm font-semibold text-blue-600">
              {selectedInputs.length} colonne(s) sélectionnée(s)
            </p>
          </div>
        </motion.div>

        {/* Outputs */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <ArrowRight className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold gradient-text">
              Colonne Output
            </h3>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {columns.map((column, index) => (
              <motion.label
                key={column}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="flex items-center space-x-3 p-3 hover:bg-white/50 rounded-lg cursor-pointer transition-all"
              >
                <input
                  type="radio"
                  checked={selectedOutputs.includes(column)}
                  onChange={() => handleOutputToggle(column)}
                  disabled={selectedInputs.includes(column)}
                  name="output"
                  className="w-5 h-5 text-purple-600 border-gray-300 focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">{column}</span>
              </motion.label>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm font-semibold text-purple-600">
              {selectedOutputs.length} colonne(s) sélectionnée(s)
            </p>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex justify-between pt-6"
      >
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <Button onClick={handleNext} disabled={saving} size="lg">
          {saving ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Sauvegarde...
            </>
          ) : (
            'Suivant'
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
};
