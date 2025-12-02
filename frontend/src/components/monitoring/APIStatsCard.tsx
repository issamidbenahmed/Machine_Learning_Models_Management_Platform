'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, CheckCircle, XCircle, Cpu, HardDrive } from 'lucide-react';
import type { APIStats } from '@/lib/types';

interface APIStatsCardProps {
  stats: APIStats;
}

export const APIStatsCard: React.FC<APIStatsCardProps> = ({ stats }) => {
  const statItems = [
    {
      label: 'Requêtes Totales',
      value: stats.total_requests.toLocaleString(),
      icon: TrendingUp,
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      label: 'Requêtes (24h)',
      value: stats.requests_24h.toLocaleString(),
      icon: Clock,
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      label: 'Requêtes (7j)',
      value: stats.requests_7d.toLocaleString(),
      icon: TrendingUp,
      color: 'indigo',
      gradient: 'from-indigo-500 to-indigo-600'
    },
    {
      label: 'Temps de réponse moyen',
      value: `${stats.avg_response_time.toFixed(2)}ms`,
      icon: Clock,
      color: 'cyan',
      gradient: 'from-cyan-500 to-cyan-600'
    },
    {
      label: 'Taux de succès',
      value: `${stats.success_rate.toFixed(1)}%`,
      icon: CheckCircle,
      color: 'green',
      gradient: 'from-green-500 to-green-600'
    },
    {
      label: 'Taux d\'erreur',
      value: `${stats.error_rate.toFixed(1)}%`,
      icon: XCircle,
      color: 'red',
      gradient: 'from-red-500 to-red-600'
    },
    {
      label: 'CPU moyen',
      value: `${stats.avg_cpu_usage.toFixed(1)}%`,
      icon: Cpu,
      color: 'orange',
      gradient: 'from-orange-500 to-orange-600'
    },
    {
      label: 'Mémoire moyenne',
      value: `${stats.avg_memory_usage.toFixed(1)}MB`,
      icon: HardDrive,
      color: 'pink',
      gradient: 'from-pink-500 to-pink-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="glass rounded-xl p-6 hover-lift"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-3 rounded-lg bg-gradient-to-br ${item.gradient} shadow-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold gradient-text mb-1">
              {item.value}
            </p>
            <p className="text-sm text-gray-600">
              {item.label}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
};
