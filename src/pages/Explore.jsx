// Explore page (protected). Owner: Arwa.
// Final version: destination search + activity picker + activity type filter.
// src/pages/Explore.jsx
// Step 1 of the user journey: choose a destination and an activity.
// Flow: type city -> Search -> pick one result -> (optional) filter by type
//       -> pick an activity -> "See best times" -> /results

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchDestinations } from "../services/weatherApi.js";
import { KAU_CAMPUS } from "../utils/campusData.js";
import { ACTIVITY_TYPES, getActivitiesByType } from "../utils/activities.js";
import "./Explore.css";

export default function Explore() {
  const navigate = useNavigate();

  // --- State (each useState is one piece of memory for this page) ---
  const [query, setQuery] = useState("");                 // text in the search box
  const [matches, setMatches] = useState([]);             // cities returned by the API
  const [destination, setDestination] = useState(null);   // the city the user picked
  const [typeFilter, setTypeFilter] = useState("all");    // marine / mountain / ...
  const [activityKey, setActivityKey] = useState(null);   // running / photography / beach
  const [loading, setLoading] = useState(false);          // true while waiting for API
  const [error, setError] = useState("");                 // message shown to the user

  // The activities that match the chosen type filter.
  const visibleActivities = getActivitiesByType(typeFilter);

  // --- Search the city (runs when the form is submitted) ---
  async function handleSearch(event) {
    event.preventDefault(); // stop the browser from reloading the page

    // Form validation: check BEFORE calling the API.
    if (query.trim().length < 2) {
      setError("Please type at least 2 letters of a city name.");
      return;
    }

    setError("");
    setLoading(true);
    setDestination(null);
    setMatches([]);

    try {
      const results = await searchDestinations(query);
      setMatches(results);
    } catch (err) {
      setError(err.message); // already a friendly message from weatherApi.js
    } finally {
      setLoading(false); // runs on success AND on error
    }
  }

  // --- Quick button: KAU campus + Sports Tent in one click ---
  function handleCampusShortcut() {
    setDestination(KAU_CAMPUS);        // campus values come only from campusData.js
    setActivityKey("sportsTent");
    setTypeFilter("all");              // make sure the tent card is visible
    setMatches([]);
    setError("");
  }

  // --- When the user changes the type filter ---
  function handleTypeChange(typeKey) {
    setTypeFilter(typeKey);
    // If the chosen activity no longer matches the filter, unselect it.
    const stillVisible = getActivitiesByType(typeKey).some((a) => a.key === activityKey);
    if (!stillVisible) setActivityKey(null);
  }

  // --- Go to the Results page (Rule 3 of the team guide) ---
  function handleContinue() {
    if (!destination) {
      setError("Please choose a destination from the search results.");
      return;
    }
    if (!activityKey) {
      setError("Please choose an activity.");
      return;
    }
    // Send exactly { destination, activityKey } through the router.
    navigate("/results", { state: { destination, activityKey } });
  }

  return (
    <div className="page">
      <h1 className="reveal">Explore</h1>
      <p className="auth-sub reveal" style={{ "--i": 1 }}>Find the best hours for your activity.</p>

      {/* 1. Destination search */}
      <section className="glass section reveal" style={{ "--i": 2 }} aria-labelledby="dest-title">
        <h2 id="dest-title">1. Where are you going?</h2>
        <form className="explore-search" onSubmit={handleSearch}>
          <label htmlFor="city-input" className="visually-hidden">City name</label>
          <input
            id="city-input"
            type="text"
            placeholder="e.g. Jeddah"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        <button type="button" className="btn btn-ghost campus-shortcut" onClick={handleCampusShortcut}>
          KAU Campus
        </button>

        {/* Shows which destination is chosen (also for the campus shortcut) */}
        {destination && <p role="status">Selected: <strong>{destination.name}</strong></p>}

        {/* Loading, error, and results */}
        {loading && <p role="status">Searching for cities...</p>}
        {error && <p className="msg msg-error" role="alert">⚠ {error}</p>}

        {matches.length > 0 && (
          <ul className="explore-matches">
            {matches.map((place) => {
              const selected = destination && destination.lat === place.lat && destination.lon === place.lon;
              return (
                <li key={`${place.lat}-${place.lon}`}>
                  <button
                    type="button"
                    className={selected ? "choice selected" : "choice"}
                    aria-pressed={selected}
                    onClick={() => { setDestination(place); setError(""); }}
                  >
                    {selected ? "✓ " : ""}{place.name}{place.country ? `, ${place.country}` : ""}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* 2. Type filter + activity picker */}
      <section className="glass section reveal" style={{ "--i": 3 }} aria-labelledby="act-title">
        <h2 id="act-title">2. What do you want to do?</h2>

        <div className="explore-filters" role="group" aria-label="Filter activities by type">
          {ACTIVITY_TYPES.map((type) => (
            <button
              key={type.key}
              type="button"
              className={typeFilter === type.key ? "chip selected" : "chip"}
              aria-pressed={typeFilter === type.key}
              onClick={() => handleTypeChange(type.key)}
            >
              {type.label}
            </button>
          ))}
        </div>

        {visibleActivities.length === 0 ? (
          <p>No activities match this type yet.</p>
        ) : (
          <ul className="explore-activities">
            {visibleActivities.map((activity) => {
              const selected = activityKey === activity.key;
              return (
                <li key={activity.key}>
                  <button
                    type="button"
                    className={selected ? "choice selected" : "choice"}
                    aria-pressed={selected}
                    onClick={() => { setActivityKey(activity.key); setError(""); }}
                  >
                    <strong>{selected ? "✓ " : ""}{activity.label}</strong>
                    <span>{activity.description}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <button type="button" className="btn explore-continue" onClick={handleContinue}>
        See best times
      </button>
    </div>
  );
}
