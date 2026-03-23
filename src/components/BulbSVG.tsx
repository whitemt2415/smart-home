//src\components\BulbSVG.tsx

import type { FC } from "react";

interface BulbSVGProps {
  on: boolean;
  size?: number;
}

const BulbSVG: FC<BulbSVGProps> = ({ on, size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path
      d="M24 6C18.477 6 14 10.477 14 16c0 3.866 2.197 7.211 5.412 8.874.452.234.588.582.588.926V29h8v-3.2c0-.344.136-.692.588-.926C31.803 23.211 34 19.866 34 16c0-5.523-4.477-10-10-10z"
      fill={on ? "#FFD93D" : "#3a3a4a"}
      stroke={on ? "#FFAB00" : "#555"}
      strokeWidth="1.5"
      style={{ transition: "all 0.5s ease" }}
    />
    <rect
      x="18"
      y="30"
      width="12"
      height="2"
      rx="1"
      fill={on ? "#FFAB00" : "#555"}
      style={{ transition: "fill 0.5s" }}
    />
    <rect
      x="19"
      y="33"
      width="10"
      height="2"
      rx="1"
      fill={on ? "#FFAB00" : "#555"}
      style={{ transition: "fill 0.5s" }}
    />
    <rect
      x="20"
      y="36"
      width="8"
      height="2"
      rx="1"
      fill={on ? "#FFAB00" : "#555"}
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

export default BulbSVG;
