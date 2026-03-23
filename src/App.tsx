import {
  useState,
  useEffect,
  useCallback,
  type FC,
  type KeyboardEvent,
} from "react";
import { supabase, type Light } from "./lib/supabase";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

// ===== COMPONENTS =====
const BulbSVG: FC<{ on: boolean; size?: number }> = ({ on, size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path
      d="M24 6C18.477 6 14 10.477 14 16c0 3.866 2.197 7.211 5.412 8.874.452.234.588.582.588.926V29h8v-3.2c0-.344.136-.692.588-.926C31.803 23.211 34 19.866 34 16c0-5.523-4.477-10-10-10z"
      fill={on ? "#FFD93D" : "#2a2a3a"}
      stroke={on ? "#FFAB00" : "#3d3d50"}
      strokeWidth="1.5"
      style={{ transition: "all 0.5s ease" }}
    />
    <rect
      x="18"
      y="30"
      width="12"
      height="2"
      rx="1"
      fill={on ? "#FFAB00" : "#3d3d50"}
      style={{ transition: "fill 0.5s" }}
    />
    <rect
      x="19"
      y="33"
      width="10"
      height="2"
      rx="1"
      fill={on ? "#FFAB00" : "#3d3d50"}
      style={{ transition: "fill 0.5s" }}
    />
    <rect
      x="20"
      y="36"
      width="8"
      height="2"
      rx="1"
      fill={on ? "#FFAB00" : "#3d3d50"}
      style={{ transition: "fill 0.5s" }}
    />
    {on && (
      <>
        <line
          x1="24"
          y1="1"
          x2="24"
          y2="4"
          stroke="#FFD93D"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity=".5"
        >
          <animate
            attributeName="opacity"
            values=".3;.7;.3"
            dur="2s"
            repeatCount="indefinite"
          />
        </line>
        <line
          x1="37"
          y1="9"
          x2="35"
          y2="11"
          stroke="#FFD93D"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity=".5"
        >
          <animate
            attributeName="opacity"
            values=".3;.7;.3"
            dur="2s"
            begin=".3s"
            repeatCount="indefinite"
          />
        </line>
        <line
          x1="11"
          y1="9"
          x2="13"
          y2="11"
          stroke="#FFD93D"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity=".5"
        >
          <animate
            attributeName="opacity"
            values=".3;.7;.3"
            dur="2s"
            begin=".6s"
            repeatCount="indefinite"
          />
        </line>
        <line
          x1="7"
          y1="16"
          x2="10"
          y2="16"
          stroke="#FFD93D"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity=".4"
        />
        <line
          x1="38"
          y1="16"
          x2="41"
          y2="16"
          stroke="#FFD93D"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity=".4"
        />
      </>
    )}
  </svg>
);

const ToggleDot: FC<{ on: boolean }> = ({ on }) => (
  <div
    style={{
      position: "relative",
      width: 42,
      height: 24,
      borderRadius: 12,
      background: on ? "linear-gradient(135deg, #FFAB00, #FF6D00)" : "#1e1e2e",
      boxShadow: on
        ? "0 0 16px rgba(255,171,0,.2), inset 0 1px 0 rgba(255,255,255,.15)"
        : "inset 0 2px 6px rgba(0,0,0,.5)",
      transition: "all .4s cubic-bezier(.34,1.56,.64,1)",
      flexShrink: 0,
      pointerEvents: "none",
    }}
  >
    <div
      style={{
        position: "absolute",
        top: 3,
        left: on ? 21 : 3,
        width: 18,
        height: 18,
        borderRadius: "50%",
        background: on ? "#fff" : "#555",
        transition: "all .4s cubic-bezier(.34,1.56,.64,1)",
        boxShadow: on ? "0 2px 8px rgba(0,0,0,.2)" : "0 1px 3px rgba(0,0,0,.3)",
      }}
    />
  </div>
);

const SkeletonCard: FC<{ delay?: number }> = ({ delay = 0 }) => (
  <div
    style={{
      background: "linear-gradient(145deg, #16161e, #1a1a26)",
      borderRadius: 16,
      padding: "24px 20px",
      border: "1px solid rgba(255,255,255,.03)",
      animation: `shimmer 1.5s infinite ${delay}s`,
      minHeight: 120,
    }}
  >
    <div
      style={{
        width: "60%",
        height: 12,
        background: "#222",
        borderRadius: 6,
        marginBottom: 16,
      }}
    />
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          background: "#222",
          borderRadius: "50%",
        }}
      />
      <div
        style={{ width: 52, height: 28, background: "#222", borderRadius: 14 }}
      />
    </div>
  </div>
);

interface LightCardProps {
  light: Light;
  onToggle: (id: number) => void;
  index: number;
}

const LightCard: FC<LightCardProps> = ({ light, onToggle, index }) => {
  const { id, s, label } = light;
  const [pressed, setPressed] = useState<boolean>(false);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggle(id);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onToggle(id)}
      onKeyDown={handleKeyDown}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      className="light-card"
      style={{
        position: "relative",
        background: s
          ? "linear-gradient(145deg, #1f1a2e, #261e38)"
          : "linear-gradient(145deg, #13131b, #181822)",
        borderRadius: 16,
        padding: "20px 18px",
        border: s
          ? "1px solid rgba(255,171,0,.12)"
          : "1px solid rgba(255,255,255,.03)",
        transition: "all .4s ease, transform .15s ease, box-shadow .3s ease",
        overflow: "hidden",
        cursor: "pointer",
        userSelect: "none",
        WebkitTapHighlightColor: "transparent",
        transform: pressed ? "scale(0.95)" : "scale(1)",
        boxShadow: s ? "0 4px 24px rgba(255,171,0,.06)" : "none",
        animation: `fadeSlideIn .5s ${index * 0.07}s both cubic-bezier(.22,1,.36,1)`,
        outline: "none",
      }}
    >
      {s && (
        <div
          style={{
            position: "absolute",
            top: -40,
            left: "50%",
            transform: "translateX(-50%)",
            width: 140,
            height: 100,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,200,0,.2) 0%, transparent 70%)",
            filter: "blur(15px)",
            pointerEvents: "none",
          }}
        />
      )}

      {pressed && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 16,
            background: s ? "rgba(255,171,0,.06)" : "rgba(255,255,255,.03)",
            pointerEvents: "none",
          }}
        />
      )}

      <div style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 14,
            gap: 8,
          }}
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                color: s ? "#f0e6d6" : "#888",
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "'Kanit', sans-serif",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                transition: "color .4s ease",
              }}
            >
              {label}
            </div>
          </div>
          <span
            style={{
              fontSize: 9,
              fontWeight: 600,
              fontFamily: "'JetBrains Mono', monospace",
              color: s ? "rgba(255,171,0,.6)" : "#444",
              background: s ? "rgba(255,171,0,.08)" : "rgba(255,255,255,.03)",
              padding: "2px 7px",
              borderRadius: 6,
              letterSpacing: ".5px",
              flexShrink: 0,
              transition: "all .4s ease",
            }}
          >
            #{id}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <BulbSVG on={s} size={32} />
            <span
              style={{
                fontSize: 11,
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600,
                color: s ? "#FFAB00" : "#555",
                letterSpacing: ".5px",
                transition: "color .4s ease",
              }}
            >
              {s ? "ON" : "OFF"}
            </span>
          </div>
          <ToggleDot on={s} />
        </div>
      </div>
    </div>
  );
};

// ===== MAIN APP =====
const App: FC = () => {
  const [lights, setLights] = useState<Light[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [connected, setConnected] = useState<boolean>(false);
  const [time, setTime] = useState<Date>(new Date());

  // ดึงข้อมูลครั้งแรก + subscribe realtime
  useEffect(() => {
    // 1) fetch เฉพาะ act = true
    const fetchLights = async (): Promise<void> => {
      const { data, error } = await supabase
        .from("lights")
        .select("*")
        .eq("act", true)
        .order("id");

      if (!error && data) {
        setLights(data as Light[]);
      }
      setLoading(false);
    };

    fetchLights();

    // 2) subscribe realtime — รับทุก event (INSERT, UPDATE, DELETE)
    const channel = supabase
      .channel("lights-realtime")
      .on<Light>(
        "postgres_changes",
        { event: "*", schema: "public", table: "lights" },
        (payload: RealtimePostgresChangesPayload<Light>) => {
          const row = payload.new as Light;

          setLights((prev) => {
            // ถ้า act = false หรือ DELETE → เอาออกจากหน้าจอ
            if (payload.eventType === "DELETE" || !row.act) {
              return prev.filter(
                (l) => l.id !== (row.id ?? (payload.old as Light).id),
              );
            }

            // ถ้ามีอยู่แล้ว → อัพเดท
            const exists = prev.find((l) => l.id === row.id);
            if (exists) {
              return prev.map((l) => (l.id === row.id ? row : l));
            }

            // ถ้าไม่มี (INSERT หรือ act เพิ่งเปลี่ยนเป็น true) → เพิ่มเข้ามา
            return [...prev, row].sort((a, b) => a.id - b.id);
          });
        },
      )
      .subscribe((status: string) => {
        setConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // toggle → UPDATE supabase (realtime จะ sync กลับมาเอง)
  const toggle = useCallback(
    async (id: number): Promise<void> => {
      const light = lights.find((l) => l.id === id);
      if (!light) return;

      // optimistic update — เปลี่ยน UI ก่อน
      setLights((prev) =>
        prev.map((l) => (l.id === id ? { ...l, s: !l.s } : l)),
      );

      const { error } = await supabase
        .from("lights")
        .update({ s: !light.s })
        .eq("id", id);

      // ถ้า error → rollback
      if (error) {
        setLights((prev) =>
          prev.map((l) => (l.id === id ? { ...l, s: light.s } : l)),
        );
      }
    },
    [lights],
  );

  const allOff = useCallback(async (): Promise<void> => {
    const onIds = lights.filter((l) => l.s).map((l) => l.id);
    if (onIds.length === 0) return;

    setLights((prev) => prev.map((l) => ({ ...l, s: false })));

    const { error } = await supabase
      .from("lights")
      .update({ s: false })
      .in("id", onIds);

    if (error) {
      // refetch ถ้า error
      const { data } = await supabase
        .from("lights")
        .select("*")
        .eq("act", true)
        .order("id");
      if (data) setLights(data as Light[]);
    }
  }, [lights]);

  const allOn = useCallback(async (): Promise<void> => {
    const offIds = lights.filter((l) => !l.s).map((l) => l.id);
    if (offIds.length === 0) return;

    setLights((prev) => prev.map((l) => ({ ...l, s: true })));

    const { error } = await supabase
      .from("lights")
      .update({ s: true })
      .in("id", offIds);

    if (error) {
      const { data } = await supabase
        .from("lights")
        .select("*")
        .eq("act", true)
        .order("id");
      if (data) setLights(data as Light[]);
    }
  }, [lights]);

  const onCount: number = lights.filter((l) => l.s).length;
  const totalCount: number = lights.length;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b0b12",
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
        *{box-sizing:border-box;margin:0;padding:0}

        .light-card:focus-visible { outline:2px solid #FFAB00; outline-offset:2px; }
        .light-card:hover { filter:brightness(1.1); }

        .sticky-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(11,11,18,.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255,255,255,.05);
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

        .stat-box{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.05);border-radius:10px;padding:10px 8px;text-align:center}
        .stat-num{font-size:18px;font-weight:700;font-family:'JetBrains Mono',monospace;line-height:1.2}
        @media(min-width:768px){.stat-num{font-size:24px}.stat-box{padding:14px 12px}}
        .stat-label{font-size:9px;font-family:'JetBrains Mono',monospace;color:#666;letter-spacing:.5px;margin-top:2px}
        @media(min-width:768px){.stat-label{font-size:10px}}

        .btn-action{background:none;border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:10px 8px;cursor:pointer;font-family:'Kanit',sans-serif;font-size:11px;font-weight:500;transition:all .2s ease;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}
        .btn-action:hover{transform:scale(1.03)}
        .btn-action:active{transform:scale(.97)}
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
                background: "linear-gradient(135deg, #FFD93D, #FF8C00)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              🏠 Smart Home
            </h1>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  fontSize: 10,
                  color: "#444",
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
                    boxShadow: connected
                      ? "0 0 8px rgba(76,175,80,.5)"
                      : "none",
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
            <button
              className="btn-action"
              style={{ color: "#FF5252", borderColor: "rgba(255,82,82,.15)" }}
              onClick={allOff}
            >
              <span style={{ fontSize: 14 }}>🔴</span>
              <span>ปิดหมด</span>
            </button>
            <button
              className="btn-action"
              style={{ color: "#FFAB00", borderColor: "rgba(255,171,0,.15)" }}
              onClick={allOn}
            >
              <span style={{ fontSize: 14 }}>🟡</span>
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
          style={{ textAlign: "center", padding: "60px 20px", color: "#444" }}
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
