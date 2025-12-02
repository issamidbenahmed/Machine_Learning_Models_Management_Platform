'use client';

import React, { useState } from 'react';
import { WizardLayout } from '@/components/wizard/WizardLayout';
import { Step1Info } from '@/components/wizard/Step1Info';
import { Step2Features } from '@/components/wizard/Step2Features';
import { Step3Algorithm } from '@/components/wizard/Step3Algorithm';
import { Step4Result } from '@/components/wizard/Step4Result';
import { apiClient } from '@/lib/api';

const STEPS = [
  {
    id: 1,
    title: 'Informations',
    description: 'Nom et dataset',
  },
  {
    id: 2,
    title: 'Features',
    description: 'Inputs et outputs',
  },
  {
    id: 3,
    title: 'Algorithme',
    description: 'Sélection',
  },
  {
    id: 4,
    title: 'Résultat',
    description: 'Entraînement',
  },
];

interface WizardData {
  step1: {
    name: string;
    description: string;
    datasetId: number | null;
    file: File | null;
  };
  step2: {
    inputs: string[];
    outputs: string[];
  };
  step3: {
    algorithm: string;
  };
  modelId: number | null;
}

export default function CreateModelPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData>({
    step1: {
      name: '',
      description: '',
      datasetId: null,
      file: null,
    },
    step2: {
      inputs: [],
      outputs: [],
    },
    step3: {
      algorithm: '',
    },
    modelId: null,
  });

  const handleStep1Next = async (data: typeof wizardData.step1) => {
    try {
      // Créer le modèle
      const model = await apiClient.createModel({
        name: data.name,
        description: data.description,
        dataset_id: data.datasetId!,
      });

      setWizardData({
        ...wizardData,
        step1: data,
        modelId: model.id,
      });
      setCurrentStep(2);
    } catch (error) {
      console.error('Erreur création modèle:', error);
    }
  };

  const handleStep2Next = (data: typeof wizardData.step2) => {
    setWizardData({
      ...wizardData,
      step2: data,
    });
    setCurrentStep(3);
  };

  const handleStep2Back = () => {
    setCurrentStep(1);
  };

  const handleStep3Next = (algorithm: string) => {
    setWizardData({
      ...wizardData,
      step3: { algorithm },
    });
    setCurrentStep(4);
  };

  const handleStep3Back = () => {
    setCurrentStep(2);
  };

  return (
    <div className="py-8">
      <WizardLayout currentStep={currentStep} steps={STEPS}>
        {currentStep === 1 && (
          <Step1Info data={wizardData.step1} onNext={handleStep1Next} />
        )}

        {currentStep === 2 && wizardData.step1.datasetId && wizardData.modelId && (
          <Step2Features
            datasetId={wizardData.step1.datasetId}
            modelId={wizardData.modelId}
            data={wizardData.step2}
            onNext={handleStep2Next}
            onBack={handleStep2Back}
          />
        )}

        {currentStep === 3 && wizardData.modelId && (
          <Step3Algorithm
            modelId={wizardData.modelId}
            onNext={handleStep3Next}
            onBack={handleStep3Back}
          />
        )}

        {currentStep === 4 && wizardData.modelId && wizardData.step3.algorithm && (
          <Step4Result
            modelId={wizardData.modelId}
            algorithm={wizardData.step3.algorithm}
            modelName={wizardData.step1.name}
          />
        )}
      </WizardLayout>
    </div>
  );
}
