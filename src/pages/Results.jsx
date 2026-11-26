
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import { getForecast } from "../services/weatherApi";
import { getEffectiveWeights } from "../services/profileApi";

import { scoreHours } from "../utils/scoring";
import { ACTIVITIES } from "../utils/activities";
import { mockDestination } from "../mocks/mockData";

import HourlyChart from "../components/HourlyChart";
import TopTimes from "../components/TopTimes";
import SaveToTrip from "../components/SaveToTrip";
import ScoreRing from "../components/ScoreRing";
import { KAU_CAMPUS, describeSchedule } from "../utils/campusData";

// Format the destination's local date and time.
function formatHour(value) {
  if (!value?.includes("T")) {
    return { date: value || "", time: "" };
  }

  const [datePart, timePart] = value.split("T");

  const [year, month, day] = datePart
    .split("-")
    .map(Number);

  const [hour, minute] = timePart
    .split(":")
    .map(Number);

  const date = new Date(
    Date.UTC(year, month - 1, day)
  ).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

  const time = `${hour % 12 || 12}:${String(
    minute
  ).padStart(2, "0")} ${
    hour >= 12 ? "PM" : "AM"
  }`;

  return { date, time };
}

export default function Results() {
  const location = useLocation();

  // Get the currently signed-in user.
  const { currentUser } = useAuth();

  const userId = currentUser?.uid;

  // The Sports Tent exists only on the KAU campus. Always use the shared
  // campus location, even if an unrelated destination was passed by Explore.
  const activityKey =
    location.state?.activityKey || "running";

  const destination = activityKey === "sportsTent"
    ? KAU_CAMPUS
    : (location.state?.destination || mockDestination);

  const activity = ACTIVITIES[activityKey];

  // Results states.
  const [scored, setScored] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // User filters.
  const [minimumScore, setMinimumScore] = useState(50);
  const [sortBy, setSortBy] = useState("score");

  // Track which weights were used.
  const [weightsSource, setWeightsSource] =
    useState("");

  useEffect(() => {
    let active = true;

    async function loadResults() {
      try {
        setLoading(true);
        setError("");

        if (!userId) {
          throw new Error(
            "Please sign in to view your results."
          );
        }

        if (!activity) {
          throw new Error("Invalid activity selected.");
        }

        // 1. Load weather data.
        const { hourly, sunTimes } =
          await getForecast(
            destination.lat,
            destination.lon
          );

        // 2. Load the user's effective weights.
        // Saved custom weights are used when available.
        // Otherwise, the activity defaults are used.
        const weights = await getEffectiveWeights(
          userId,
          activityKey
        );

        if (!active) return;

        // 3. Check whether custom weights were found.
        const defaultWeights = activity.weights;

        const isCustomized = Object.keys(
          defaultWeights
        ).some(
          (key) =>
            weights[key] !== defaultWeights[key]
        );

        setWeightsSource(
          isCustomized ? "custom" : "default"
        );

        // 4. Calculate suitability scores.
        const results = scoreHours(
          hourly,
          activityKey,
          weights,
          sunTimes
        );

        if (!active) return;

        // 5. Display updated results.
        setScored(results);

      } catch (err) {
        console.error("Results loading error:", err);

        if (active) {
          setError(
            "Could not load your weather results or " +
            "profile preferences. Please try again."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadResults();

    return () => {
      active = false;
    };
  }, [
    destination.lat,
    destination.lon,
    activityKey,
    activity,
    userId,
  ]);

  const isSportsTent = activityKey === "sportsTent";

  // For the indoor Sports Tent, campus-closed hours are hidden from the
  // chart and list. The scoring engine remains the source of truth.
  const visibleHours = scored.filter(
    (hour) =>
      !isSportsTent ||
      !(hour.capped && hour.reason === "Outside campus hours")
  );
  const hiddenCampusHours = scored.length - visibleHours.length;

  const filteredHours = visibleHours.filter(
    (hour) =>
      Number.isFinite(hour.score) &&
      hour.score >= minimumScore
  );

  // Sort the filtered hours.
  const sortedHours = [...filteredHours].sort(
    (a, b) => {
      if (sortBy === "score") {
        return (
          b.score - a.score ||
          a.time.localeCompare(b.time)
        );
      }

      return a.time.localeCompare(b.time);
    }
  );

  return (
    <div className="auth-page">
      <div
        className="auth-card"
        style={{
          width: "100%",
          maxWidth: "1000px",
          boxSizing: "border-box",
          padding: "32px",
        }}
      >
        {/* Page heading */}
        <div style={{ marginBottom: 28 }}>
          <span
            style={{
              display: "inline-block",
              background: "#443243",
              color: "#ffb4c9",
              padding: "8px 15px",
              borderRadius: 30,
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 15,
            }}
          >
            ✨ YOUR WEATHER GUIDE
          </span>

          <h1
            style={{
              fontSize: 36,
              margin: "0 0 12px",
              color: "#ffffff",
            }}
          >
            Your Results
          </h1>

          <p
            style={{
              color: "#c7bdd0",
              fontSize: 16,
              margin: 0,
            }}
          >
            📍 {destination.name} · {activity?.label || activityKey}
          </p>

          {/* Weight preference indicator */}
          {!loading && !error && (
            <div
              style={{
                display: "inline-block",
                marginTop: 17,
                padding: "9px 15px",
                borderRadius: 30,
                background:
                  weightsSource === "custom"
                    ? "#34394c"
                    : "#3a3445",
                border: "1px solid #60546c",
                color: "#f7c5d6",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {weightsSource === "custom"
                ? "🎯 Your Custom Preferences"
                : "🌤️ Default Activity Preferences"}
            </div>
          )}
        </div>

        {/* Loading state */}
        {loading && (
          <div
            role="status"
            style={{
              padding: "55px 20px",
              textAlign: "center",
              color: "#ffb56b",
            }}
          >
            🌤️ Finding your perfect hours...
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div
            role="alert"
            style={{
              padding: 24,
              borderRadius: 16,
              background: "#512d3b",
              color: "#ffd2da",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Results content */}
        {!loading && !error && (
          <>
            {isSportsTent && (
              <section className="glass section" style={{ marginTop: 22 }}>
                <h2>⛺ KAU Sports Tent</h2>
                <p className="section-sub" style={{ marginBottom: 8 }}>
                  Campus hours: <strong>{describeSchedule()}</strong>
                </p>
                <p className="section-sub" style={{ marginBottom: 0 }}>
                  The tent is indoors. Weather scores describe the walk to the tent,
                  not the activities inside. {hiddenCampusHours} closed hours are hidden.
                </p>
              </section>
            )}

            {/* Outside-campus-hours slots are hidden from the chart. */}
            <HourlyChart hours={visibleHours} />

            {/* Minimum score filter */}
            <section
              style={{
                marginTop: 30,
                padding: 24,
                borderRadius: 22,
                background:
                  "linear-gradient(145deg, #30283c, #242d3c)",
                border: "1px solid #56465e",
              }}
            >
              <span
                style={{
                  color: "#ffb56b",
                  fontWeight: 700,
                  fontSize: 12,
                }}
              >
                ✨ FIND YOUR PERFECT MATCH
              </span>

              <h2 style={{ margin: "14px 0 8px" }}>
                Filter by Score 🎯
              </h2>

              <p
                style={{
                  color: "#b8b3ca",
                  fontSize: 14,
                  marginBottom: 22,
                }}
              >
                Choose the minimum weather score
                you're happy with.
              </p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 15,
                }}
              >
                <label htmlFor="minimum-score">
                  Minimum Score
                </label>

                <strong
                  style={{
                    color: "#ffb56b",
                    fontSize: 25,
                  }}
                >
                  {minimumScore}/100
                </strong>
              </div>

              <input
                id="minimum-score"
                type="range"
                min="0"
                max="100"
                step="5"
                value={minimumScore}
                onChange={(event) =>
                  setMinimumScore(
                    Number(event.target.value)
                  )
                }
                style={{
                  width: "100%",
                  accentColor: "#ff92ae",
                  cursor: "pointer",
                }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "#b8b3ca",
                  fontSize: 12,
                  marginTop: 9,
                }}
              >
                <span>0 — Any weather</span>
                <span>100 — Perfect</span>
              </div>

              <p
                aria-live="polite"
                style={{
                  marginTop: 18,
                  color: "#ffd1df",
                  fontWeight: 600,
                }}
              >
                ✨ {filteredHours.length} matching
                hours found!
              </p>
            </section>

            {/* Top 3 must never include zero-scored or closed hours. */}
            <TopTimes hours={filteredHours.filter((hour) => hour.score > 0)} />

            {/* All matching hours */}
            <section style={{ marginTop: 36 }}>
              <h2 style={{ marginBottom: 8 }}>
                All Matching Hours 🕒
              </h2>

              <p
                style={{
                  color: "#b8b3ca",
                  fontSize: 14,
                  marginBottom: 20,
                }}
              >
                Explore suitable times and add
                your favorites to a trip!
              </p>

              {/* Sorting control */}
              <div
                style={{
                  padding: 18,
                  borderRadius: 16,
                  background: "#302a3d",
                  border: "1px solid #51465d",
                  marginBottom: 20,
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <label
                  htmlFor="sort-by"
                  style={{
                    fontWeight: 700,
                    color: "#ffd1df",
                  }}
                >
                  ✨ Sort your hours
                </label>

                <select
                  id="sort-by"
                  value={sortBy}
                  onChange={(event) =>
                    setSortBy(event.target.value)
                  }
                  style={{
                    background: "#252334",
                    color: "#ffffff",
                    padding: "12px 16px",
                    borderRadius: 12,
                    border: "1px solid #786078",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <option value="score">
                    ⭐ Highest Score First
                  </option>

                  <option value="time">
                    🕒 Earliest Time First
                  </option>
                </select>
              </div>

              {sortedHours.length === 0 ? (
                <div
                  style={{
                    padding: 25,
                    borderRadius: 16,
                    background: "#332c3b",
                    color: "#ffccd5",
                  }}
                >
                  No matching open hours. Try lowering
                  your minimum score.
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(190px, 1fr))",
                    gap: 12,
                    maxHeight: 500,
                    overflowY: "auto",
                    paddingRight: 5,
                  }}
                >
                  {sortedHours.map((hour) => {
                    const formatted = formatHour(
                      hour.time
                    );

                    return (
                      <article
                        key={hour.time}
                        style={{
                          background: "#292b39",
                          border: "1px solid #494456",
                          borderRadius: 16,
                          padding: 17,
                        }}
                      >
                        <div
                          style={{
                            color: "#b8b3ca",
                            fontSize: 13,
                            marginBottom: 8,
                          }}
                        >
                          📅 {formatted.date}
                        </div>

                        <strong
                          style={{
                            color: "#ffffff",
                            fontSize: 23,
                          }}
                        >
                          {formatted.time}
                        </strong>

                        <div style={{ marginTop: 14 }}>
                          <ScoreRing score={Math.round(hour.score)} size={76} />
                        </div>

                        {hour.capped && hour.reason && (
                          <p
                            style={{
                              color: "#fca5a5",
                              fontSize: 12,
                              marginTop: 8,
                            }}
                          >
                            ⚠️ {hour.reason}
                          </p>
                        )}

                        {/* Save selected hour to a trip */}
                        <SaveToTrip
                          hour={hour}
                          destination={destination}
                          activityKey={activityKey}
                        />
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
