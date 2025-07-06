"use client";
import { useState } from "react";

export default function CatchPage({ onComplete, targetUser }: { onComplete?: () => void; targetUser: { name: string; avatar: string } }) {
  const [isThrowing, setIsThrowing] = useState(false);
  const [caught, setCaught] = useState(false);

  function handleThrow() {
    setIsThrowing(true);
    setTimeout(() => {
      setCaught(true);
      setIsThrowing(false);
      if (onComplete) setTimeout(onComplete, 1200);
    }, 1400);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background:
          `radial-gradient(circle at 70% 20%, #8e5fa2 0%, #6B4668 40%, transparent 70%),` +
          `radial-gradient(circle at 30% 80%, #3B6B6B 0%, #2e4a4a 60%, transparent 90%),` +
          `linear-gradient(120deg, #4e54c8 0%, #8f94fb 100%)`,
        backgroundBlendMode: "screen, lighten, normal",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        position: "relative"
      }}
    >
      <div style={{ position: "absolute", top: 40, left: 0, right: 0, textAlign: "center", color: "#fff", fontSize: 28, fontWeight: 600, textShadow: "0 2px 8px #0008" }}>
        {caught ? `You caught ${targetUser.name}!` : `Catch ${targetUser.name}`}
      </div>
      <div style={{ position: "relative", width: 320, height: 420, marginTop: 60 }}>
        {/* Avatar to catch */}
        <img
          src={targetUser.avatar}
          alt={targetUser.name}
          style={{
            position: "absolute",
            left: "50%",
            top: isThrowing ? "70%" : "30%",
            transform: "translate(-50%, -50%) scale(" + (caught ? 0.7 : 1.1) + ")",
            width: 140,
            height: 140,
            borderRadius: "50%",
            boxShadow: "0 8px 32px #0006",
            transition: "top 1.2s cubic-bezier(.4,1.6,.4,1), transform 0.5s, box-shadow 0.3s"
          }}
        />
        {/* Pokeball mimic */}
        {!caught && (
          <button
            onClick={handleThrow}
            disabled={isThrowing}
            style={{
              position: "absolute",
              left: "50%",
              bottom: 0,
              transform: "translateX(-50%)",
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "radial-gradient(circle at 60% 40%, #fff 60%, #e74c3c 100%)",
              border: "4px solid #222",
              boxShadow: isThrowing ? "0 0 32px 8px #fff6" : "0 4px 24px #0007",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: isThrowing ? "not-allowed" : "pointer",
              transition: "box-shadow 0.3s"
            }}
            aria-label="Throw ball"
          >
            <div style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "#fff",
              border: "3px solid #222",
              boxShadow: "0 0 8px #fff8"
            }} />
          </button>
        )}
        {/* Caught animation */}
        {caught && (
          <div style={{
            position: "absolute",
            left: "50%",
            top: "70%",
            transform: "translate(-50%, -50%)",
            color: "#fff",
            fontSize: 32,
            fontWeight: 700,
            textShadow: "0 2px 8px #000a"
          }}>
            🎉
          </div>
        )}
      </div>
      <div style={{ position: "absolute", bottom: 32, left: 0, right: 0, textAlign: "center", color: "#fff", fontSize: 18, opacity: 0.7 }}>
        {caught ? "Connection made!" : "Throw the ball to catch!"}
      </div>
    </div>
  );
}
