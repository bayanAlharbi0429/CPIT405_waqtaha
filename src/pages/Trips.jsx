
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { mockDestination } from "../mocks/mockData";
import {
  createTrip,
  getTrips,
} from "../services/tripsApi";

const initialForm = {
  name: "",
  startDate: "",
  endDate: "",
};

export default function Trips() {
  const { currentUser } = useAuth();

  const [trips, setTrips] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load saved trips from Firestore.
  useEffect(() => {
    let active = true;

    async function loadTrips() {
      try {
        const data = await getTrips(currentUser.uid);

        if (active) {
          setTrips(data);
        }
      } catch (err) {
        if (active) {
          setError(
            err.message || "Could not load your trips."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadTrips();

    return () => {
      active = false;
    };
  }, [currentUser.uid]);

  function handleInput(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // Create a new trip in Firestore.
  async function handleCreate(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Please enter a trip name.");
      return;
    }

    if (!form.startDate || !form.endDate) {
      setError("Please select your trip dates.");
      return;
    }

    if (form.startDate > form.endDate) {
      setError(
        "The end date cannot be before the start date."
      );
      return;
    }

    setSaving(true);

    try {
      const tripData = {
        name: form.name.trim(),
        destination: mockDestination,
        startDate: form.startDate,
        endDate: form.endDate,
      };

      await createTrip(
        currentUser.uid,
        tripData
      );

      // Refresh the saved trips list.
      const updatedTrips = await getTrips(
        currentUser.uid
      );

      setTrips(updatedTrips);
      setForm(initialForm);

      setSuccess(
        "Your trip was created successfully!"
      );
    } catch (err) {
      console.error("Trip creation error:", err);

      setError(
        err.message || "Could not create your trip."
      );
    } finally {
      setSaving(false);
    }
  }

  const panelStyle = {
    background:
      "linear-gradient(145deg, #30283c, #242d3c)",
    border: "1px solid #56465e",
    borderRadius: 22,
    padding: 24,
  };

  const inputStyle = {
    width: "100%",
    marginTop: 8,
    padding: 14,
    borderRadius: 12,
    background: "#222433",
    border: "1px solid #64546b",
    color: "#fff",
  };

  return (
    <div
      className="page"
      style={{
        maxWidth: 1000,
        margin: "0 auto",
        padding: "40px 20px 80px",
      }}
    >
      {/* Page heading */}
      <header style={{ marginBottom: 32 }}>
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
          ✨ YOUR ADVENTURES
        </span>

        <h1
          style={{
            fontSize: 38,
            margin: "0 0 12px",
          }}
        >
          My Trips
        </h1>

        <p
          style={{
            color: "#c7bdd0",
            fontSize: 16,
          }}
        >
          Every great adventure starts with a plan!
        </p>
      </header>

      {/* Create Trip Form */}
      <section style={panelStyle}>
        <h2
          style={{
            fontSize: 26,
            margin: "0 0 8px",
          }}
        >
          ✨ Plan a New Trip
        </h2>

        <p
          style={{
            color: "#b8b3ca",
            fontSize: 14,
            marginBottom: 25,
          }}
        >
          Give your adventure a name and choose
          your travel dates.
        </p>

        {error && (
          <p
            role="alert"
            style={{
              background: "#512d3b",
              color: "#ffd2da",
              padding: 15,
              borderRadius: 12,
            }}
          >
            ⚠️ {error}
          </p>
        )}

        {success && (
          <p
            role="status"
            style={{
              background: "#24483c",
              color: "#a7f3d0",
              padding: 15,
              borderRadius: 12,
            }}
          >
            ✅ {success}
          </p>
        )}

        <form onSubmit={handleCreate}>
          <label
            htmlFor="trip-name"
            style={{ display: "block", marginBottom: 20 }}
          >
            Trip Name

            <input
              id="trip-name"
              name="name"
              type="text"
              placeholder="e.g. Jeddah Weekend"
              maxLength={80}
              value={form.name}
              onChange={handleInput}
              style={inputStyle}
              required
            />
          </label>

          <label
            htmlFor="trip-destination"
            style={{ display: "block", marginBottom: 20 }}
          >
            Destination

            <input
              id="trip-destination"
              type="text"
              value="📍 Jeddah, Saudi Arabia"
              style={inputStyle}
              readOnly
            />

            <small
              style={{
                display: "block",
                marginTop: 8,
                color: "#ffb56b",
              }}
            >
              Demo destination — city selection
              will be added next.
            </small>
          </label>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 16,
            }}
          >
            <label
              htmlFor="trip-start"
              style={{ display: "block" }}
            >
              Start Date

              <input
                id="trip-start"
                name="startDate"
                type="date"
                value={form.startDate}
                onChange={handleInput}
                max={form.endDate || undefined}
                style={inputStyle}
                required
              />
            </label>

            <label
              htmlFor="trip-end"
              style={{ display: "block" }}
            >
              End Date

              <input
                id="trip-end"
                name="endDate"
                type="date"
                value={form.endDate}
                onChange={handleInput}
                min={form.startDate || undefined}
                style={inputStyle}
                required
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              width: "100%",
              marginTop: 28,
              padding: 16,
              borderRadius: 14,
              background:
                "linear-gradient(135deg, #ff9fc1, #ffb56b)",
              color: "#292231",
              fontSize: 17,
              fontWeight: 800,
              cursor: saving ? "wait" : "pointer",
            }}
          >
            {saving
              ? "Creating your trip..."
              : "✦ Create My Trip"}
          </button>
        </form>
      </section>

      {/* Saved Trips Section */}
      <section style={{ marginTop: 42 }}>
        <h2
          style={{
            fontSize: 27,
            marginBottom: 10,
          }}
        >
          🧳 Your Saved Trips
        </h2>

        <p
          style={{
            color: "#b8b3ca",
            marginBottom: 22,
          }}
        >
          Your adventures, all in one place.
        </p>

        {loading ? (
          <p role="status">
            Loading your trips...
          </p>
        ) : trips.length === 0 ? (
          <div
            style={{
              ...panelStyle,
              textAlign: "center",
              padding: 40,
            }}
          >
            <div style={{ fontSize: 42 }}>🗺️</div>

            <h3>No trips yet!</h3>

            <p style={{ color: "#b8b3ca" }}>
              Create your first adventure above.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(230px, 1fr))",
              gap: 18,
            }}
          >
            {trips.map((trip) => (
              <article
                key={trip.id}
                style={{
                  ...panelStyle,
                  padding: 22,
                }}
              >
                <div style={{ fontSize: 29 }}>
                  🌴
                </div>

                <h3
                  style={{
                    fontSize: 21,
                    margin: "12px 0",
                  }}
                >
                  {trip.name}
                </h3>

                <p
                  style={{
                    color: "#ffb4c9",
                    fontSize: 14,
                  }}
                >
                  📍 {trip.destination?.name}
                </p>

                <p
                  style={{
                    color: "#b8b3ca",
                    fontSize: 13,
                    lineHeight: 1.8,
                  }}
                >
                  📅 {trip.startDate}
                  <br />
                  to {trip.endDate}
                </p>

                <Link
                  to={`/trips/${trip.id}`}
                  style={{
                    display: "inline-block",
                    marginTop: 14,
                    color: "#ffb56b",
                    fontWeight: 700,
                  }}
                >
                  View Trip Details →
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
