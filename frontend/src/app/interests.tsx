"use client";
import React, { useState } from "react";
import { User } from "./page";

const INTERESTS = [
  { label: "Tech", icon: "💻" },
  { label: "Creative", icon: "🎨" },
  { label: "Social", icon: "💬" },
  { label: "Learning", icon: "🎓" },
  { label: "Networking", icon: "🤝" },
  { label: "Wellness", icon: "🧘‍♂️" },
  { label: "Books", icon: "📚" },
  { label: "Gaming", icon: "🎮" },
  { label: "Community", icon: "🌍" },
  { label: "Active", icon: "🏃‍♂️" },
];

export default function InterestsPage({ user, setUser, setLoggedIn }: { user: User; setUser: React.Dispatch<React.SetStateAction<User>>; setLoggedIn: React.Dispatch<React.SetStateAction<boolean>> }) {
  const [selected, setSelected] = useState<string[]>([]);

  function toggleInterest(label: string) {
    setSelected(sel =>
      sel.includes(label) ? sel.filter(l => l !== label) : [...sel, label]
    );
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
        .animated-bg {
          animation: gradientShift 12s linear infinite;
        }
      `}</style>
      <div style={{ width: "100%", maxWidth: 400, margin: "0 auto" }}>
        <div style={{ marginTop: 80, textAlign: "center" }}>
          <div style={{ color: "#fff", fontSize: 36, fontWeight: 700, marginBottom: 32, lineHeight: 1.1 }}>
            What are your<br />interests?
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", marginBottom: 48 }}>
            {INTERESTS.map(({ label, icon }) => (
              <button
                key={label}
                onClick={() => toggleInterest(label)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: selected.includes(label) ? "#000" : "rgba(255,255,255,0.12)",
                  color: selected.includes(label) ? "#fff" : "#fff",
                  border: selected.includes(label) ? "none" : "1.5px solid #fff",
                  borderRadius: 20,
                  padding: "10px 22px",
                  fontSize: 18,
                  fontWeight: 500,
                  cursor: "pointer",
                  outline: "none",
                  boxShadow: selected.includes(label) ? "0 2px 8px 0 rgba(0,0,0,0.10)" : undefined,
                  transition: "all 0.2s"
                }}
              >
                <span>{icon}</span>
                {label}
              </button>
            ))}
          </div>
          <button
            style={{
              width: 320,
              background: selected.length > 0 ? "#000" : "#444",
              color: "#fff",
              border: "none",
              borderRadius: 20,
              padding: "16px 0",
              fontSize: 18,
              fontWeight: 500,
              marginTop: 24,
              cursor: selected.length > 0 ? "pointer" : "not-allowed"
            }}
            disabled={selected.length === 0}
            onClick={() => {
              setUser({ ...user, interests: selected });
              fetch("/api/create-user", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({ ...user, interests: selected })
              });
              setLoggedIn(true);
            }}
          >
            Complete
          </button>
        </div>
      </div>
    </div>
  );
}
