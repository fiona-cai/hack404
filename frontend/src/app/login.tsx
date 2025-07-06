"use client";

import { useEffect, useState } from "react";
import { User } from "./page";
import dynamic from "next/dynamic";

const CatchPage = dynamic(() => import("./catch"), { ssr: false });

export default function LoginPage({ user, setUser, setLoggedIn }: { user: User; setUser: React.Dispatch<React.SetStateAction<User>>; setLoggedIn: React.Dispatch<React.SetStateAction<boolean>> }) {
  const [phone, setPhone] = useState("");
  const [showBirthday, setShowBirthday] = useState(false);
  const [showName, setShowName] = useState(false);
  const [NamePage, setNamePage] = useState<React.ComponentType<{ user: User; setUser: React.Dispatch<React.SetStateAction<User>>; onContinue: () => void }> | null>(null);
  const [AvatarPage, setAvatarPage] = useState<React.ComponentType<{ user: User; setUser: React.Dispatch<React.SetStateAction<User>>, setLoggedIn: React.Dispatch<React.SetStateAction<boolean>> }> | null>(null);
  const [showCatch, setShowCatch] = useState(false);
  const [catchTarget, setCatchTarget] = useState<{ name: string; avatar: string } | null>(null);

  // Format phone number as (XXX) XXX-XXXX
  function formatPhone(input: string) {
    // Remove all non-digit characters
    const digits = input.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  }

  useEffect(() => {
    if (showName && !NamePage) {
      import("./name").then(module => setNamePage(() => module.default));
    }
  }, [showName, NamePage]);

  useEffect(() => {
    if (showBirthday && !AvatarPage) {
      import("./avatar").then(module => setAvatarPage(() => module.default));
    }
  }, [showBirthday, AvatarPage]);

  if (showCatch && catchTarget) {
    return <CatchPage targetUser={catchTarget} onComplete={() => setShowCatch(false)} />;
  }

  if (showBirthday && AvatarPage) {
    return <AvatarPage user={user} setUser={setUser} setLoggedIn={setLoggedIn} />;
  }

  if (showName && NamePage) {
    return <NamePage user={user} setUser={setUser} onContinue={() => setShowBirthday(true)} />;
  }

  const peopleNearby: { name: string; avatar: string }[] = [
    { name: "Ash", avatar: "/images/icon.png" },
    { name: "Misty", avatar: "/images/icon.png" }
  ];

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
          `linear-gradient(120deg, var(--main-gradient-from, #4e54c8) 0%, var(--main-gradient-to, #8f94fb) 100%)`,
        backgroundBlendMode: "screen, lighten, normal",
        paddingTop: 40,
        transition: "background 2s linear"
      }}
    >
      <div style={{ width: "100%", maxWidth: 400, margin: "0 auto", maxHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "flex-start" }}>
        <div style={{ marginTop: 60, textAlign: "center" }}>
          <img src="/images/icon.png" alt="gotcha logo" style={{ width: 360, height: "auto", margin: "0 auto" }} />
        </div>
        <div style={{ marginTop: 12, textAlign: "center" }}>
          <div style={{ color: "#fff", fontSize: 24, fontWeight: 400, lineHeight: 1.3 }}>
            Catch Conversations.<br />Make Real Connections.
          </div>
        </div>
        <div style={{ marginTop: 150, textAlign: "center" }}>
          <div style={{ color: "#fff", fontSize: 18, marginBottom: 8 }}>
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
                fontSize: 24,
                width: "100%",
                letterSpacing: 2
              }}
              onKeyDown={e => {
                if (phone.length === 10 && (e.key === 'Enter' || e.key === 'ArrowRight')) {
                  setShowName(true);
                  setUser({ ...user, phoneNumber: phone });
                }
              }}
            />
            {phone.length === 10 && (
              <button
                aria-label="Continue"
                onClick={e => {
                  e.preventDefault();
                  setShowName(true);
                  setUser({ ...user, phoneNumber: phone });
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
        <div style={{ marginTop: 40, textAlign: "center" }}>
          <div style={{ color: "#fff", fontSize: 20, marginBottom: 12 }}>Nearby People</div>
          {peopleNearby.map(person => (
            <div key={person.name} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 10 }}>
              <img src={person.avatar} alt={person.name} style={{ width: 40, height: 40, borderRadius: "50%", border: "2px solid #fff" }} />
              <span style={{ color: "#fff", fontSize: 18 }}>{person.name}</span>
              <button
                style={{
                  background: "#4e54c8",
                  color: "#fff",
                  border: "none",
                  borderRadius: 16,
                  padding: "6px 18px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
                onClick={() => {
                  setCatchTarget(person);
                  setShowCatch(true);
                }}
              >Catch</button>
            </div>
          ))}
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
