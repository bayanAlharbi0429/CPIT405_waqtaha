// ScoreRing: animated circular score (0-100) with a text label.
// The label means the meaning never depends on color alone (accessibility).
import { useEffect, useState } from "react";

export default function ScoreRing({ score, size = 96 }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  const level = score >= 70 ? "good" : score >= 40 ? "mid" : "bad";
  const label = { good: "Excellent", mid: "Medium", bad: "Poor" }[level];

  // Start from 0 so the ring fills with an animation when it appears
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setShown(score), 150);
    return () => clearTimeout(t);
  }, [score]);

  const offset = circumference * (1 - shown / 100);

  return (
    <div
      className={`ring ring-${level}`}
      role="img"
      aria-label={`Score ${score} out of 100, ${label}`}
    >
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle className="ring-track" cx="50" cy="50" r={radius} fill="none" strokeWidth="9" />
        <circle
          className="ring-value"
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
        />
        <text className="ring-number" x="50" y="58" textAnchor="middle">
          {score}
        </text>
      </svg>
      <span className="ring-label">{label}</span>
    </div>
  );
}