// Dashboard (protected) - placeholder for now
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Hello, {currentUser.displayName}</h1>
        <p className="auth-sub">Your dashboard is coming soon.</p>
        <button onClick={handleLogout}>Log out</button>
      </div>
    </div>
  );
}