'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, Power, Trash2, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { apiClient } from '@/lib/api';
import type { ExportedAPI } from '@/lib/types';

interface APIListProps {
  apis: ExportedAPI[];
  onRefresh: () => void;
}

export const APIList: React.FC<APIListProps> = ({ apis, onRefresh }) => {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [apiToDelete, setApiToDelete] = useState<ExportedAPI | null>(null);

  const handleViewDetails = (apiId: number) => {
    router.push(`/monitoring/${apiId}`);
  };

  const handleToggleStatus = async (api: ExportedAPI) => {
    try {
      setTogglingId(api.id);
      const newStatus = api.status === 'active' ? 'inactive' : 'active';
      await apiClient.updateAPIStatus(api.id, newStatus);
      onRefresh();
    } catch (err) {
      console.error('Error toggling API status:', err);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteClick = (api: ExportedAPI) => {
    setApiToDelete(api);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!apiToDelete) return;

    try {
      setDeletingId(apiToDelete.id);
      await apiClient.deleteAPI(apiToDelete.id);
      setShowDeleteDialog(false);
      setApiToDelete(null);
      onRefresh();
    } catch (err) {
      console.error('Error deleting API:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-6">
        {apis.map((api, index) => (
          <motion.div
            key={api.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass rounded-xl p-6 hover-lift"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-800">
                    {api.model_name || `Modèle #${api.model_id}`}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      api.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : api.status === 'inactive'
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {api.status === 'active' ? '● Actif' : api.status === 'inactive' ? '○ Inactif' : '✕ Erreur'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 font-mono mb-3">
                  {api.api_endpoint}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Créé le {formatDate(api.created_at)}</span>
                  </div>
                  {api.last_used_at && (
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>Dernière utilisation: {formatDate(api.last_used_at)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            {api.stats && (
              <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Requêtes (24h)</p>
                  <p className="text-lg font-bold text-purple-600">
                    {api.stats.requests_24h || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Temps de réponse</p>
                  <p className="text-lg font-bold text-blue-600">
                    {api.stats.avg_response_time ? `${api.stats.avg_response_time}ms` : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Taux de succès</p>
                  <p className="text-lg font-bold text-green-600">
                    {api.stats.success_rate ? `${api.stats.success_rate}%` : 'N/A'}
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button
                onClick={() => handleViewDetails(api.id)}
                size="sm"
              >
                <Eye className="w-4 h-4 mr-2" />
                Détails
              </Button>
              <Button
                onClick={() => handleToggleStatus(api)}
                disabled={togglingId === api.id}
                variant="outline"
                size="sm"
              >
                {togglingId === api.id ? (
                  <>Chargement...</>
                ) : (
                  <>
                    <Power className="w-4 h-4 mr-2" />
                    {api.status === 'active' ? 'Désactiver' : 'Activer'}
                  </>
                )}
              </Button>
              <Button
                onClick={() => handleDeleteClick(api)}
                disabled={deletingId === api.id}
                variant="outline"
                size="sm"
                className="text-red-600 hover:bg-red-50"
              >
                {deletingId === api.id ? (
                  <>Suppression...</>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onCancel={() => {
          setShowDeleteDialog(false);
          setApiToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Supprimer l'API"
        message={`Êtes-vous sûr de vouloir supprimer l'API "${apiToDelete?.model_name || 'ce modèle'}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
      />
    </>
  );
};
