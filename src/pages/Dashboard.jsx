// Dashboard (protected): entry point to the main features
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import TiltCard from "../components/TiltCard";

const ITEMS = [
  { to: "/explore", icon: "🧭", title: "Explore", text: "Search a destination and find the best hours for your activity." },
  { to: "/trips", icon: "🗺️", title: "My trips", text: "View and edit your saved trip plans." },
  { to: "/profile", icon: "🎚️", title: "Profile", text: "Set how much each weather factor matters to you." },
];

export default function Dashboard() {
  const { currentUser } = useAuth();

  return (
    <div className="page">
      <h1 className="reveal">
        Hello, <span className="gradient-text">{currentUser.displayName}</span>
      </h1>
      <p className="auth-sub reveal" style={{ "--i": 1 }}>
        What would you like to do today?
      </p>

      <div className="card-grid">
        {ITEMS.map((item, i) => (
          <TiltCard
            key={item.to}
            as={Link}
            to={item.to}
            className="card reveal"
            style={{ "--i": i + 2 }}
          >
            <div className="card-icon">{item.icon}</div>
            <h2>{item.title}</h2>
            <p>{item.text}</p>
          </TiltCard>
        ))}
      </div>
    </div>
  );
}