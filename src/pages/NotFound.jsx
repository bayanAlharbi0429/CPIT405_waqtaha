// NotFound page: shown for any address that does not match a route
import { Link } from "react-router-dom";
import SunMascot from "../components/SunMascot";
import { useAuth } from "../context/AuthContext";

export default function NotFound() {
  const { currentUser } = useAuth();

  return (
    <div className="hero">
      <div className="reveal">
        <SunMascot mood="rain" />
      </div>

      <p className="hint reveal" style={{ "--i": 1 }}>Error 404</p>

      <h1 className="reveal" style={{ "--i": 2 }}>
        Lost in the <span className="scribble">clouds</span>
      </h1>

      <p className="hero-sub reveal" style={{ "--i": 3 }}>
        We could not find the page you were looking for.
        Let's get you back on track.
      </p>

      <div className="hero-actions reveal" style={{ "--i": 4 }}>
        <Link to={currentUser ? "/dashboard" : "/login"} className="btn">
          {currentUser ? "Back to dashboard" : "Go to login"}
        </Link>
      </div>
    </div>
  );
}