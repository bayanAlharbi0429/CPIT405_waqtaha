// Explore page (protected). Owner: Arwa.
// Final version: destination search + activity picker + activity type filter.
import { useNavigate } from "react-router-dom";
import { mockDestination } from "../mocks/mockData";

export default function Explore() {
  const navigate = useNavigate();

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Explore</h1>
        <p className="auth-sub">Placeholder page. Arwa will build the search here.</p>
        <button
          onClick={() =>
            navigate("/results", {
              state: { destination: mockDestination, activityKey: "running" },
            })
          }
        >
          Test: go to results with sample data
        </button>
      </div>
    </div>
  );
}