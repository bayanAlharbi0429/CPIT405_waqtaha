// Home page (public): animated hero with the sun mascot
import { Link } from "react-router-dom";
import SunMascot from "../components/SunMascot";
import TiltCard from "../components/TiltCard";
import ScoreRing from "../components/ScoreRing";

// Example cards only, to show what the app does
const DEMO = [
  { icon: "🏃", label: "Running", text: "Cool mornings beat hot noons.", score: 86 },
  { icon: "📷", label: "Photography", text: "Golden hour and clear skies.", score: 72 },
  { icon: "🏖️", label: "Beach", text: "Sun, low wind, no rain.", score: 41 },
];

export default function Home() {
  return (
    <div className="hero">
      <div className="reveal" style={{ "--i": 0 }}>
        <SunMascot />
      </div>

      <h1 className="reveal" style={{ "--i": 1 }}>
        Find your <span className="scribble">perfect hour</span>
      </h1>

      <p className="hero-sub reveal" style={{ "--i": 2 }}>
        Pick a destination and an activity. Waqtaha scores every hour of the
        forecast and tells you the best time to go.
      </p>

      <div className="hero-actions reveal" style={{ "--i": 3 }}>
        <Link to="/register" className="btn">Get started</Link>
        <Link to="/login" className="btn btn-ghost">Log in</Link>
      </div>

      <div className="activity-grid">
        {DEMO.map((a, i) => (
          <TiltCard
            key={a.label}
            className="glass activity-card reveal"
            style={{ "--i": 4 + i }}
          >
            <ScoreRing score={a.score} size={76} />
            <div>
              <h3>{a.icon} {a.label}</h3>
              <p>{a.text}</p>
            </div>
          </TiltCard>
        ))}
      </div>
      <p className="hint reveal" style={{ "--i": 7 }}>
        Example scores. Move your mouse over the cards.
      </p>
    </div>
  );
}