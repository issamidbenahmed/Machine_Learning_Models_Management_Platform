'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface Step {
  id: number;
  title: string;
  description: string;
}

interface WizardLayoutProps {
  currentStep: number;
  steps: Step[];
  children: React.ReactNode;
}

export const WizardLayout: React.FC<WizardLayoutProps> = ({
  currentStep,
  steps,
  children,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-5xl mx-auto"
    >
      {/* Progress Bar */}
      <div className="mb-10">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center flex-1">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 shadow-lg ${
                    step.id < currentStep
                      ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-green-500/50'
                      : step.id === currentStep
                      ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-purple-500/50 scale-110'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step.id < currentStep ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    step.id
                  )}
                </motion.div>
                <div className="mt-3 text-center">
                  <p
                    className={`text-sm font-semibold ${
                      step.id === currentStep
                        ? 'gradient-text'
                        : step.id < currentStep
                        ? 'text-green-600'
                        : 'text-gray-500'
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                    {step.description}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="relative flex-1 mx-3" style={{ maxWidth: '120px' }}>
                  <div className="h-1 bg-gray-200 rounded-full" />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: step.id < currentStep ? '100%' : '0%' }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="absolute top-0 left-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-2xl p-8 shadow-xl"
      >
        {children}
      </motion.div>
    </motion.div>
  );
};
