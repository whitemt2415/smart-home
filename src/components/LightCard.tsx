import { useState, type FC, type KeyboardEvent } from "react";
import type { Light } from "../types/light";
import BulbSVG from "./BulbSVG";
import ToggleDot from "./ToggleDot";

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
          ? "linear-gradient(145deg, #2a3a38, #304845)"
          : "linear-gradient(145deg, #2e2e3e, #353548)",
        borderRadius: 16,
        padding: "22px 20px",
        border: s ? "1px solid rgba(76,225,130,.18)" : "1px solid rgba(255,255,255,.1)",
        transition: "all .4s ease, transform .15s ease, box-shadow .3s ease",
        overflow: "hidden",
        cursor: "pointer",
        userSelect: "none",
        WebkitTapHighlightColor: "transparent",
        transform: pressed ? "scale(0.95)" : "scale(1)",
        boxShadow: s ? "0 4px 24px rgba(76,225,130,.1)" : "0 2px 8px rgba(0,0,0,.1)",
        animation: `fadeSlideIn .5s ${index * 0.07}s both cubic-bezier(.22,1,.36,1)`,
        outline: "none",
      }}
    >
      {s && <div style={{
        position: "absolute", top: -40, left: "50%", transform: "translateX(-50%)",
        width: 140, height: 100, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(76,225,130,.2) 0%, transparent 70%)",
        filter: "blur(15px)", pointerEvents: "none",
      }}/>}

      {pressed && <div style={{
        position: "absolute", inset: 0, borderRadius: 16,
        background: s ? "rgba(76,225,130,.08)" : "rgba(255,255,255,.05)",
        pointerEvents: "none",
      }}/>}

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, gap: 8 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              color: s ? "#fff" : "#bbb",
              fontSize: 18,
              fontWeight: 600,
              fontFamily: "'Kanit', sans-serif",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              transition: "color .4s ease",
              lineHeight: 1.3,
            }}>{label}</div>
          </div>
          <span style={{
            fontSize: 10, fontWeight: 600,
            fontFamily: "'JetBrains Mono', monospace",
            color: s ? "rgba(76,225,130,.85)" : "#777",
            background: s ? "rgba(76,225,130,.12)" : "rgba(255,255,255,.06)",
            padding: "3px 8px", borderRadius: 6,
            letterSpacing: ".5px", flexShrink: 0,
            transition: "all .4s ease",
          }}>#{id}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <BulbSVG on={s} size={34} />
            <span style={{
              fontSize: 12,
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 600,
              color: s ? "#4CE182" : "#888",
              letterSpacing: ".5px",
              transition: "color .4s ease",
            }}>{s ? "ON" : "OFF"}</span>
          </div>
          <ToggleDot on={s} />
        </div>
      </div>
    </div>
  );
};

export default LightCard;