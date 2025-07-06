"use client";
import { useState } from "react";
import Image from "next/image";
import { GotchaCard, User } from "@/lib/gotcha-types";

interface GotchaCardDisplayProps {
  card: GotchaCard;
  userA: User;
  userB: User;
  onComplete?: () => void;
  onClose?: () => void;
}

export default function GotchaCardDisplay({ 
  card, 
  userA, 
  userB, 
  onComplete, 
  onClose 
}: GotchaCardDisplayProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const handleReveal = () => {
    setIsRevealed(true);
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    if (onComplete) {
      await onComplete();
    }
    setIsCompleting(false);
  };

  const getRarityGlow = (rarity: GotchaCard['rarity']) => {
    switch (rarity) {
      case 'legendary': return '0 0 30px #ffd700, 0 0 60px #ffd700';
      case 'epic': return '0 0 20px #9d4edd, 0 0 40px #9d4edd';
      case 'rare': return '0 0 15px #00b4d8, 0 0 30px #00b4d8';
      case 'uncommon': return '0 0 10px #06d6a0, 0 0 20px #06d6a0';
      default: return '0 0 8px #f8f9fa, 0 0 16px #f8f9fa';
    }
  };

  const getRarityBorder = (rarity: GotchaCard['rarity']) => {
    switch (rarity) {
      case 'legendary': return 'linear-gradient(135deg, #ffd700, #ffed4e, #ffd700)';
      case 'epic': return 'linear-gradient(135deg, #9d4edd, #c77dff, #9d4edd)';
      case 'rare': return 'linear-gradient(135deg, #00b4d8, #0077b6, #00b4d8)';
      case 'uncommon': return 'linear-gradient(135deg, #06d6a0, #40916c, #06d6a0)';
      default: return 'linear-gradient(135deg, #adb5bd, #6c757d, #adb5bd)';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '400px',
        minHeight: '500px',
        background: card.background_color,
        borderRadius: '20px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: getRarityGlow(card.rarity),
        border: '4px solid transparent',
        backgroundImage: getRarityBorder(card.rarity),
        backgroundOrigin: 'border-box',
        backgroundClip: 'content-box, border-box',
        color: card.text_color,
        transform: isRevealed ? 'scale(1)' : 'scale(0.9)',
        opacity: isRevealed ? 1 : 0.8,
        transition: 'all 0.3s ease'
      }}>
        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '30px',
              right: '32px',
              background: 'rgba(0, 0, 0, 0.3)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: card.text_color,
              fontSize: '18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        )}

        {/* Rarity indicator */}
        <div style={{
          position: 'absolute',
          top: '32px',
          left: '32px',
          background: 'rgba(0, 0, 0, 0.3)',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          {card.rarity}
        </div>

        {/* Card icon */}
        <div style={{
          fontSize: '72px',
          marginTop: '40px',
          marginBottom: '16px',
          filter: `drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))`
        }}>
          {card.icon_emoji}
        </div>

        {/* Card title */}
        <h2 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          textAlign: 'center',
          margin: '0 0 16px 0',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
        }}>
          {card.title}
        </h2>

        {/* Card description */}
        {isRevealed ? (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            textAlign: 'center',
            fontSize: '16px',
            lineHeight: '1.5',
            marginBottom: '24px'
          }}>
            <p style={{
              margin: '0 0 16px 0',
              padding: '16px',
              background: 'rgba(0, 0, 0, 0.1)',
              borderRadius: '12px',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
            }}>
              {card.description}
            </p>
            
            {/* User context */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              fontSize: '14px',
              opacity: 0.8
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Image 
                  src={`/images/${userA.avatar}.png`} 
                  alt={userA.name}
                  width={24}
                  height={24}
                  style={{ borderRadius: '50%' }}
                />
                <span>{userA.name}</span>
              </div>
              <span>×</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Image 
                  src={`/images/${userB.avatar}.png`} 
                  alt={userB.name}
                  width={24}
                  height={24}
                  style={{ borderRadius: '50%' }}
                />
                <span>{userB.name}</span>
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            textAlign: 'center',
            marginBottom: '24px'
          }}>
            <p style={{ margin: 0, opacity: 0.8 }}>
              Tap to reveal your Gotcha Card!
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          width: '100%'
        }}>
          {!isRevealed ? (
            <button
              onClick={handleReveal}
              style={{
                flex: 1,
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.2)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '12px',
                color: card.text_color,
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              🎁 Reveal Card
            </button>
          ) : (
            <>
              {onComplete && (
                <button
                  onClick={handleComplete}
                  disabled={isCompleting}
                  style={{
                    flex: 1,
                    padding: '16px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '12px',
                    color: card.text_color,
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: isCompleting ? 'not-allowed' : 'pointer',
                    opacity: isCompleting ? 0.6 : 1,
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isCompleting ? '✅ Completing...' : '✅ Complete'}
                </button>
              )}
            </>
          )}
        </div>

        {/* Card tags */}
        {card.tags && card.tags.length > 0 && (
          <div style={{
            marginTop: '16px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            justifyContent: 'center'
          }}>
            {card.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                style={{
                  padding: '4px 8px',
                  background: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  opacity: 0.7
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
