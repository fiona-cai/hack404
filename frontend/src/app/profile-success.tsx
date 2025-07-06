"use client";
import { useSearchParams, useRouter } from "next/navigation";

export default function ProfileSuccessPage() {
  const searchParams = useSearchParams();
  const name = searchParams.get("name") || "Mystery Person";
  const avatar = searchParams.get("avatar") || "/images/icon.png";
  const router = useRouter();

  return (
    <div style={{ minHeight: "100vh", width: "100vw", background: "linear-gradient(120deg, #4e54c8 0%, #8f94fb 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <img src={avatar} alt={name} style={{ width: 120, height: 120, borderRadius: "50%", border: "3px solid #fff", marginBottom: 16, boxShadow: "0 8px 32px #0006" }} />
        <h2 style={{ color: "#fff", fontSize: 28, marginBottom: 8 }}>You caught {name}!</h2>
        <div style={{ color: "#fff", fontSize: 20, marginBottom: 24 }}>Connection made!</div>
        <button
          onClick={() => router.replace("/")}
          style={{ background: "#fff", color: "#4e54c8", border: "none", borderRadius: 16, padding: "12px 32px", fontWeight: 700, fontSize: 20, cursor: "pointer", marginTop: 24 }}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
