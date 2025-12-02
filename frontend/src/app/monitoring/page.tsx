'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, RefreshCw, Search, TrendingUp, Zap, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { APIList } from '@/components/monitoring/APIList';
import { apiClient } from '@/lib/api';
import type { ExportedAPI } from '@/lib/types';

interface MonitoringSummary {
  total_apis: number;
  active_apis: number;
  total_requests: number;
  requests_24h: number;
}

export default function MonitoringPage() {
  const [apis, setApis] = useState<ExportedAPI[]>([]);
  const [summary, setSummary] = useState<MonitoringSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    try {
      const response = await apiClient.getExportedAPIs();
      // The response includes both apis and summary from backend
      if (Array.isArray(response)) {
        setApis(response);
      } else if (response.apis) {
        setApis(response.apis);
        setSummary(response.summary);
      }
    } catch (err) {
      console.error('Error fetching APIs:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  const filteredApis = apis.filter(api =>
    api.model_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    api.api_endpoint.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-2">
                Monitoring API
              </h1>
              <p className="text-gray-600">
                Surveillez et gérez vos APIs exportées
              </p>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              size="lg"
            >
              <RefreshCw className={`w-5 h-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        </motion.div>

        {/* Summary Stats */}
        {summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <div className="glass rounded-xl p-6 hover-lift">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-3xl font-bold gradient-text mb-1">
                {summary.total_apis}
              </p>
              <p className="text-sm text-gray-600">APIs Totales</p>
            </div>

            <div className="glass rounded-xl p-6 hover-lift">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-green-600 mb-1">
                {summary.active_apis}
              </p>
              <p className="text-sm text-gray-600">APIs Actives</p>
            </div>

            <div className="glass rounded-xl p-6 hover-lift">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-blue-600 mb-1">
                {summary.total_requests.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Requêtes Totales</p>
            </div>

            <div className="glass rounded-xl p-6 hover-lift">
              <div className="flex items-center justify-between mb-2">
                <Zap className="w-8 h-8 text-yellow-600" />
              </div>
              <p className="text-3xl font-bold text-yellow-600 mb-1">
                {summary.requests_24h.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Requêtes (24h)</p>
            </div>
          </motion.div>
        )}

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl p-4 mb-6"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom de modèle ou endpoint..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </motion.div>

        {/* API List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {filteredApis.length === 0 ? (
            <div className="glass rounded-xl p-12 text-center">
              <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {searchQuery ? 'Aucune API trouvée' : 'Aucune API exportée'}
              </h3>
              <p className="text-gray-600">
                {searchQuery
                  ? 'Essayez une autre recherche'
                  : 'Exportez un modèle pour créer votre première API'}
              </p>
            </div>
          ) : (
            <APIList apis={filteredApis} onRefresh={fetchData} />
          )}
        </motion.div>
      </div>
    </div>
  );
}
