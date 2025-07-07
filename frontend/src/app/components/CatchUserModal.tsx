'use client';

import React, { useState } from 'react';
import GestureCatchCard from './GestureCatchCard';
import { motion, AnimatePresence } from 'framer-motion';

interface CatchUserModalProps {
  targetUser: {
    id: number;
    name: string;
    avatar: string;
    distance: number;
  } | null;
  onCatch: (userId: number) => void;
  onClose: () => void;
  setShowCatchAnimation: React.Dispatch<React.SetStateAction<{
    targetUser: { name: string; avatar: string };
  } | null>>;
}

export default function CatchUserModal({
  targetUser,
  onCatch,
  onClose,
  setShowCatchAnimation
}: CatchUserModalProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleCatch = (userId: number) => {
    setIsVisible(false);
    setTimeout(() => {
      onCatch(userId);
      fetch('/api/catch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ initiatorId: 34, targetId: userId }) // Replace 34 with actual initiator ID
      });
      onClose();
    }, 500);
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  if (!targetUser) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          
          {/* Modal Content */}
          <motion.div
            className="relative z-10 p-8"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ 
              type: "spring", 
              damping: 20, 
              stiffness: 300 
            }}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute -top-4 -right-4 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg z-20"
            >
              ×
            </button>

            <GestureCatchCard
              targetUser={targetUser}
              onCatch={handleCatch}
              onCancel={handleClose}
              className="transform-gpu"
              setShowCatchAnimation={setShowCatchAnimation}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
