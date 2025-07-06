"use client";
import { useState } from "react";
import { User } from "./page";

export default function NamePage({ user, setUser, onContinue }: { user: User; setUser: React.Dispatch<React.SetStateAction<User>>; onContinue: () => void }) {
  const [name, setName] = useState(user.name || "");
  const [error, setError] = useState("");

  function handleContinue() {
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    setUser({ ...user, name: name.trim() });
    onContinue(); // This will now trigger the avatar page in the parent
  }

  return (
    <div className="animated-bg" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", paddingTop: 40 }}>
      <div style={{ width: "100%", maxWidth: 400, margin: "0 auto", maxHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "flex-start" }}>
        <div style={{ marginTop: 100, textAlign: "center" }}>
          <div style={{ color: "#fff", fontSize: 28, fontWeight: 500, marginBottom: 24 }}>
            What&apos;s your name?
          </div>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={e => { setName(e.target.value); setError(""); }}
            style={{
              background: "#000",
              border: "none",
              outline: "none",
              color: "#fff",
              fontSize: 24,
              borderRadius: 20,
              padding: "12px 20px",
              width: "100%",
              marginBottom: 16
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') handleContinue();
            }}
            autoFocus
          />
          {error && <div style={{ color: "#ffbaba", marginBottom: 8 }}>{error}</div>}
          <button
            onClick={handleContinue}
            style={{
              background: name.trim() ? "#4e54c8" : "#444",
              color: "#fff",
              border: "none",
              borderRadius: 20,
              padding: "14px 0",
              fontSize: 18,
              fontWeight: 500,
              width: "100%",
              cursor: name.trim() ? "pointer" : "not-allowed"
            }}
            disabled={!name.trim()}
          >Continue</button>
        </div>
      </div>
    </div>
  );
}
