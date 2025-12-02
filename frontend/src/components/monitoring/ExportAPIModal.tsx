'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Copy, Check, ExternalLink, Code, Book } from 'lucide-react';
import { Button } from '../ui/Button';
import type { ExportedAPI } from '@/lib/types';

interface ExportAPIModalProps {
  isOpen: boolean;
  onClose: () => void;
  exportedAPI: ExportedAPI;
}

export const ExportAPIModal: React.FC<ExportAPIModalProps> = ({
  isOpen,
  onClose,
  exportedAPI,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${exportedAPI.api_url}`;

  const curlExample = `curl -X POST "${apiUrl}" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${exportedAPI.api_key}" \\
  -d '{
    "feature1": "value1",
    "feature2": "value2"
  }'`;

  const pythonExample = `import requests

url = "${apiUrl}"
headers = {
    "Content-Type": "application/json",
    "X-API-Key": "${exportedAPI.api_key}"
}
data = {
    "feature1": "value1",
    "feature2": "value2"
}

response = requests.post(url, headers=headers, json=data)
result = response.json()
print(result)`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold gradient-text">API Exportée avec Succès!</h2>
              <p className="text-gray-600 mt-1">Votre modèle est maintenant accessible via API</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* API Information */}
          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <ExternalLink className="w-5 h-5 mr-2 text-blue-600" />
              Informations de l'API
            </h3>
            <div className="space-y-4">
              {/* API URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL de l'API
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={apiUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(apiUrl, 'url')}
                  >
                    {copiedField === 'url' ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* API Key */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clé API (gardez-la secrète!)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    value={exportedAPI.api_key}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(exportedAPI.api_key, 'key')}
                  >
                    {copiedField === 'key' ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Cette clé est nécessaire pour authentifier vos requêtes
                </p>
              </div>
            </div>
          </div>

          {/* Usage Examples */}
          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Code className="w-5 h-5 mr-2 text-purple-600" />
              Exemples d'utilisation
            </h3>
            <div className="space-y-4">
              {/* cURL Example */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-800">cURL</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(curlExample, 'curl')}
                  >
                    {copiedField === 'curl' ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{curlExample}</code>
                </pre>
              </div>

              {/* Python Example */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-800">Python</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(pythonExample, 'python')}
                  >
                    {copiedField === 'python' ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{pythonExample}</code>
                </pre>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Book className="w-5 h-5 mr-2 text-green-600" />
              Instructions
            </h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <p>Utilisez l'URL de l'API pour envoyer des requêtes POST</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <p>Incluez votre clé API dans le header <code className="bg-gray-100 px-1 rounded">X-API-Key</code></p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <p>Envoyez vos données au format JSON dans le body de la requête</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                <p>Vous recevrez la prédiction au format JSON en réponse</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-2xl">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Vous pouvez gérer cette API depuis le dashboard de monitoring
            </p>
            <Button onClick={onClose}>
              Fermer
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
