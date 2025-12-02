'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { Eye, Trash2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import type { MLModel } from '@/lib/types';

interface ModelListProps {
  models: MLModel[];
  onViewModel: (id: number) => void;
  onDeleteModel: (id: number) => Promise<void>;
}

export const ModelList: React.FC<ModelListProps> = ({ models, onViewModel, onDeleteModel }) => {
  const [deletingModelId, setDeletingModelId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const handleDeleteClick = (id: number) => {
    setConfirmDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (confirmDeleteId === null) return;

    setDeletingModelId(confirmDeleteId);
    try {
      await onDeleteModel(confirmDeleteId);
    } finally {
      setDeletingModelId(null);
      setConfirmDeleteId(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDeleteId(null);
  };

  const modelToDelete = models.find((m) => m.id === confirmDeleteId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'trained':
        return 'from-green-500 to-emerald-500';
      case 'configured':
        return 'from-blue-500 to-cyan-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  if (models.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-12 text-center"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <p className="text-lg font-semibold text-gray-700">Aucun modèle créé pour le moment</p>
        <p className="text-sm text-gray-500 mt-2">
          Commencez par créer votre premier modèle ML
        </p>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
        className="space-y-4"
      >
        {models.map((model, index) => (
          <motion.div
            key={model.id}
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 },
            }}
            whileHover={{ scale: 1.01, x: 4 }}
            className="glass rounded-2xl p-6 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 border-l-4 border-transparent hover:border-purple-500"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{model.name}</h3>
                  <span className={`px-3 py-1 rounded-xl text-xs font-semibold text-white bg-gradient-to-r ${getStatusColor(model.status)} shadow-md`}>
                    {model.status}
                  </span>
                </div>
                {model.description && (
                  <p className="text-sm text-gray-600 mb-3">{model.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm">
                  {model.algorithm && (
                    <span className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-lg font-medium">
                      {model.algorithm}
                    </span>
                  )}
                  {model.score !== undefined && (
                    <span className="font-semibold gradient-text">
                      Score: {(model.score * 100).toFixed(2)}%
                    </span>
                  )}
                  <span className="text-gray-500">
                    {format(new Date(model.created_at), 'dd/MM/yyyy')}
                  </span>
                </div>
              </div>
              <div className="flex gap-3 ml-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewModel(model.id)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Voir
                </Button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDeleteClick(model.id)}
                  disabled={deletingModelId === model.id}
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-xl hover:shadow-lg hover:shadow-red-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {deletingModelId === model.id ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <ConfirmDialog
        isOpen={confirmDeleteId !== null}
        title="Supprimer le modèle ?"
        message={`Êtes-vous sûr de vouloir supprimer le modèle "${modelToDelete?.name}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        variant="danger"
      />
    </>
  );
};
