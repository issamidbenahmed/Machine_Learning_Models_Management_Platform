'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, CheckCircle, Activity, Database, TrendingUp, Plus, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { StatCard } from '@/components/dashboard/StatCard';
import { ModelList } from '@/components/dashboard/ModelList';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Toast } from '@/components/ui/Toast';
import { apiClient } from '@/lib/api';
import type { MLModel, Stats } from '@/lib/types';

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [models, setModels] = useState<MLModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, modelsData] = await Promise.all([
        apiClient.getStats(),
        apiClient.getModels(),
      ]);
      setStats(statsData);
      setModels(modelsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateModel = () => {
    router.push('/models/create');
  };

  const handleViewModel = (id: number) => {
    router.push(`/models/${id}`);
  };

  const handleDeleteModel = async (id: number) => {
    try {
      await apiClient.deleteModel(id);
      setToast({ message: 'Modèle supprimé avec succès', type: 'success' });
      await loadData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setToast({ message: errorMessage, type: 'error' });
    }
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
          Chargement de vos modèles...
        </motion.p>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
          <span className="text-4xl">⚠️</span>
        </div>
        <p className="text-xl font-semibold text-red-600 mb-4">{error}</p>
        <Button onClick={loadData}>
          Réessayer
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-12"
    >
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-semibold text-purple-600">Plateforme ML Intelligente</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          <span className="gradient-text">Créez et gérez votre modèle maintenant!</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Gérez et optimisez vos modèles de machine learning en toute simplicité
        </p>
      </motion.div>

      {/* Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Statistiques</h2>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            <Activity className="w-6 h-6 text-purple-600" />
          </motion.div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard
            icon={<Brain className="w-6 h-6" />}
            label="Total Modèles"
            value={stats?.total_models || 0}
          />
          <StatCard
            icon={<CheckCircle className="w-6 h-6" />}
            label="Modèles Entraînés"
            value={stats?.trained_models || 0}
          />
          <StatCard
            icon={<Activity className="w-6 h-6" />}
            label="Utilisations"
            value={stats?.total_uses || 0}
          />
          <StatCard
            icon={<Database className="w-6 h-6" />}
            label="Datasets"
            value={stats?.total_datasets || 0}
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="Précision Moyenne"
            value={stats?.avg_score ? `${(stats.avg_score * 100).toFixed(1)}%` : '0%'}
          />
        </div>
      </motion.div>

      {/* Models List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Mes Modèles</h2>
          <Button onClick={handleCreateModel}>
            <Plus className="w-5 h-5 mr-2" />
            Créer un modèle
          </Button>
        </div>
        <ModelList 
          models={models} 
          onViewModel={handleViewModel}
          onDeleteModel={handleDeleteModel}
        />
      </motion.div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={toast.type === 'success' ? 3000 : 5000}
        />
      )}
    </motion.div>
  );
}
