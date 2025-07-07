"use client";

import { useEffect, useState } from "react";
import { User } from "./page";
import dynamic from "next/dynamic";

const CatchPage = dynamic(() => import("./catch"), { ssr: false });

export default function LoginPage({ user, setUser, setLoggedIn }: { user: User; setUser: React.Dispatch<React.SetStateAction<User>>; setLoggedIn: React.Dispatch<React.SetStateAction<boolean>> }) {
  const [phone, setPhone] = useState("");
  const [showBirthday, setShowBirthday] = useState(false);
  const [showName, setShowName] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
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

  // Check if user exists and sign them in
  async function handlePhoneSubmit() {
    setIsChecking(true);
    
    try {
      // Check if user exists with this phone number
      const response = await fetch('/api/get-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone })
      });

      if (response.ok) {
        const existingUser = await response.json();
        
        if (existingUser) {
          // User exists - sign them in directly
          setUser({
            name: existingUser.name,
            avatar: existingUser.avatar,
            phoneNumber: phone,
            birthday: existingUser.birthday,
            interests: existingUser.interests || []
          });

          // Set authentication cookie via API
          await fetch('/api/set-auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: existingUser.id })
          });

          setLoggedIn(true);
          // if (typeof window !== "undefined") {
          //   window.location.reload();
          // }
          return;
        }
      }
      
      // User doesn't exist - proceed with registration
      setUser({ ...user, phoneNumber: phone });
      setShowName(true);
      
    } catch (error) {
      console.error('Error checking user:', error);
      // Fallback to registration flow
      setUser({ ...user, phoneNumber: phone });
      setShowName(true);
    } finally {
      setIsChecking(false);
    }
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
        paddingTop: 20,
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
        <div style={{ marginTop: 75, textAlign: "center" }}>
          <div style={{ color: "#fff", fontSize: 18, marginBottom: 8 }}>
            {isChecking ? "Checking account..." : "Sign up or sign in with your phone number"}
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
                  handlePhoneSubmit();
                }
              }}
            />
            {phone.length === 10 && (
              <button
                aria-label="Continue"
                onClick={e => {
                  e.preventDefault();
                  handlePhoneSubmit();
                }}
                disabled={isChecking}
                type="button"
                style={{
                  position: "absolute",
                  right: 10,
                  background: "none",
                  border: "none",
                  cursor: isChecking ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  height: 32,
                  opacity: isChecking ? 0.6 : 1
                }}
                tabIndex={0}
              >
                {isChecking ? (
                  <div style={{ 
                    width: 20, 
                    height: 20, 
                    border: "2px solid #fff", 
                    borderTop: "2px solid transparent", 
                    borderRadius: "50%", 
                    animation: "spin 1s linear infinite" 
                  }} />
                ) : (
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="14" cy="14" r="14" fill="#fff" fillOpacity="0.15"/>
                    <path d="M11 9l5 5-5 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
        {/* <div style={{ marginTop: 40, textAlign: "center" }}>
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
                  cursor: "pointer",
                  boxShadow: "0 4px 0 #2d357a, 0 2px 8px rgba(0,0,0,0.15)",
                  transition: "transform 0.1s, box-shadow 0.1s"
                }}
                className="catch-3d-btn"
                onClick={() => {
                  setCatchTarget(person);
                  setShowCatch(true);
                }}
                >
                Catch
                </button>
                <style>{`
                .catch-3d-btn:hover, .catch-3d-btn:focus {
                  transform: translateY(-4px) scale(1.04);
                  box-shadow: 0 8px 0 #2d357a, 0 4px 16px rgba(0,0,0,0.18);
                  outline: none;
                }
                .catch-3d-btn:active {
                  transform: translateY(2px) scale(0.98);
                  box-shadow: 0 2px 0 #2d357a, 0 1px 4px rgba(0,0,0,0.12);
                }
                `}</style>
            </div>
          ))}
        </div> */}
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
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
    </div>
  );
}
