"use client";
import React, { useState } from "react";

const avatars = [
  "/images/avatar1.png",
  "/images/avatar2.png",
  "/images/avatar3.png",
  "/images/avatar4.png",
  "/images/avatar5.png"
];

export default function AvatarPage() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        background: "linear-gradient(135deg, #232526 0%, #414345 100%)",
        position: "relative",
        overflow: "hidden",
        paddingTop: 40,
        transition: "background 2s linear"
      }}
    >
      {/* Animated color waves background */}
      <div style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none"
      }}>
        <svg width="100%" height="100%" viewBox="0 0 400 900" style={{ position: 'absolute', top: 0, left: 0 }}>
          <defs>
            <linearGradient id="wave1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ff9a9e" />
              <stop offset="100%" stopColor="#fad0c4" />
            </linearGradient>
            <linearGradient id="wave2" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#a18cd1" />
              <stop offset="100%" stopColor="#fbc2eb" />
            </linearGradient>
          </defs>
          <path fill="url(#wave1)" fillOpacity="0.5">
            <animate attributeName="d" dur="12s" repeatCount="indefinite"
              values="M0,200 Q200,300 400,200 T800,200 V900 H0Z;
                      M0,220 Q200,180 400,220 T800,220 V900 H0Z;
                      M0,200 Q200,300 400,200 T800,200 V900 H0Z" />
          </path>
          <path fill="url(#wave2)" fillOpacity="0.4">
            <animate attributeName="d" dur="16s" repeatCount="indefinite"
              values="M0,400 Q200,500 400,400 T800,400 V900 H0Z;
                      M0,420 Q200,380 400,420 T800,420 V900 H0Z;
                      M0,400 Q200,500 400,400 T800,400 V900 H0Z" />
          </path>
        </svg>
      </div>
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 400, margin: "0 auto" }}>
        <div style={{ marginTop: 120, textAlign: "center" }}>
          <div style={{ color: "#fff", fontSize: 32, fontWeight: 700, marginBottom: 32 }}>
            Choose your avatar
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 40 }}>
            {avatars.map((src, i) => (
              <button
                key={src}
                onClick={() => setSelected(i)}
                style={{
                  border: selected === i ? "3px solid #fff" : "2px solid #888",
                  borderRadius: "50%",
                  padding: 0,
                  background: "none",
                  cursor: "pointer",
                  outline: selected === i ? "2px solid #4e54c8" : "none",
                  width: 64,
                  height: 64,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <img src={src} alt={`Avatar ${i+1}`} style={{ width: 56, height: 56, borderRadius: "50%" }} />
              </button>
            ))}
          </div>
          <button
            style={{
              width: 320,
              background: selected !== null ? "#000" : "#444",
              color: "#fff",
              border: "none",
              borderRadius: 20,
              padding: "16px 0",
              fontSize: 18,
              fontWeight: 500,
              marginTop: 24,
              cursor: selected !== null ? "pointer" : "not-allowed"
            }}
            disabled={selected === null}
            onClick={() => selected !== null && alert(`Avatar ${selected + 1} selected!`)}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
