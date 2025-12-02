'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { format } from 'date-fns';
import { ArrowLeft, Brain, Database, TrendingUp, Calendar, CheckCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { apiClient } from '@/lib/api';
import type { MLModel } from '@/lib/types';

export default function ModelDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const modelId = parseInt(params.id as string);

  const [model, setModel] = useState<MLModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (modelId) {
      loadModel();
    }
  }, [modelId]);

  const loadModel = async () => {
    try {
      setLoading(true);
      const modelData = await apiClient.getModel(modelId);
      setModel(modelData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <Spinner size="lg" />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-gray-600 font-medium"
        >
          Chargement du modèle...
        </motion.p>
      </div>
    );
  }

  if (error || !model) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
          <span className="text-4xl">⚠️</span>
        </div>
        <p className="text-xl font-semibold text-red-600 mb-4">{error || 'Modèle introuvable'}</p>
        <Button onClick={handleBack}>
          Retour au dashboard
        </Button>
      </motion.div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'trained':
        return 'bg-green-100 text-green-800';
      case 'configured':
        return 'bg-blue-100 text-blue-800';
      case 'created':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'trained':
        return 'Entraîné';
      case 'configured':
        return 'Configuré';
      case 'created':
        return 'Créé';
      default:
        return status;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour au dashboard
        </Button>
      </motion.div>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-semibold text-purple-600">Détails du Modèle</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-3">
          <span className="gradient-text">{model.name}</span>
        </h1>
        {model.description && (
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{model.description}</p>
        )}
        <div className="mt-4">
          <span className={`px-5 py-2 rounded-full text-sm font-semibold ${getStatusColor(model.status)} shadow-lg`}>
            {getStatusLabel(model.status)}
          </span>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Algorithme</p>
              <p className="text-xl font-bold gradient-text">
                {model.algorithm || 'Non défini'}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Score</p>
              <p className="text-xl font-bold gradient-text-green">
                {model.score ? `${(model.score * 100).toFixed(2)}%` : 'N/A'}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Dataset ID</p>
              <p className="text-xl font-bold gradient-text-blue">
                #{model.dataset_id}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Créé le</p>
              <p className="text-lg font-bold text-gray-900">
                {format(new Date(model.created_at), 'dd/MM/yyyy')}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Features */}
      {(model.inputs || model.outputs) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {model.inputs && model.inputs.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Colonnes Input ({model.inputs.length})
                </h3>
                <div className="space-y-2">
                  {model.inputs.map((input, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded"
                    >
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">{input}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {model.outputs && model.outputs.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Colonnes Output ({model.outputs.length})
                </h3>
                <div className="space-y-2">
                  {model.outputs.map((output, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-2 bg-primary-50 rounded"
                    >
                      <CheckCircle className="w-4 h-4 text-primary-600" />
                      <span className="text-sm text-gray-700">{output}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
        </motion.div>
      )}

      {/* Model Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Informations du modèle
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-600">ID</span>
            <span className="text-sm text-gray-900">#{model.id}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-600">Statut</span>
            <span className="text-sm text-gray-900">{getStatusLabel(model.status)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-600">Date de création</span>
            <span className="text-sm text-gray-900">
              {format(new Date(model.created_at), 'dd/MM/yyyy HH:mm')}
            </span>
          </div>
          {model.trained_at && (
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-600">Date d'entraînement</span>
              <span className="text-sm text-gray-900">
                {format(new Date(model.trained_at), 'dd/MM/yyyy HH:mm')}
              </span>
            </div>
          )}
          {model.model_path && (
            <div className="flex justify-between py-2">
              <span className="text-sm font-medium text-gray-600">Chemin du modèle</span>
              <span className="text-sm text-gray-900 font-mono break-all">
                {model.model_path}
              </span>
            </div>
          )}
        </div>
      </Card>
      </motion.div>
    </motion.div>
  );
}
