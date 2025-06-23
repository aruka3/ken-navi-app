import React from 'react';
import { motion } from 'framer-motion';

interface MascotProps {
  message?: string;
}

export default function Mascot({ message }: MascotProps) {
  return (
    <motion.div 
      className="fixed bottom-6 right-6 z-50"
      initial={{ y: 0 }}
      animate={{ y: [-3, 3, -3] }}
      transition={{ 
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {/* Speech bubble */}
      {message && (
        <motion.div 
          className="absolute bottom-20 right-0 bg-white p-4 rounded-2xl shadow-lg border-2 border-blue-100 max-w-72 min-w-48"
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ duration: 0.3 }}
          key={message}
        >
          <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white border-r border-b border-blue-100 transform rotate-45"></div>
          <p className="text-sm text-gray-700 leading-relaxed">
            {message}
          </p>
        </motion.div>
      )}
      
      {/* Mascot cloud */}
      <motion.div 
        className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-full p-6 shadow-xl border-4 border-white cursor-pointer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{ 
          boxShadow: [
            "0 10px 25px rgba(59, 130, 246, 0.15)",
            "0 15px 35px rgba(59, 130, 246, 0.25)",
            "0 10px 25px rgba(59, 130, 246, 0.15)"
          ]
        }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <div className="relative">
          {/* Cloud emoji with custom styling */}
          <div className="text-3xl relative">
            ☁️
            <div className="absolute -top-1 -right-1 text-xs font-bold text-blue-600 bg-white rounded-full w-6 h-6 flex items-center justify-center border border-blue-200">
              ナビ
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Floating particles */}
      <motion.div
        className="absolute -top-2 -left-2 w-2 h-2 bg-blue-200 rounded-full opacity-60"
        animate={{ 
          y: [-8, -16, -8],
          x: [-3, 3, -3],
          opacity: [0.6, 0.3, 0.6]
        }}
        transition={{ 
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute -top-4 right-1 w-1.5 h-1.5 bg-blue-300 rounded-full opacity-40"
        animate={{ 
          y: [-12, -20, -12],
          x: [3, -3, 3],
          opacity: [0.4, 0.2, 0.4]
        }}
        transition={{ 
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5
        }}
      />
    </motion.div>
  );
}