// SunMascot: a friendly sun whose eyes follow the cursor.
// The "mood" prop changes the mouth and adds small accessories.
import { useEffect, useId, useRef, useState } from "react";

const MOUTHS = {
  default: "M78 124 Q100 142 122 124",
  sunTiming: "M74 122 Q100 150 126 122",
  temperature: "M74 128 q9 -9 18 0 t18 0 t18 0",
  humidity: "M84 128 L116 128",
  wind: "M80 124 Q100 138 120 124",
  uv: "M80 126 Q104 140 124 120",
  clouds: "M82 128 Q100 132 118 128",
  rain: "M80 134 Q100 118 120 134",
};

const CLOUD = (
  <g fill="#e5e9f5">
    <ellipse cx="150" cy="52" rx="22" ry="12" />
    <ellipse cx="138" cy="46" rx="12" ry="10" />
    <ellipse cx="158" cy="44" rx="13" ry="11" />
  </g>
);

function Accessories({ mood }) {
  switch (mood) {
    case "temperature": // sweat drop
      return <path d="M148 58 Q157 72 148 82 Q139 72 148 58 Z" fill="#7dd3fc" />;
    case "humidity": // water drops
      return (
        <g fill="#7dd3fc">
          <path d="M146 60 Q154 72 146 80 Q138 72 146 60 Z" />
          <path d="M58 66 Q65 76 58 83 Q51 76 58 66 Z" />
          <path d="M152 100 Q158 108 152 114 Q146 108 152 100 Z" />
        </g>
      );
    case "wind": // air lines
      return (
        <g fill="none" stroke="#9fd8ff" strokeWidth="4" strokeLinecap="round">
          <path d="M4 82 Q20 72 38 82" />
          <path d="M2 102 Q20 92 40 102" />
          <path d="M6 122 Q22 112 38 122" />
        </g>
      );
    case "uv": // sunglasses
      return (
        <g fill="#12121f">
          <rect x="60" y="82" width="34" height="24" rx="8" />
          <rect x="106" y="82" width="34" height="24" rx="8" />
          <rect x="92" y="88" width="16" height="4" />
          <path d="M66 90 L76 90" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
          <path d="M112 90 L122 90" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
        </g>
      );
    case "clouds":
      return CLOUD;
    case "rain":
      return (
        <>
          {CLOUD}
          <g stroke="#7dd3fc" strokeWidth="3" strokeLinecap="round">
            <path d="M140 68 L137 78" />
            <path d="M150 68 L147 78" />
            <path d="M160 68 L157 78" />
          </g>
        </>
      );
    case "sunTiming": // rosy cheeks
      return (
        <g fill="#ff5d8f" opacity="0.45">
          <circle cx="64" cy="116" r="7" />
          <circle cx="136" cy="116" r="7" />
        </g>
      );
    default:
      return null;
  }
}

export default function SunMascot({ className = "", mood = null }) {
  const ref = useRef(null);
  const [look, setLook] = useState({ x: 0, y: 0 });

  // Each sun needs its own gradient id (several suns can be on the same page)
  const gradientId = "sunFill" + useId().replace(/:/g, "");

  useEffect(() => {
    let frame = null;

    function onMove(e) {
      if (frame) return; // one update per animation frame
      frame = requestAnimationFrame(() => {
        frame = null;
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        const dist = Math.hypot(dx, dy) || 1;
        // The farther the cursor, the more the pupils move (max 6 units)
        const strength = Math.min(dist / 250, 1) * 6;
        setLook({ x: (dx / dist) * strength, y: (dy / dist) * strength });
      });
    }

    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const pupilStyle = { transform: `translate(${look.x}px, ${look.y}px)` };
  const mouth = MOUTHS[mood] || MOUTHS.default;

  return (
    <svg
      ref={ref}
      className={`sun ${className}`}
      viewBox="0 0 200 200"
      role="img"
      aria-label="A friendly sun whose eyes follow your cursor"
    >
      <defs>
        <radialGradient id={gradientId} cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#ffe08a" />
          <stop offset="60%" stopColor="#ffa94d" />
          <stop offset="100%" stopColor="#ff6b6b" />
        </radialGradient>
      </defs>

      <g className="sun-rays">
        {Array.from({ length: 12 }).map((_, i) => (
          <rect
            key={i}
            x="96"
            y="8"
            width="8"
            height={i % 2 ? 22 : 28}
            rx="4"
            fill="#ffb347"
            transform={`rotate(${i * 30} 100 100)`}
          />
        ))}
      </g>

      <circle cx="100" cy="100" r="62" fill={`url(#${gradientId})`} />

      <g className="sun-eyes">
        <circle cx="80" cy="94" r="16" fill="#fff8e7" />
        <circle cx="120" cy="94" r="16" fill="#fff8e7" />
        <circle className="pupil" cx="80" cy="94" r="8" fill="#1a1a2e" style={pupilStyle} />
        <circle className="pupil" cx="120" cy="94" r="8" fill="#1a1a2e" style={pupilStyle} />
      </g>

      <path d={mouth} stroke="#7a2e1d" strokeWidth="5" strokeLinecap="round" fill="none" />

      <Accessories mood={mood} />
    </svg>
  );
}