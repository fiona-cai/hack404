'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { useDeviceMotion } from '@/hooks/useDeviceMotion';
import Image from 'next/image';

interface TargetUser {
  id: number;
  name: string;
  avatar: string;
  distance: number;
}

interface GestureCatchCardProps {
  targetUser: TargetUser;
  onCatch: (userId: number) => void;
  onCancel?: () => void;
  disabled?: boolean;
  className?: string;
  setShowCatchAnimation: React.Dispatch<React.SetStateAction<{
    targetUser: { name: string; avatar: string };
  } | null>>;
}

type BallType = 'pokeball' | 'loveball' | 'linkedinball';

interface BallStyle {
  topColor: string;
  bottomColor: string;
  name: string;
  emoji: string;
}

export default function GestureCatchCard({
  targetUser,
  onCatch,
  onCancel,
  disabled = false,
  className = '',
  setShowCatchAnimation
}: GestureCatchCardProps) {
  const [isThrown, setIsThrown] = useState(false);
  const [showTrail, setShowTrail] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [selectedBall, setSelectedBall] = useState<BallType>('pokeball');
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Ball styles configuration
  const ballStyles: Record<BallType, BallStyle> = {
    pokeball: {
      topColor: 'from-red-400 to-red-500',
      bottomColor: 'from-gray-100 to-white',
      name: 'Pokeball',
      emoji: '⚪'
    },
    loveball: {
      topColor: 'from-pink-400 to-pink-500',
      bottomColor: 'from-gray-100 to-white',
      name: 'Love Ball',
      emoji: '💕'
    },
    linkedinball: {
      topColor: 'from-blue-400 to-blue-500',
      bottomColor: 'from-gray-100 to-white',
      name: 'LinkedIn Ball',
      emoji: '💼'
    }
  };

  const currentBallStyle = ballStyles[selectedBall];
  
  // Motion values for drag animation
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(y, [-200, 0, 200], [-10, 0, 10]);
  const scale = useTransform(y, [-200, 0], [0.8, 1]);
  const opacity = useTransform(y, [-300, -100, 0], [0, 0.5, 1]);

  // Device motion detection
  const { acceleration } = useDeviceMotion();

  // Thresholds for gesture detection
  const SWIPE_THRESHOLD = 100;
  const VELOCITY_THRESHOLD = 300;
  const MOTION_THRESHOLD = 7.5;

  const handleCatch = useCallback(() => {
    if (disabled || isThrown) return;
    
    setIsThrown(true);
    setShowTrail(true);
    
    setTimeout(() => {
      onCatch(targetUser.id);
    }, 1000);
  }, [disabled, isThrown, onCatch, targetUser.id]);

  useEffect(() => {
    if (!acceleration || disabled || isThrown) return;

    const { x: ax, y: ay, z: az } = acceleration;
    const totalAcceleration = Math.sqrt((ax || 0) ** 2 + (ay || 0) ** 2 + (az || 0) ** 2);

    if (totalAcceleration > MOTION_THRESHOLD) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 200);

      if ((ay || 0) > MOTION_THRESHOLD) {
        handleCatch();
        setShowCatchAnimation({
          targetUser: {
            name: targetUser.name,
            avatar: targetUser.avatar
          }
        });
      }
    }
  }, [acceleration, disabled, isThrown, handleCatch]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info;
    
    const shouldCatch = 
      offset.y < -SWIPE_THRESHOLD || 
      velocity.y < -VELOCITY_THRESHOLD;

    if (shouldCatch) {
      handleCatch();
      setShowCatchAnimation({
        targetUser: {
          name: targetUser.name,
          avatar: targetUser.avatar
        }
      });
    } else {
      x.set(0);
      y.set(0);
    }
  };

  const resetCard = () => {
    setIsThrown(false);
    setShowTrail(false);
    x.set(0);
    y.set(0);
  };

  return (
    <div className={`relative flex items-center gap-6 ${className}`}>
      <div className="flex-1">
        <motion.div
          className="text-center absolute -top-16 left-1/2 transform -translate-x-1/2 text-white text-sm font-medium bg-black/50 px-4 py-2 rounded-full"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          Swipe up to catch! 👆
        </motion.div>

      {showTrail && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 bg-blue-400 rounded-full"
              initial={{ 
                x: '50%', 
                y: '50%',
                scale: 1,
                opacity: 0.8
              }}
              animate={{ 
                x: '50%',
                y: `-${(i + 1) * 50}px`,
                scale: 0,
                opacity: 0
              }}
              transition={{ 
                duration: 0.8,
                delay: i * 0.1,
                ease: "easeOut"
              }}
            />
          ))}
        </motion.div>
      )}

      <motion.div
        ref={cardRef}
        className={`
          relative w-64 h-56 bg-gradient-to-br from-blue-500 to-purple-600 
          rounded-2xl shadow-xl cursor-grab active:cursor-grabbing mt-7
          ${isShaking ? 'animate-pulse' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        style={{ x, y, rotate, scale, opacity }}
        drag={!disabled && !isThrown}
        dragConstraints={{ left: 0, right: 0, top: -400, bottom: 50 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        animate={isThrown ? {
          y: -800,
          scale: 0.3,
          rotate: 360,
          opacity: 0
        } : {}}
        transition={isThrown ? {
          duration: 1,
          ease: "easeInOut"
        } : {
          type: "spring",
          damping: 20,
          stiffness: 300
        }}
      >
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          <div className={`absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b ${currentBallStyle.topColor}`} />
          <div className={`absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t ${currentBallStyle.bottomColor}`} />
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-800 transform -translate-y-1/2" />
          <div className="absolute top-1/2 left-1/2 w-8 h-8 bg-white border-4 border-gray-800 rounded-full transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 rounded-full" />
          </div>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-black z-10">
          <div className="relative mb-3">
            <Image
              src={targetUser.avatar}
              alt={targetUser.name}
              width={64}
              height={64}
              className="w-16 h-16 rounded-full border-3 border-white shadow-lg"
            />
            <motion.div
              className="absolute -inset-1 rounded-full border-2 border-yellow-400"
              animate={isShaking ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.2 }}
            />
          </div>
          
          <h3 className="text-md mt-5 font-bold text-shadow">{targetUser.name}</h3>
          <p className="text-sm opacity-90">{targetUser.distance}m away</p>
          
          <motion.div
            className="mt-2 text-xs bg-white/20 px-3 py-1 rounded-full"
            animate={isShaking ? { scale: [1, 1.05, 1] } : {}}
          >
            Ready to catch!
          </motion.div>
        </div>

        <motion.div
          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/20 to-purple-400/20"
          animate={{
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      <div className="flex justify-center gap-4 mt-6">
        {onCancel && (
          <motion.button
            className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-full shadow-lg"
            onClick={onCancel}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ❌ Cancel
          </motion.button>
        )}
      </div>

      {isThrown && (
        <motion.button
          className="absolute top-4 right-4 px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-full text-sm"
          onClick={resetCard}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          Reset
        </motion.button>
      )}
      </div>

      {/* Ball Selection Panel */}
      <div className="flex flex-col gap-3">
        <div className="text-white text-sm font-medium text-center mb-2">
          Choose Ball
        </div>
        {Object.entries(ballStyles).map(([ballType, style]) => (
          <motion.button
            key={ballType}
            className={`
              relative w-12 h-12 rounded-full border-2 transition-all duration-200
              ${selectedBall === ballType 
                ? 'border-yellow-400 shadow-lg shadow-yellow-400/50' 
                : 'border-gray-400 hover:border-gray-200'
              }
            `}
            onClick={() => setSelectedBall(ballType as BallType)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            disabled={disabled || isThrown}
          >
            {/* Mini Ball Preview */}
            <div className="absolute inset-1 rounded-full overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b ${style.topColor}`} />
              <div className={`absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t ${style.bottomColor}`} />
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-800 transform -translate-y-1/2" />
              <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-white border border-gray-800 rounded-full transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 rounded-full" />
              </div>
            </div>
            
            {/* Ball Type Indicator */}
            <div className="absolute -bottom-1 -right-1 text-xs">
              {style.emoji}
            </div>
          </motion.button>
        ))}
        
        {/* Ball Name Display */}
        <div className="text-white text-xs text-center font-medium">
          {currentBallStyle.name}
        </div>
      </div>
    </div>
  );
}