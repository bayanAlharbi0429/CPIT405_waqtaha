// Sports Tent page (protected). Owner: Bayan.
// Shows tent information and the best times this week to walk there.
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ScoreRing from "../components/ScoreRing";
import { getForecast } from "../services/weatherApi";
import { getEffectiveWeights } from "../services/profileApi";
import { scoreHours } from "../utils/scoring";
import {
  KAU_CAMPUS,
  SPORTS_TENT,
  TENT_DEFAULT_WEIGHTS,
  isTentOpen,
  formatSlot,
  describeSchedule,
} from "../utils/campusData";

export default function Tent() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [best, setBest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0); // changes when the user presses "Try again"

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        // The user's own weights, or the defaults if none are saved or the activity is not ready yet
        let weights;
        try {
          weights = await getEffectiveWeights(currentUser.uid, "sportsTent");
        } catch (err) {
          weights = TENT_DEFAULT_WEIGHTS;
        }

        const { hourly, sunTimes } = await getForecast(KAU_CAMPUS.lat, KAU_CAMPUS.lon);
        const scored = scoreHours(hourly, "sportsTent", weights, sunTimes);

        // Only campus hours count. Best score first, earlier time wins a tie.
        const top = scored
          .filter((h) => isTentOpen(h.time))
          .sort((a, b) => b.score - a.score || a.time.localeCompare(b.time))
          .slice(0, 3);

        if (!cancelled) setBest(top);
      } catch (err) {
        if (!cancelled) setError("Could not load the forecast for the campus. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [currentUser.uid, attempt]);

  function openFullResults() {
    navigate("/results", { state: { destination: KAU_CAMPUS, activityKey: "sportsTent" } });
  }

  return (
    <div className="page">
      <h1 className="reveal">
        Sports <span className="marker">Tent</span>
      </h1>
      <p className="tagline reveal" style={{ "--i": 1 }}>
        Less stress, more sunshine.
      </p>
      <p className="auth-sub reveal" style={{ "--i": 2 }}>
        A calm break between lectures. Find the most comfortable time to walk there.
      </p>

      <section className="glass section reveal" style={{ "--i": 3 }}>
        <h2>⛺ {SPORTS_TENT.name}</h2>
        <p className="section-sub">
          Relax, de-stress, and enjoy your hobbies. The tent is indoors, so the
          weather only matters on your way there.
        </p>

        <div className="schedule">
          <span className="tag">Campus hours: {describeSchedule()}</span>
          <span className="tag">{KAU_CAMPUS.name}</span>
        </div>

        <div className="offer-grid">
          {SPORTS_TENT.offerings.map((o) => (
            <div className="offer" key={o.label}>
              <strong>{o.label}</strong>
              <span>{o.note}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="glass section reveal" style={{ "--i": 4 }}>
        <h2>Best times to visit this week</h2>
        <p className="section-sub">
          Scored with your own preferences from the profile page. Only campus hours are counted.
        </p>

        {loading && <p className="section-sub">Checking the forecast...</p>}

        {error && (
          <>
            <div className="msg msg-error" role="alert">{error}</div>
            <div className="tent-actions">
              <button type="button" onClick={() => setAttempt((a) => a + 1)}>Try again</button>
            </div>
          </>
        )}

        {!loading && !error && best.length === 0 && (
          <p className="section-sub">No campus hours were found in the forecast yet.</p>
        )}

        {best.length > 0 && (
          <>
            <div className="best-grid">
              {best.map((h) => {
                const slot = formatSlot(h.time);
                return (
                  <div className="slot" key={h.time}>
                    <ScoreRing score={h.score} size={72} />
                    <div>
                      <div className="slot-day">{slot.day}</div>
                      <div className="slot-time">{slot.date} at {slot.hour}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {best[0].score < 40 && (
              <p className="tent-note">
                The weather outside looks rough this week. A good reason to enjoy a
                cozy break inside the tent!
              </p>
            )}
          </>
        )}

        <div className="tent-actions">
          <button type="button" onClick={openFullResults}>See the full hourly chart</button>
        </div>
      </section>
    </div>
  );
}