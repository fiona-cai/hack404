"use client";
import { useState, useEffect } from "react";

interface CatchAnimationProps {
  targetUser: { name: string; avatar: string };
  onComplete?: () => void;
}

export default function CatchAnimation({ targetUser, onComplete }: CatchAnimationProps) {
  const [stage, setStage] = useState<'throwing' | 'catching' | 'generating'>('throwing');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setStage('catching'), 1000);
    const timer2 = setTimeout(() => setStage('generating'), 2000);
    const timer3 = setTimeout(() => {
      if (onComplete) onComplete();
    }, 4000);

    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  const getStageText = () => {
    switch (stage) {
      case 'throwing': return `Catching ${targetUser.name}...`;
      case 'catching': return `${targetUser.name} caught!`;
      case 'generating': return 'Generating your Gotcha Card...';
      default: return '';
    }
  };

  const getStageEmoji = () => {
    switch (stage) {
      case 'throwing': return '🎯';
      case 'catching': return '✨';
      case 'generating': return '🎴';
      default: return '✨';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      color: '#fff'
    }}>
      {/* Main animation */}
      <div style={{
        fontSize: '120px',
        marginBottom: '32px',
        animation: stage === 'throwing' ? 'bounce 0.8s infinite' : 'pulse 1s infinite'
      }}>
        {getStageEmoji()}
      </div>

      {/* User info */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <img 
          src={targetUser.avatar} 
          alt={targetUser.name}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            border: '3px solid #fff',
            boxShadow: '0 4px 12px rgba(255, 255, 255, 0.3)'
          }}
        />
        <div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{targetUser.name}</div>
          <div style={{ fontSize: '16px', opacity: 0.8 }}>{getStageText()}</div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        width: '300px',
        height: '8px',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: '4px',
        overflow: 'hidden',
        marginBottom: '16px'
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          backgroundColor: '#4e54c8',
          borderRadius: '4px',
          transition: 'width 0.1s ease'
        }} />
      </div>

      <div style={{ fontSize: '14px', opacity: 0.7 }}>
        {Math.round(progress)}% complete
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-20px);
          }
          60% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
