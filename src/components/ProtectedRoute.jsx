// ProtectedRoute: sends visitors to /login if they are not logged in
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    // Remember the page they wanted so we can bring them back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}