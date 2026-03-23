import type { FC } from "react";

interface ToggleDotProps {
  on: boolean;
}

const ToggleDot: FC<ToggleDotProps> = ({ on }) => (
  <div style={{
    position: "relative",
    width: 42, height: 24, borderRadius: 12,
    background: on ? "linear-gradient(135deg, #4CE182, #2DA85A)" : "#2a2a38",
    boxShadow: on ? "0 0 16px rgba(76,225,130,.25), inset 0 1px 0 rgba(255,255,255,.15)" : "inset 0 2px 6px rgba(0,0,0,.3)",
    transition: "all .4s cubic-bezier(.34,1.56,.64,1)",
    flexShrink: 0, pointerEvents: "none",
  }}>
    <div style={{
      position: "absolute", top: 3,
      left: on ? 21 : 3,
      width: 18, height: 18, borderRadius: "50%",
      background: on ? "#fff" : "#666",
      transition: "all .4s cubic-bezier(.34,1.56,.64,1)",
      boxShadow: on ? "0 2px 8px rgba(0,0,0,.2)" : "0 1px 3px rgba(0,0,0,.3)",
    }}/>
  </div>
);

export default ToggleDot;