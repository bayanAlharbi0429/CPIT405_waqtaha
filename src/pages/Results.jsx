// Results page (protected). Owner: Taghreed.
// This placeholder shows how data flows: it reads the destination and activity from
// the router state (with a fallback to mock data), loads the forecast, and scores it.
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getForecast } from "../services/weatherApi";
import { scoreHours } from "../utils/scoring";
import { ACTIVITIES } from "../utils/activities";
import { mockDestination } from "../mocks/mockData";

export default function Results() {
  const location = useLocation();
  const destination = location.state?.destination || mockDestination;
  const activityKey = location.state?.activityKey || "running";

  const [scored, setScored] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const { hourly, sunTimes } = await getForecast(destination.lat, destination.lon);
        const weights = ACTIVITIES[activityKey].weights;
        setScored(scoreHours(hourly, activityKey, weights, sunTimes));
      } catch (err) {
        setError("Could not load the forecast. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [destination.lat, destination.lon, activityKey]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const top3 = [...scored].sort((a, b) => b.score - a.score).slice(0, 3);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Results</h1>
        <p className="auth-sub">
          {destination.name} - {ACTIVITIES[activityKey].label}
        </p>
        <p>Top 3 times (placeholder):</p>
        {top3.map((h) => (
          <p key={h.time}>{h.time} : {h.score}/100</p>
        ))}
      </div>
    </div>
  );
}