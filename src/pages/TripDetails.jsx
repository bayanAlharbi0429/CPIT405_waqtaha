// Trip details page (protected). Owner: Taghreed.
import { useParams } from "react-router-dom";

export default function TripDetails() {
  const { id } = useParams();
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Trip details</h1>
        <p className="auth-sub">Placeholder page. Trip id: {id}</p>
      </div>
    </div>
  );
}