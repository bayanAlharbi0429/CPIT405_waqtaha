// Home page (public): animated hero with the sun mascot, made for KAU students
import { Link } from "react-router-dom";
import SunMascot from "../components/SunMascot";
import TiltCard from "../components/TiltCard";
import ScoreRing from "../components/ScoreRing";

// Example cards only, to show what the app does
const DEMO = [
  { icon: "⛺", label: "Sports Tent", text: "A calm break between lectures.", score: 78 },
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

      <span className="pill reveal" style={{ "--i": 1 }}>For KAU female students</span>

      <h1 className="reveal" style={{ "--i": 2 }}>
        Find your <span className="scribble">perfect hour</span>
      </h1>

      <p className="tagline reveal" style={{ "--i": 3 }}>
        Less stress, more sunshine.
      </p>

      <p className="hero-sub reveal" style={{ "--i": 4 }}>
        Plan your breaks at KAU. Waqtaha scores every hour of the forecast and
        tells you the best time to visit the Sports Tent, de-stress, and enjoy
        your hobbies.
      </p>

      <div className="hero-actions reveal" style={{ "--i": 5 }}>
        <Link to="/register" className="btn">Get started</Link>
        <Link to="/login" className="btn btn-ghost">Log in</Link>
      </div>

      <div className="activity-grid">
        {DEMO.map((a, i) => (
          <TiltCard
            key={a.label}
            className="glass activity-card reveal"
            style={{ "--i": 6 + i }}
          >
            <ScoreRing score={a.score} size={76} />
            <div>
              <h3>{a.icon} {a.label}</h3>
              <p>{a.text}</p>
            </div>
          </TiltCard>
        ))}
      </div>
      <p className="hint reveal" style={{ "--i": 10 }}>
        Example scores. Move your mouse over the cards.
      </p>
    </div>
  );
}