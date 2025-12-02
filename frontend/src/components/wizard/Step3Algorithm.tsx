'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { Card } from '../ui/Card';
import { apiClient } from '@/lib/api';
import { ChevronLeft, Trophy, Medal, Award, Sparkles } from 'lucide-react';
import type { AlgorithmResult } from '@/lib/types';

interface Step3AlgorithmProps {
    modelId: number;
    onNext: (algorithm: string) => void;
    onBack: () => void;
}

export const Step3Algorithm: React.FC<Step3AlgorithmProps> = ({
    modelId,
    onNext,
    onBack,
}) => {
    const [algorithms, setAlgorithms] = useState<AlgorithmResult[]>([]);
    const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        testAlgorithms();
    }, [modelId]);

    const testAlgorithms = async () => {
        try {
            setLoading(true);
            const results = await apiClient.testAlgorithms(modelId);
            setAlgorithms(results);

            // Sélectionner automatiquement le meilleur
            if (results.length > 0) {
                setSelectedAlgorithm(results[0].algorithm);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors du test des algorithmes');
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (index: number) => {
        if (index === 0) return <Trophy className="w-5 h-5 text-yellow-500" />;
        if (index === 1) return <Medal className="w-5 h-5 text-gray-400" />;
        if (index === 2) return <Award className="w-5 h-5 text-orange-600" />;
        return null;
    };

    const getScoreColor = (score: number) => {
        if (score >= 0.9) return 'text-green-600';
        if (score >= 0.7) return 'text-blue-600';
        if (score >= 0.5) return 'text-orange-600';
        return 'text-red-600';
    };

    const handleNext = () => {
        if (!selectedAlgorithm) {
            setError('Veuillez sélectionner un algorithme');
            return;
        }
        onNext(selectedAlgorithm);
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Test des algorithmes
                    </h2>
                    <p className="text-gray-600">
                        Nous testons différents algorithmes sur votre dataset...
                    </p>
                </div>
                <div className="flex flex-col items-center justify-center py-12">
                    <Spinner size="lg" />
                    <p className="text-gray-600 mt-4">
                        Entraînement en cours, cela peut prendre quelques instants...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Erreur
                    </h2>
                </div>
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
                <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={onBack}>
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Retour
                    </Button>
                    <Button onClick={testAlgorithms}>Réessayer</Button>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
        >
            <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-semibold text-purple-600">Étape 3</span>
                </div>
                <h2 className="text-3xl font-bold mb-3">
                    <span className="gradient-text">Sélection de l'algorithme</span>
                </h2>
                <p className="text-gray-600 text-lg">
                    Choisissez l'algorithme qui offre les meilleures performances
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {algorithms.map((algo, index) => (
                    <Card
                        key={algo.algorithm}
                        className={`cursor-pointer transition-all ${selectedAlgorithm === algo.algorithm
                                ? 'ring-2 ring-primary-500 border-primary-500'
                                : 'hover:border-primary-300'
                            }`}
                        onClick={() => setSelectedAlgorithm(algo.algorithm)}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    {getRankIcon(index)}
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {algo.name}
                                    </h3>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">{algo.description}</p>
                                
                                {/* Métriques */}
                                <div className="space-y-2 mb-3">
                                    {algo.metrics?.accuracy !== undefined && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Accuracy:</span>
                                            <span className="font-semibold">{(algo.metrics.accuracy * 100).toFixed(2)}%</span>
                                        </div>
                                    )}
                                    {algo.metrics?.r2 !== undefined && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">R²:</span>
                                            <span className="font-semibold">{algo.metrics.r2.toFixed(4)}</span>
                                        </div>
                                    )}
                                    {algo.metrics?.rmse !== undefined && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">RMSE:</span>
                                            <span className="font-semibold">{algo.metrics.rmse.toFixed(4)}</span>
                                        </div>
                                    )}
                                    {algo.metrics?.mae !== undefined && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">MAE:</span>
                                            <span className="font-semibold">{algo.metrics.mae.toFixed(4)}</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                                    <div>
                                        <p className="text-xs text-gray-500">Score Principal</p>
                                        <p className={`text-2xl font-bold ${getScoreColor(algo.score)}`}>
                                            {(algo.score * 100).toFixed(2)}%
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Temps</p>
                                        <p className="text-sm font-medium text-gray-700">
                                            {algo.training_time}s
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <input
                                type="radio"
                                checked={selectedAlgorithm === algo.algorithm}
                                onChange={() => setSelectedAlgorithm(algo.algorithm)}
                                className="mt-1 w-5 h-5 text-primary-600 border-gray-300 focus:ring-primary-500"
                            />
                        </div>
                    </Card>
                ))}
            </div>

            {algorithms.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    Aucun algorithme disponible
                </div>
            )}

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex justify-between pt-6"
            >
                <Button variant="outline" onClick={onBack}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Retour
                </Button>
                <Button onClick={handleNext} disabled={!selectedAlgorithm} size="lg">
                    Sauvegarder et entraîner
                </Button>
            </motion.div>
        </motion.div>
    );
};
