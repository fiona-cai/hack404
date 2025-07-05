"use client";
import React, { useState } from "react";

export default function LoginPage({ onComplete }: { onComplete?: () => void } = {}) {
  const [phone, setPhone] = useState("");
  const [showBirthday, setShowBirthday] = useState(false);

  // Format phone number as (XXX) XXX-XXXX
  function formatPhone(input: string) {
    // Remove all non-digit characters
    const digits = input.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  }

  if (showBirthday) {
    const AvatarPage = require("./avatar").default;
    return <AvatarPage onComplete={onComplete} />;
  }

  return (
    <div
      className="animated-bg"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        background:
          `radial-gradient(circle at 70% 20%, #8e5fa2 0%, #6B4668 40%, transparent 70%),` +
          `radial-gradient(circle at 30% 80%, #3B6B6B 0%, #2e4a4a 60%, transparent 90%),` +
          `linear-gradient(120deg, var(--main-gradient-from, #6B4668) 0%, var(--main-gradient-to, #3B6B6B) 100%)`,
        backgroundBlendMode: "screen, lighten, normal",
        paddingTop: 40,
        transition: "background 2s linear"
      }}
    >
      <div style={{ width: "100%", maxWidth: 400, margin: "0 auto", maxHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "flex-start" }}>
        <div style={{ marginTop: 32, textAlign: "center" }}>
          <img src="/images/icon.png" alt="gotcha logo" style={{ width: 200, height: "auto", margin: "0 auto" }} />
        </div>
        <div style={{ marginTop: 32, textAlign: "center" }}>
          <div style={{ color: "#fff", fontSize: 18, fontWeight: 400, lineHeight: 1.3 }}>
            Catch Conversations.<br />Make Real Connections.
          </div>
        </div>
        <div style={{ marginTop: 120, textAlign: "center" }}>
          <div style={{ color: "#fff", fontSize: 14, marginBottom: 8 }}>
            Sign up with your phone number
          </div>
          <div style={{
            display: "flex",
            alignItems: "center",
            background: "#000",
            borderRadius: 20,
            padding: "8px 20px",
            maxWidth: 320,
            margin: "0 auto",
            position: "relative"
          }}>
            <p className="pr-4">📞</p>
            <input
              type="tel"
              placeholder="(416) 555-5555"
              value={formatPhone(phone)}
              onChange={e => {
                // Only allow up to 10 digits
                const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                setPhone(digits);
              }}
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#fff",
                fontSize: 20,
                width: "100%",
                letterSpacing: 2
              }}
              onKeyDown={e => {
                if (phone.length === 10 && (e.key === 'Enter' || e.key === 'ArrowRight')) {
                  setShowBirthday(true);
                }
              }}
            />
            {phone.length === 10 && (
              <button
                aria-label="Continue"
                onClick={e => {
                  e.preventDefault();
                  setShowBirthday(true);
                }}
                type="button"
                style={{
                  position: "absolute",
                  right: 10,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  height: 32
                }}
                tabIndex={0}
              >
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="14" cy="14" r="14" fill="#fff" fillOpacity="0.15"/>
                  <path d="M11 9l5 5-5 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ position: "absolute", left: 0, bottom: 0, width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", color: "#fff", opacity: 0.5 }}>
          <span>9:41</span>
          <span style={{ display: "flex", gap: 8 }}>
            <svg width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="8" width="2" height="4" rx="1" fill="#fff"/><rect x="6" y="6" width="2" height="8" rx="1" fill="#fff"/><rect x="10" y="4" width="2" height="12" rx="1" fill="#fff"/><rect x="14" y="2" width="2" height="16" rx="1" fill="#fff"/></svg>
            <svg width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="8" stroke="#fff" strokeWidth="2"/><circle cx="10" cy="10" r="4" fill="#fff"/></svg>
            <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="18" width="20" height="2" rx="1" fill="#fff"/></svg>
          </span>
        </div>
      </div>
      <style>{`
      :root {
        --main-gradient-from: #4e54c8;
        --main-gradient-to: #8f94fb;
      }
      @property --main-gradient-from {
        syntax: '<color>';
        inherits: false;
        initial-value: #4e54c8;
      }
      @property --main-gradient-to {
        syntax: '<color>';
        inherits: false;
        initial-value: #8f94fb;
      }
      @keyframes gradientShift {
        0% {
          --main-gradient-from: #4e54c8;
          --main-gradient-to: #8f94fb;
        }
        25% {
          --main-gradient-from: #43cea2;
          --main-gradient-to: #185a9d;
        }
        50% {
          --main-gradient-from: #30cfd0;
          --main-gradient-to: #330867;
        }
        75% {
          --main-gradient-from: #667eea;
          --main-gradient-to: #764ba2;
        }
        100% {
          --main-gradient-from: #4e54c8;
          --main-gradient-to: #8f94fb;
        }
      }
      body, #__next, #root {
        height: 100%;
      }
      .animated-bg {
        animation: gradientShift 12s linear infinite;
      }
    `}</style>
    </div>
  );
}
