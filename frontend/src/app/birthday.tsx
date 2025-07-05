"use client";
import React, { useState } from "react";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();

export default function BirthdayPage({ onContinue }: { onContinue?: () => void }) {
  const [month, setMonth] = useState(11); // December
  const [day, setDay] = useState(2);
  const [year, setYear] = useState(2005);

  // Update day if month/year changes and current day is out of range
  React.useEffect(() => {
    const maxDay = daysInMonth(month, year);
    if (day > maxDay) setDay(maxDay);
  }, [month, year]);

  return (
    <div
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
      <div style={{ width: "100%", maxWidth: 400, margin: "0 auto" }}>
        <div style={{ marginTop: 120, textAlign: "center" }}>
          <div style={{ color: "#fff", fontSize: 32, fontWeight: 700, marginBottom: 32 }}>
            Your birthday
          </div>
          <div style={{
            background: "rgba(255,255,255,0.95)",
            borderRadius: 32,
            padding: 24,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 12,
            fontSize: 22,
            fontWeight: 500,
            color: "#222",
            margin: "0 auto 40px auto",
            width: 320,
            boxShadow: "0 2px 16px 0 rgba(0,0,0,0.08)"
          }}>
            <select value={month} onChange={e => setMonth(Number(e.target.value))} style={{ fontSize: 22, border: "none", background: "none", color: "#222" }}>
              {months.map((m, i) => (
                <option key={m} value={i}>{m}</option>
              ))}
            </select>
            <select value={day} onChange={e => setDay(Number(e.target.value))} style={{ fontSize: 22, border: "none", background: "none", color: "#222" }}>
              {Array.from({ length: daysInMonth(month, year) }, (_, i) => i + 1).map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <select value={year} onChange={e => setYear(Number(e.target.value))} style={{ fontSize: 22, border: "none", background: "none", color: "#222" }}>
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <button
            style={{
              width: 320,
              background: "#000",
              color: "#fff",
              border: "none",
              borderRadius: 20,
              padding: "16px 0",
              fontSize: 18,
              fontWeight: 500,
              marginTop: 24,
              cursor: "pointer"
            }}
            onClick={onContinue || (() => alert(`Birthday: ${months[month]} ${day}, ${year}`))}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
