'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={onClick ? { y: -4, scale: 1.01 } : {}}
      className={`glass rounded-2xl p-6 transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:shadow-2xl hover:shadow-purple-500/10' : ''
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};
