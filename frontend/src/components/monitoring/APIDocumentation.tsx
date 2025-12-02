'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Book, Copy, Check, Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/Button';
import type { ExportedAPI } from '@/lib/types';

interface APIDocumentationProps {
  api: ExportedAPI;
}

export const APIDocumentation: React.FC<APIDocumentationProps> = ({ api }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${api.api_url}`;

  const curlExample = `curl -X POST "${apiUrl}" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${api.api_key}" \\
  -d '{
    "feature1": "value1",
    "feature2": "value2"
  }'`;

  const pythonExample = `import requests

url = "${apiUrl}"
headers = {
    "Content-Type": "application/json",
    "X-API-Key": "${api.api_key}"
}
data = {
    "feature1": "value1",
    "feature2": "value2"
}

response = requests.post(url, headers=headers, json=data)
result = response.json()
print(result)`;

  const javascriptExample = `fetch("${apiUrl}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": "${api.api_key}"
  },
  body: JSON.stringify({
    feature1: "value1",
    feature2: "value2"
  })
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error("Error:", error));`;

  const exampleResponse = `{
  "prediction": [42.5],
  "model_id": ${api.model_id},
  "model_name": "${api.model_name || 'Model'}",
  "timestamp": "2024-01-15T10:30:00Z"
}`;

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Book className="w-6 h-6 text-green-600" />
        <h3 className="text-xl font-bold">Documentation de l'API</h3>
      </div>

      <div className="space-y-6">
        {/* Endpoint Information */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-3">Informations de connexion</h4>
          
          {/* API URL */}
          <div className="mb-4">
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
              Clé API
            </label>
            <div className="flex items-center gap-2">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={api.api_key}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(api.api_key, 'key')}
              >
                {copiedField === 'key' ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Usage Instructions */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-3">Instructions d'utilisation</h4>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2 text-sm">
            <p className="flex items-start gap-2">
              <span className="font-semibold text-blue-700">1.</span>
              <span>Envoyez une requête POST à l'URL de l'API</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="font-semibold text-blue-700">2.</span>
              <span>Incluez votre clé API dans le header <code className="bg-white px-1 rounded">X-API-Key</code></span>
            </p>
            <p className="flex items-start gap-2">
              <span className="font-semibold text-blue-700">3.</span>
              <span>Envoyez vos données au format JSON dans le body</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="font-semibold text-blue-700">4.</span>
              <span>Recevez la prédiction au format JSON</span>
            </p>
          </div>
        </div>

        {/* Code Examples */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-3">Exemples de code</h4>
          
          {/* cURL */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-medium text-gray-700">cURL</h5>
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

          {/* Python */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-medium text-gray-700">Python</h5>
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

          {/* JavaScript */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-medium text-gray-700">JavaScript</h5>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(javascriptExample, 'javascript')}
              >
                {copiedField === 'javascript' ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{javascriptExample}</code>
            </pre>
          </div>
        </div>

        {/* Example Response */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-3">Exemple de réponse</h4>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
            <code>{exampleResponse}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
