'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Activity } from 'lucide-react';
import type { APIMetrics, APIRequest } from '@/lib/types';

interface RequestsChartProps {
  metrics: APIMetrics[];
  requests: APIRequest[];
}

export const RequestsChart: React.FC<RequestsChartProps> = ({ metrics, requests }) => {
  // Format metrics data for charts
  const chartData = metrics.map(metric => ({
    time: new Date(metric.hour_timestamp).toLocaleString('fr-FR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit'
    }),
    requests: metric.request_count,
    responseTime: metric.avg_response_time,
    success: metric.success_count,
    errors: metric.error_count
  }));

  // Recent requests table data
  const recentRequests = requests.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Requests Over Time */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-6 h-6 text-purple-600" />
          <h3 className="text-xl font-bold">Requêtes dans le temps</h3>
        </div>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="requests" fill="#8b5cf6" name="Requêtes" />
              <Bar dataKey="success" fill="#10b981" name="Succès" />
              <Bar dataKey="errors" fill="#ef4444" name="Erreurs" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-gray-500">
            Aucune donnée disponible
          </div>
        )}
      </motion.div>

      {/* Response Time Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-xl p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold">Temps de réponse moyen</h3>
        </div>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} label={{ value: 'ms', angle: -90, position: 'insideLeft' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="responseTime"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Temps de réponse (ms)"
                dot={{ fill: '#3b82f6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-gray-500">
            Aucune donnée disponible
          </div>
        )}
      </motion.div>

      {/* Recent Requests Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-xl p-6"
      >
        <h3 className="text-xl font-bold mb-6">Requêtes récentes</h3>
        {recentRequests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Timestamp</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Temps (ms)</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">CPU (%)</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Mémoire (MB)</th>
                </tr>
              </thead>
              <tbody>
                {recentRequests.map((req, index) => (
                  <tr key={req.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(req.timestamp).toLocaleString('fr-FR')}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          req.status_code >= 200 && req.status_code < 300
                            ? 'bg-green-100 text-green-700'
                            : req.status_code >= 400
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {req.status_code}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {req.response_time ? req.response_time.toFixed(2) : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {req.cpu_usage ? req.cpu_usage.toFixed(1) : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {req.memory_usage ? req.memory_usage.toFixed(1) : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            Aucune requête récente
          </div>
        )}
      </motion.div>
    </div>
  );
};
