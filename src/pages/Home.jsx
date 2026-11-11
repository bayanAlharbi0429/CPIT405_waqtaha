// Home page (public)
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Waqtaha</h1>
        <p className="auth-sub">
          Find the best hour for every activity on your trip.
        </p>
        <Link to="/register"><button>Get started</button></Link>
        <p className="auth-switch">
          Already a member? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}