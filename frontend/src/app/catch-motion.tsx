"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function CatchMotionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const name = searchParams.get("name") || "Mystery Person";
  const avatar = searchParams.get("avatar") || "/images/icon.png";
  const [ready, setReady] = useState(false);
  const [caught, setCaught] = useState(false);
  const [motionDetected, setMotionDetected] = useState(false);
  const motionRef = useRef(false);

  useEffect(() => {
    function handleMotion(event: DeviceMotionEvent) {
      // Detect a strong swing (e.g., bowling motion)
      const y = event.accelerationIncludingGravity?.y || 0;
      const z = event.accelerationIncludingGravity?.z || 0;
      // Threshold: strong downward motion
      if (!motionRef.current && (y > 15 || z > 15)) {
        motionRef.current = true;
        setMotionDetected(true);
        setTimeout(() => {
          setCaught(true);
          setTimeout(() => {
            router.replace(`/profile-success?name=${encodeURIComponent(name)}&avatar=${encodeURIComponent(avatar)}`);
          }, 1200);
        }, 800);
      }
    }
    if (ready && typeof window !== "undefined") {
      window.addEventListener("devicemotion", handleMotion);
      return () => window.removeEventListener("devicemotion", handleMotion);
    }
  }, [ready, name, avatar, router]);

  return (
    <div style={{ minHeight: "100vh", width: "100vw", background: "linear-gradient(120deg, #4e54c8 0%, #8f94fb 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <img src={avatar} alt={name} style={{ width: 120, height: 120, borderRadius: "50%", border: "3px solid #fff", marginBottom: 16, boxShadow: "0 8px 32px #0006" }} />
        <h2 style={{ color: "#fff", fontSize: 28, marginBottom: 8 }}>{caught ? `You caught ${name}!` : `Catch ${name}`}</h2>
        <div style={{ color: "#fff", fontSize: 18, marginBottom: 24 }}>
          {caught ? "Connection made!" : motionDetected ? "Nice throw!" : "Swing your phone like a bowling ball to catch!"}
        </div>
        {!ready && (
          <button
            onClick={() => setReady(true)}
            style={{ background: "#fff", color: "#4e54c8", border: "none", borderRadius: 16, padding: "12px 32px", fontWeight: 700, fontSize: 20, cursor: "pointer", marginTop: 24 }}
          >
            Start Catch
          </button>
        )}
        {ready && !caught && (
          <div style={{ color: "#fff", fontSize: 16, marginTop: 16, opacity: 0.7 }}>Waiting for your bowling motion...</div>
        )}
        {caught && (
          <div style={{ fontSize: 48, marginTop: 24 }}>🎳</div>
        )}
      </div>
    </div>
  );
}
