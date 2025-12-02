'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw, Power, Key, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { APIStatsCard } from '@/components/monitoring/APIStatsCard';
import { APIDocumentation } from '@/components/monitoring/APIDocumentation';
import dynamic from 'next/dynamic';

const RequestsChart = dynamic(
  () => import('@/components/monitoring/RequestsChart').then(mod => ({ default: mod.RequestsChart })),
  { ssr: false }
);
import { apiClient } from '@/lib/api';
import type { ExportedAPI, APIStats, APIRequest, APIMetrics } from '@/lib/types';

export default function APIDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const apiId = parseInt(params.id as string);

  const [api, setApi] = useState<ExportedAPI | null>(null);
  const [stats, setStats] = useState<APIStats | null>(null);
  const [requests, setRequests] = useState<APIRequest[]>([]);
  const [metrics, setMetrics] = useState<APIMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('24h');
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [apiData, statsData, requestsData, metricsData] = await Promise.all([
        apiClient.getAPIDetails(apiId),
        apiClient.getAPIStats(apiId, timeRange),
        apiClient.getAPIRequests(apiId, 50),
        apiClient.getAPIMetrics(apiId, timeRange)
      ]);

      setApi(apiData);
      setStats(statsData);
      setRequests(requestsData);
      setMetrics(metricsData);
    } catch (err) {
      console.error('Error fetching API details:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [apiId, timeRange]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  const handleToggleStatus = async () => {
    if (!api) return;
    try {
      const newStatus = api.status === 'active' ? 'inactive' : 'active';
      await apiClient.updateAPIStatus(api.id, newStatus);
      await fetchData();
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const handleRegenerateKey = async () => {
    try {
      const response = await apiClient.regenerateAPIKey(apiId);
      setNewApiKey(response.api_key);
      setShowRegenerateDialog(false);
      await fetchData();
    } catch (err) {
      console.error('Error regenerating key:', err);
    }
  };

  const handleDelete = async () => {
    try {
      await apiClient.deleteAPI(apiId);
      router.push('/monitoring');
    } catch (err) {
      console.error('Error deleting API:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!api || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">API non trouvée</h2>
          <Button onClick={() => router.push('/monitoring')}>
            Retour au monitoring
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="outline"
            onClick={() => router.push('/monitoring')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-2">
                {api.model_name || `Modèle #${api.model_id}`}
              </h1>
              <p className="text-gray-600 font-mono">{api.api_endpoint}</p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  api.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {api.status === 'active' ? '● Actif' : '○ Inactif'}
              </span>
              <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Time Range Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-4 mb-6"
        >
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Période:</span>
            {['24h', '7d', '30d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range === '24h' ? '24 heures' : range === '7d' ? '7 jours' : '30 jours'}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <APIStatsCard stats={stats} />
        </motion.div>

        {/* Charts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <RequestsChart metrics={metrics} requests={requests} />
        </motion.div>

        {/* Documentation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <APIDocumentation api={api} />
        </motion.div>

        {/* Management Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-xl p-6"
        >
          <h3 className="text-xl font-bold mb-4">Gestion de l'API</h3>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleToggleStatus} variant="outline">
              <Power className="w-4 h-4 mr-2" />
              {api.status === 'active' ? 'Désactiver' : 'Activer'}
            </Button>
            <Button
              onClick={() => setShowRegenerateDialog(true)}
              variant="outline"
              className="text-orange-600 hover:bg-orange-50"
            >
              <Key className="w-4 h-4 mr-2" />
              Régénérer la clé API
            </Button>
            <Button
              onClick={() => setShowDeleteDialog(true)}
              variant="outline"
              className="text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer l'API
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Dialogs */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onCancel={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Supprimer l'API"
        message={`Êtes-vous sûr de vouloir supprimer cette API ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
      />

      <ConfirmDialog
        isOpen={showRegenerateDialog}
        onCancel={() => setShowRegenerateDialog(false)}
        onConfirm={handleRegenerateKey}
        title="Régénérer la clé API"
        message="Attention: l'ancienne clé ne fonctionnera plus. Vous devrez mettre à jour tous vos clients."
        confirmLabel="Régénérer"
        cancelLabel="Annuler"
        variant="warning"
      />

      {/* New API Key Modal */}
      {newApiKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setNewApiKey(null)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white rounded-2xl p-8 max-w-md w-full"
          >
            <h3 className="text-2xl font-bold mb-4">Nouvelle clé API</h3>
            <p className="text-gray-600 mb-4">
              Copiez cette clé maintenant. Elle ne sera plus affichée.
            </p>
            <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm break-all mb-6">
              {newApiKey}
            </div>
            <Button onClick={() => setNewApiKey(null)} className="w-full">
              J'ai copié la clé
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
