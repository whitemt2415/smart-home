// src/App.tsx

import { useState, useEffect, type FC } from "react";
import { useLights } from "./hooks/useLights";
import LightCard from "./components/LightCard";
import SkeletonCard from "./components/SkeletonCard";

const App: FC = () => {
  const { lights, loading, connected, busy, toggle, allOff, allOn } = useLights();
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const onCount: number = lights.filter((l) => l.s).length;
  const totalCount: number = lights.length;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#6d6d79",
        fontFamily: "'Kanit', sans-serif",
        color: "#fff",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <style>{`
        @keyframes shimmer { 0%,100%{opacity:.5} 50%{opacity:.8} }
        @keyframes fadeSlideIn { from{opacity:0;transform:translateY(16px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes spin { to{transform:rotate(360deg)} }
        *{box-sizing:border-box;margin:0;padding:0}

        .light-card:focus-visible { outline:2px solid #FFAB00; outline-offset:2px; }
        .light-card:hover { filter:brightness(1.1); }

        .sticky-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(46,61,121,.9);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255,255,255,.06);
        }

        .grid-lights {
          display:grid; grid-template-columns:1fr;
          gap:12px; padding:20px 16px 32px;
          max-width:1200px; margin:0 auto;
        }
        @media(min-width:480px){ .grid-lights{grid-template-columns:repeat(2,1fr);gap:14px;padding:20px 20px 32px} }
        @media(min-width:768px){ .grid-lights{grid-template-columns:repeat(3,1fr);gap:16px;padding:24px 28px 40px} }
        @media(min-width:1024px){ .grid-lights{grid-template-columns:repeat(4,1fr);gap:18px;padding:28px 36px 48px} }

        .header-inner{padding:16px 16px 14px;max-width:1200px;margin:0 auto}
        @media(min-width:480px){.header-inner{padding:18px 20px 16px}}
        @media(min-width:768px){.header-inner{padding:20px 28px 18px}}

        .stats-row{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;margin-top:12px}
        @media(min-width:480px){.stats-row{gap:10px;margin-top:14px}}
        @media(min-width:768px){.stats-row{gap:14px}}

        .stat-box{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:10px 8px;text-align:center}
        .stat-num{font-size:18px;font-weight:700;font-family:'JetBrains Mono',monospace;line-height:1.2}
        @media(min-width:768px){.stat-num{font-size:24px}.stat-box{padding:14px 12px}}
        .stat-label{font-size:10px;font-family:'JetBrains Mono',monospace;color:#dfdfdf;letter-spacing:.5px;margin-top:2px}

        .btn-action{
          background:rgba(255,255,255,.05);
          border:1px solid rgba(255,255,255,.1);
          border-radius:10px;padding:10px 8px;
          cursor:pointer;font-family:'Kanit',sans-serif;
          font-size:11px;font-weight:500;
          transition:all .2s ease;text-align:center;
          display:flex;flex-direction:column;
          align-items:center;justify-content:center;gap:2px;
        }
        .btn-action:hover:not(:disabled){transform:scale(1.03);background:rgba(255,255,255,.09)}
        .btn-action:active:not(:disabled){transform:scale(.97)}
        .btn-action:disabled{
          opacity:.4;cursor:not-allowed;transform:none;
        }
        .spinner{
          width:14px;height:14px;border:2px solid rgba(255,255,255,.3);
          border-top-color:#fff;border-radius:50%;
          animation:spin .7s linear infinite;
        }
      `}</style>

      {/* ===== STICKY HEADER ===== */}
      <div className="sticky-header">
        <div className="header-inner">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h1
              style={{
                fontSize: "clamp(18px, 3.5vw, 24px)",
                fontWeight: 700,
                lineHeight: 1.2,
                background: "linear-gradient(100deg, #ffffff, #e7e7e7)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {" "}Smart Home
            </h1>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  fontSize: 10,
                  color: "#dfdfdf",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {time.toLocaleTimeString("th-TH")}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: connected ? "#4CAF50" : "#FF5252",
                    boxShadow: connected ? "0 0 8px rgba(76,175,80,.5)" : "none",
                    animation: connected ? "pulse 2s infinite" : "none",
                  }}
                />
                <span
                  style={{
                    fontSize: 10,
                    fontFamily: "'JetBrains Mono', monospace",
                    color: connected ? "#66BB6A" : "#FF5252",
                  }}
                >
                  {connected ? "ONLINE" : "OFFLINE"}
                </span>
              </div>
            </div>
          </div>

          <div className="stats-row">
            <div className="stat-box">
              <div className="stat-num" style={{ color: "#FFAB00" }}>
                {onCount}
              </div>
              <div className="stat-label">ON</div>
            </div>
            <div className="stat-box">
              <div className="stat-num" style={{ color: "#66BB6A" }}>
                {totalCount}
              </div>
              <div className="stat-label">DEVICES</div>
            </div>

            {/* ✅ ลำดับ: ปิดหมด (ซ้าย) → เปิดหมด (ขวา) */}
            <button
              className="btn-action"
              style={{ color: "#FF5252", borderColor: "rgba(255,82,82,.15)" }}
              onClick={allOff}
              disabled={busy}
              aria-label="ปิดหมด"
            >
              {busy ? (
                <div className="spinner" />
              ) : (
                <span style={{ fontSize: 14 }}>🔴</span>
              )}
              <span>ปิดหมด</span>
            </button>

            <button
              className="btn-action"
              style={{ color: "#FFAB00", borderColor: "rgba(255,171,0,.15)" }}
              onClick={allOn}
              disabled={busy}
              aria-label="เปิดหมด"
            >
              {busy ? (
                <div className="spinner" />
              ) : (
                <span style={{ fontSize: 14 }}>🟡</span>
              )}
              <span>เปิดหมด</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===== GRID ===== */}
      <div className="grid-lights">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} delay={i * 0.12} />
            ))
          : lights.map((light, i) => (
              <LightCard
                key={light.id}
                light={light}
                onToggle={toggle}
                index={i}
              />
            ))}
      </div>

      {!loading && lights.length === 0 && (
        <div
          style={{ textAlign: "center", padding: "60px 20px", color: "#666" }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>💡</div>
          <div
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}
          >
            ไม่มีอุปกรณ์ที่ active
          </div>
        </div>
      )}
    </div>
  );
};

export default App;