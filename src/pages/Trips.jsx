import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { KAU_CAMPUS } from "../utils/campusData";
import { searchDestinations } from "../services/weatherApi";
import { createTrip, getTrips } from "../services/tripsApi";

// Campus coordinates and schedule live in campusData.js, not in this page.
const initialForm = {
  name: "My week at KAU",
  startDate: "",
  endDate: "",
};

function sameCampus(destination) {
  return (
    Math.abs(Number(destination?.lat) - KAU_CAMPUS.lat) < 0.001 &&
    Math.abs(Number(destination?.lon) - KAU_CAMPUS.lon) < 0.001
  );
}

function displayDate(value) {
  if (!value) return "—";
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }
  );
}

const fieldStyle = {
  width: "100%",
  marginTop: 8,
  boxSizing: "border-box",
  colorScheme: "dark",
};

export default function Trips() {
  const { currentUser } = useAuth();
  const userId = currentUser?.uid;

  const [trips, setTrips] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [destination, setDestination] = useState(KAU_CAMPUS);
  const [cityQuery, setCityQuery] = useState("");
  const [matches, setMatches] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [searchError, setSearchError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;
    async function loadTrips() {
      try {
        setLoading(true);
        const data = await getTrips(userId);
        if (active) setTrips(data);
      } catch (err) {
        if (active) setError(err.message || "Could not load your trips.");
      } finally {
        if (active) setLoading(false);
      }
    }
    if (userId) loadTrips();
    return () => { active = false; };
  }, [userId]);

  function selectCampus() {
    setDestination(KAU_CAMPUS);
    setMatches([]);
    setSearchError("");
    setForm((previous) => ({
      ...previous,
      name:
        !previous.name.trim() || previous.name === "My week at KAU"
          ? "My week at KAU"
          : previous.name,
    }));
  }

  function selectCity(place) {
    setDestination(place);
    setMatches([]);
    setSearchError("");
    setForm((previous) => ({
      ...previous,
      // Remove only the auto-suggested campus title, not a custom one.
      name: previous.name === "My week at KAU" ? "" : previous.name,
    }));
  }

  async function handleSearch(event) {
    event.preventDefault();
    setSearchError("");
    setMatches([]);
    setSuccess("");

    if (cityQuery.trim().length < 2) {
      setSearchError("Please enter at least 2 letters.");
      return;
    }

    setSearching(true);
    try {
      const found = await searchDestinations(cityQuery);
      setMatches(found);
    } catch (err) {
      setSearchError(err.message || "Could not search for this city.");
    } finally {
      setSearching(false);
    }
  }

  async function handleCreate(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (!userId) {
      setError("Please sign in first.");
      return;
    }
    if (!form.name.trim()) {
      setError("Please enter a trip name.");
      return;
    }
    if (!destination) {
      setError("Please choose a destination.");
      return;
    }
    if (!form.startDate || !form.endDate || form.startDate > form.endDate) {
      setError("Please choose valid start and end dates.");
      return;
    }

    setSaving(true);
    try {
      await createTrip(userId, {
        name: form.name.trim(),
        destination,
        startDate: form.startDate,
        endDate: form.endDate,
      });
      setTrips(await getTrips(userId));
      setForm(initialForm);
      setDestination(KAU_CAMPUS);
      setCityQuery("");
      setMatches([]);
      setSuccess("Your trip was created successfully!");
    } catch (err) {
      setError(err.message || "Could not create your trip.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="page">
      <header style={{ marginBottom: 28 }}>
        <span className="tag">✨ YOUR ADVENTURES</span>
        <h1 style={{ marginTop: 12 }}>My <span className="marker">Trips</span></h1>
        <p className="tagline">Less stress, more sunshine.</p>
        <p className="auth-sub" style={{ marginTop: 10 }}>
          Plan your campus breaks or your favorite outdoor activities.
        </p>
      </header>

      <section className="glass section" aria-labelledby="new-trip-title">
        <h2 id="new-trip-title">✨ Plan a New Trip</h2>
        <p className="section-sub">Choose KAU Campus or search for another city.</p>

        {error && <p className="msg msg-error" role="alert">⚠ {error}</p>}
        {success && <p className="msg msg-ok" role="status">✓ {success}</p>}

        <div style={{ marginBottom: 22 }}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={selectCampus}
            aria-pressed={sameCampus(destination)}
          >
            ⛺ Use KAU Campus
          </button>
          <form onSubmit={handleSearch} style={{ marginTop: 14 }}>
            <label htmlFor="trip-city-query">Search another city</label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
              <input
                id="trip-city-query"
                value={cityQuery}
                onChange={(event) => setCityQuery(event.target.value)}
                placeholder="e.g. Jeddah or Makkah"
                style={{ flex: "1 1 200px", minWidth: 0 }}
              />
              <button className="btn" type="submit" disabled={searching}>
                {searching ? "Searching..." : "Search"}
              </button>
            </div>
          </form>
          {searchError && <p className="msg msg-error" role="alert">{searchError}</p>}
          {matches.length > 0 && (
            <div role="group" aria-label="Search results" style={{ display: "grid", gap: 8, marginTop: 12 }}>
              {matches.map((place) => (
                <button
                  key={`${place.lat}-${place.lon}`}
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => selectCity(place)}
                >
                  📍 {place.name}{place.country ? `, ${place.country}` : ""}
                </button>
              ))}
            </div>
          )}
          <p role="status" className="msg" style={{ marginTop: 12 }}>
            Selected destination: <strong>{destination?.name || "None"}</strong>
            {destination?.country ? `, ${destination.country}` : ""}
          </p>
        </div>

        <form onSubmit={handleCreate}>
          <label htmlFor="trip-name">Trip name</label>
          <input
            id="trip-name"
            value={form.name}
            maxLength={80}
            required
            onChange={(event) => setForm((previous) => ({ ...previous, name: event.target.value }))}
            placeholder={sameCampus(destination) ? "My week at KAU" : "e.g. My weekend plans"}
            style={{ ...fieldStyle, marginBottom: 20 }}
          />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            <div>
              <label htmlFor="trip-start">Start date</label>
              <input
                id="trip-start"
                type="date"
                required
                value={form.startDate}
                max={form.endDate || undefined}
                onChange={(event) => setForm((previous) => ({ ...previous, startDate: event.target.value }))}
                style={fieldStyle}
              />
            </div>
            <div>
              <label htmlFor="trip-end">End date</label>
              <input
                id="trip-end"
                type="date"
                required
                value={form.endDate}
                min={form.startDate || undefined}
                onChange={(event) => setForm((previous) => ({ ...previous, endDate: event.target.value }))}
                style={fieldStyle}
              />
            </div>
          </div>
          <button className="btn" type="submit" disabled={saving || !destination} style={{ marginTop: 22 }}>
            {saving ? "Creating your trip..." : "＋ Create My Trip"}
          </button>
        </form>
      </section>

      <section className="glass section" aria-labelledby="saved-trips-title">
        <h2 id="saved-trips-title">🧳 Your Saved Trips</h2>
        <p className="section-sub">Your adventures, all in one place.</p>
        {loading ? (
          <p role="status">Loading your trips...</p>
        ) : trips.length === 0 ? (
          <div style={{ textAlign: "center", padding: 24 }}>
            <p style={{ fontSize: 36 }}>🗺️</p>
            <h3>No trips yet!</h3>
            <p className="section-sub">Create your first adventure above.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 16 }}>
            {trips.map((trip) => (
              <article className="glass" key={trip.id} style={{ padding: 20 }}>
                <div style={{ fontSize: 28 }}>{sameCampus(trip.destination) ? "⛺" : "🌴"}</div>
                <h3 style={{ margin: "10px 0" }}>{trip.name}</h3>
                <p style={{ color: "var(--sun)", margin: "0 0 10px" }}>
                  📍 {trip.destination?.name || "Destination"}
                </p>
                <p style={{ color: "var(--muted)", lineHeight: 1.8 }}>
                  📅 {displayDate(trip.startDate)} — {displayDate(trip.endDate)}
                </p>
                <Link className="btn btn-ghost" to={`/trips/${trip.id}`}>
                  View Trip Details →
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
