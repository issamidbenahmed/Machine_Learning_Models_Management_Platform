'use client';

import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type,
  onClose,
  duration = 3000,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles = {
    success: {
      gradient: 'from-green-500 to-emerald-500',
      icon: <CheckCircle className="w-5 h-5 text-white" />,
    },
    error: {
      gradient: 'from-red-500 to-pink-500',
      icon: <XCircle className="w-5 h-5 text-white" />,
    },
  };

  const style = styles[type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed top-4 right-4 z-50 min-w-[320px] max-w-md"
      role="alert"
    >
      <div className="glass rounded-2xl overflow-hidden shadow-2xl">
        <div className={`h-1 bg-gradient-to-r ${style.gradient}`} />
        <div className="p-4 flex items-center gap-3">
          <div className={`p-2 rounded-xl bg-gradient-to-r ${style.gradient}`}>
            {style.icon}
          </div>
          <p className="flex-1 font-medium text-gray-800">{message}</p>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
