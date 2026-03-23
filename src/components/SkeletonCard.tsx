//src\components\SkeletonCard.tsx

import type { FC } from "react";

interface SkeletonCardProps {
  delay?: number;
}

const SkeletonCard: FC<SkeletonCardProps> = ({ delay = 0 }) => (
  <div
    style={{
      background: "linear-gradient(145deg, #252530, #2a2a38)",
      borderRadius: 16,
      padding: "24px 20px",
      border: "1px solid rgba(255,255,255,.06)",
      animation: `shimmer 1.5s infinite ${delay}s`,
      minHeight: 130,
    }}
  >
    <div
      style={{
        width: "60%",
        height: 14,
        background: "#333",
        borderRadius: 6,
        marginBottom: 18,
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
          background: "#333",
          borderRadius: "50%",
        }}
      />
      <div
        style={{ width: 52, height: 28, background: "#333", borderRadius: 14 }}
      />
    </div>
  </div>
);

export default SkeletonCard;
