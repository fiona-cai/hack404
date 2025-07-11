"use client";
import React, { ComponentType, useEffect, useState } from "react";
import { User } from "./page";

const avatars = [
  "Timmy",
  "Michelle",
];

export default function AvatarPage({ user, setUser, setLoggedIn }: { user: User; setUser: React.Dispatch<React.SetStateAction<User>>; setLoggedIn: React.Dispatch<React.SetStateAction<boolean>> }) {
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);
  const [showInterests, setShowInterests] = useState(false);

  const [InterestsPage, setInterestsPage] = useState<ComponentType<{ user: User; setUser: React.Dispatch<React.SetStateAction<User>>, setLoggedIn: React.Dispatch<React.SetStateAction<boolean>> }> | null>(null);

  useEffect(() => {
    if (showInterests && !InterestsPage) {
      import("./interests").then((mod) => setInterestsPage(() => mod.default));
    }
  }, [showInterests, InterestsPage]);

  if (showInterests && InterestsPage) {
    return <InterestsPage user={user} setUser={setUser} setLoggedIn={setLoggedIn} />;
  }

  return (
    <>
      <style>{`
      :root {
        --avatar-gradient-from: #1e3c72;
        --avatar-gradient-to: #2a5298;
        --avatar-radial1: #5fa8e6;
        --avatar-radial2: #3a7bd5;
        --avatar-radial3: #274b6d;
        --avatar-radial4: #6dd5ed;
      }
      @property --avatar-gradient-from {
        syntax: '<color>';
        inherits: false;
        initial-value: #1e3c72;
      }
      @property --avatar-gradient-to {
        syntax: '<color>';
        inherits: false;
        initial-value: #2a5298;
      }
      @property --avatar-radial1 {
        syntax: '<color>';
        inherits: false;
        initial-value: #5fa8e6;
      }
      @property --avatar-radial2 {
        syntax: '<color>';
        inherits: false;
        initial-value: #3a7bd5;
      }
      @property --avatar-radial3 {
        syntax: '<color>';
        inherits: false;
        initial-value: #274b6d;
      }
      @property --avatar-radial4 {
        syntax: '<color>';
        inherits: false;
        initial-value: #6dd5ed;
      }
      @keyframes avatarGradientShift {
        0% {
          --avatar-gradient-from: #1e3c72;
          --avatar-gradient-to: #2a5298;
          --avatar-radial1: #5fa8e6;
          --avatar-radial2: #3a7bd5;
          --avatar-radial3: #274b6d;
          --avatar-radial4: #6dd5ed;
        }
        20% {
          --avatar-gradient-from: #3a7bd5;
          --avatar-gradient-to: #6dd5ed;
          --avatar-radial1: #2a5298;
          --avatar-radial2: #1e3c72;
          --avatar-radial3: #6dd5ed;
          --avatar-radial4: #3a7bd5;
        }
        40% {
          --avatar-gradient-from: #6dd5ed;
          --avatar-gradient-to: #1e3c72;
          --avatar-radial1: #3a7bd5;
          --avatar-radial2: #2a5298;
          --avatar-radial3: #3a7bd5;
          --avatar-radial4: #5fa8e6;
        }
        80% {
          --avatar-gradient-from: #5fa8e6;
          --avatar-gradient-to: #274b6d;
          --avatar-radial1: #6dd5ed;
          --avatar-radial2: #3a7bd5;
          --avatar-radial3: #5fa8e6;
          --avatar-radial4: #274b6d;
        }
      }
      .avatar-animated-bg {
        animation: avatarGradientShift 20s linear infinite;
      }
    `}</style>
      <div
        className="avatar-animated-bg"
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          background:
            `radial-gradient(circle at 70% 20%, var(--avatar-radial1, #6dd5ed) 0%, var(--avatar-radial2, #2193b0) 40%, transparent 70%),` +
            `radial-gradient(circle at 30% 80%, var(--avatar-radial3, #1e3c72) 0%, var(--avatar-radial4, #2a5298) 60%, transparent 90%),` +
            `linear-gradient(120deg, var(--avatar-gradient-from, #1e3c72) 0%, var(--avatar-gradient-to, #2a5298) 100%)`,
          backgroundBlendMode: "screen, lighten, normal",
          paddingTop: 40,
          transition: "background 2s linear"
        }}
      >
        <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 400, margin: "0 auto" }}>
          <div style={{ marginTop: 120, textAlign: "center" }}>
            <div style={{ color: "#fff", fontSize: 32, fontWeight: 700, marginBottom: 64 }}>
              Choose your avatar
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, justifyContent: "center", margin: "0 auto 40px auto", width: 220 }}>
              {avatars.map((src, i) => (
                <button
                  key={src}
                  onClick={() => setSelectedAvatar(i)}
                  style={{
                    border: selectedAvatar === i ? "3px solid #fff" : "2px solid #888",
                    borderRadius: "50%",
                    padding: 0,
                    background: "none",
                    cursor: "pointer",
                    outline: selectedAvatar === i ? "2px solid #4e54c8" : "none",
                    width: 150,
                    height: 150,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "box-shadow 0.2s, border 0.2s"
                  }}
                >
                  <img src={`images/${src}.png`} alt={`Avatar ${i+1}`} style={{ width: 120, height: 120, borderRadius: "50%" }} />
                </button>
              ))}
            </div>
            <button
              style={{
                width: 320,
                background: selectedAvatar !== null ? "#000" : "#444",
                color: "#fff",
                border: "none",
                borderRadius: 20,
                padding: "16px 0",
                fontSize: 18,
                fontWeight: 500,
                marginTop: 48,
                cursor: selectedAvatar !== null ? "pointer" : "not-allowed"
              }}
              disabled={selectedAvatar === null}
              onClick={() => {
                setUser({ ...user, avatar: avatars[selectedAvatar || 0] }); // Update user state with selected avatar
                return selectedAvatar !== null && setShowInterests(true);
              }}
            >
              Continue to Interests
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
