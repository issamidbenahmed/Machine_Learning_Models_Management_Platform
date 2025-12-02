'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { CheckCircle, Home, Eye, Sparkles, Trophy, Share } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { ExportAPIModal } from '@/components/monitoring/ExportAPIModal';
import type { TrainingResult, ExportedAPI } from '@/lib/types';

interface Step4ResultProps {
  modelId: number;
  algorithm: string;
  modelName: string;
}

export const Step4Result: React.FC<Step4ResultProps> = ({
  modelId,
  algorithm,
  modelName,
}) => {
  const router = useRouter();
  const [training, setTraining] = useState(true);
  const [result, setResult] = useState<TrainingResult | null>(null);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [exportedAPI, setExportedAPI] = useState<ExportedAPI | null>(null);

  useEffect(() => {
    trainModel();
  }, []);

  const trainModel = async () => {
    try {
      setTraining(true);
      const trainingResult = await apiClient.trainModel(modelId, algorithm);
      setResult(trainingResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'entraînement');
    } finally {
      setTraining(false);
    }
  };

  const handleGoToDashboard = () => {
    router.push('/');
  };

  const handleViewModel = () => {
    router.push(`/models/${modelId}`);
  };

  const handleExportAPI = async () => {
    try {
      setExporting(true);
      const exported = await apiClient.exportModel(modelId);
      setExportedAPI(exported);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'export');
    } finally {
      setExporting(false);
    }
  };

  if (training) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Entraînement du modèle
          </h2>
          <p className="text-gray-600">
            Votre modèle est en cours d'entraînement...
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative">
            <Spinner size="lg" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-primary-200 rounded-full animate-ping" />
            </div>
          </div>
          <p className="text-gray-600 mt-6 text-center">
            Entraînement en cours avec l'algorithme <strong>{algorithm}</strong>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Cela peut prendre quelques instants...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <div className="flex justify-center pt-4">
          <Button onClick={handleGoToDashboard}>Retour au dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mb-6 shadow-lg shadow-green-500/50"
        >
          <Trophy className="w-14 h-14 text-white" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
            <Sparkles className="w-4 h-4 text-green-600" />
            <span className="text-sm font-semibold text-green-600">Succès</span>
          </div>
          <h2 className="text-4xl font-bold mb-3">
            <span className="gradient-text-green">Modèle créé avec succès !</span>
          </h2>
          <p className="text-gray-600 text-lg">
            Votre modèle <strong className="text-purple-600">{modelName}</strong> a été entraîné et sauvegardé
          </p>
        </motion.div>
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-8 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="glass rounded-xl p-6 text-center hover-lift"
            >
              <p className="text-sm text-gray-600 font-medium mb-2">Algorithme</p>
              <p className="text-xl font-bold gradient-text">
                {result.algorithm}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="glass rounded-xl p-6 text-center hover-lift"
            >
              <p className="text-sm text-gray-600 font-medium mb-2">Score de précision</p>
              <p className="text-3xl font-bold gradient-text-green">
                {(result.score * 100).toFixed(2)}%
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
              className="glass rounded-xl p-6 text-center hover-lift"
            >
              <p className="text-sm text-gray-600 font-medium mb-2">Statut</p>
              <p className="text-xl font-bold text-green-600">
                {result.status === 'success' ? '✓ Entraîné' : result.status}
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="glass rounded-xl p-6"
          >
            <p className="text-sm text-gray-600 font-medium mb-2">Chemin du modèle</p>
            <p className="text-sm font-mono text-gray-700 break-all bg-gray-50 p-3 rounded-lg">
              {result.model_path}
            </p>
          </motion.div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="flex flex-col sm:flex-row gap-4 justify-center pt-6"
      >
        <Button variant="outline" onClick={handleGoToDashboard} size="lg">
          <Home className="w-5 h-5 mr-2" />
          Retour au dashboard
        </Button>
        <Button onClick={handleViewModel} size="lg">
          <Eye className="w-5 h-5 mr-2" />
          Voir les détails
        </Button>
        <Button 
          onClick={handleExportAPI} 
          disabled={exporting}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/50"
        >
          {exporting ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Export en cours...
            </>
          ) : (
            <>
              <Share className="w-5 h-5 mr-2" />
              Exporter sous forme API
            </>
          )}
        </Button>
      </motion.div>

      {/* Export API Modal */}
      {exportedAPI && (
        <ExportAPIModal
          isOpen={!!exportedAPI}
          onClose={() => setExportedAPI(null)}
          exportedAPI={exportedAPI}
        />
      )}
    </motion.div>
  );
};
