
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import {
  getTrip,
  getTripItems,
  updateTrip,
  deleteTrip,
  deleteTripItem,
} from "../services/tripsApi";

import { ACTIVITIES } from "../utils/activities";

// Keep destination-local dates without timezone shifting.
function formatDate(value) {
  if (!value) return "Not set";

  const [year, month, day] = value
    .slice(0, 10)
    .split("-")
    .map(Number);

  return new Date(
    Date.UTC(year, month - 1, day)
  ).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatTime(value) {
  if (!value?.includes("T")) {
    return value || "Unknown time";
  }

  const [datePart, timePart] = value.split("T");
  const [hour, minute] = timePart.split(":").map(Number);

  const hour12 = hour % 12 || 12;
  const period = hour >= 12 ? "PM" : "AM";

  return (
    `${formatDate(datePart)} · ` +
    `${hour12}:${String(minute).padStart(2, "0")} ${period}`
  );
}

const panelStyle = {
  background: "linear-gradient(145deg, #30283c, #242d3c)",
  border: "1px solid #56465e",
  borderRadius: 22,
  padding: 24,
};

const inputStyle = {
  width: "100%",
  padding: 13,
  marginTop: 8,
  borderRadius: 12,
  background: "#222433",
  color: "#ffffff",
  border: "1px solid #64546b",
  boxSizing: "border-box",
  colorScheme: "dark",
};

const buttonStyle = {
  padding: "13px 20px",
  border: "none",
  borderRadius: 12,
  fontWeight: 700,
  cursor: "pointer",
};

export default function TripDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const userId = currentUser?.uid;

  const [trip, setTrip] = useState(null);
  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [removeItemId, setRemoveItemId] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
  });

  // Load the trip and its activities from Firestore.
  useEffect(() => {
    let active = true;

    async function loadDetails() {
      if (!userId) {
        setError("Please sign in first.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [tripData, savedItems] = await Promise.all([
          getTrip(userId, id),
          getTripItems(userId, id),
        ]);

        if (!active) return;

        setTrip(tripData);
        setItems(savedItems);

        setForm({
          name: tripData.name,
          startDate: tripData.startDate,
          endDate: tripData.endDate,
        });
      } catch (err) {
        if (active) {
          setError(
            err.message || "Could not load trip details."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDetails();

    return () => {
      active = false;
    };
  }, [id, userId]);

  // Save edited trip information.
  async function handleSave(event) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await updateTrip(userId, id, form);

      const updatedTrip = await getTrip(userId, id);

      setTrip(updatedTrip);
      setEditing(false);

      setMessage("Your trip was updated successfully!");
    } catch (err) {
      setError(err.message || "Could not update trip.");
    } finally {
      setSaving(false);
    }
  }

  // Delete the trip and its saved activities.
  async function handleDelete() {
    setDeleting(true);
    setError("");

    try {
      await deleteTrip(userId, id);
      navigate("/trips", { replace: true });
    } catch (err) {
      setError(err.message || "Could not delete trip.");
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  // Remove one saved activity.
  async function handleRemoveItem(itemId) {
    setError("");

    try {
      await deleteTripItem(userId, itemId);

      setItems((previous) =>
        previous.filter((item) => item.id !== itemId)
      );

      setRemoveItemId(null);
      setMessage("Activity removed successfully!");
    } catch (err) {
      setError(err.message || "Could not remove activity.");
    }
  }

  if (loading) {
    return (
      <div className="auth-page">
        <p role="status">🌤️ Loading your adventure...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h2>Trip unavailable</h2>
          <p role="alert">{error || "Trip not found."}</p>
          <Link to="/trips">Back to My Trips</Link>
        </div>
      </div>
    );
  }

  return (
    <main
      style={{
        maxWidth: 1000,
        margin: "0 auto",
        padding: "40px 20px 80px",
        color: "#ffffff",
      }}
    >
      {/* Back navigation */}
      <Link
        to="/trips"
        style={{
          color: "#ffb4c9",
          fontWeight: 700,
          textDecoration: "none",
        }}
      >
        ← Back to My Trips
      </Link>

      {/* Page header */}
      <header style={{ margin: "30px 0" }}>
        <span
          style={{
            display: "inline-block",
            background: "#443243",
            color: "#ffb4c9",
            padding: "8px 15px",
            borderRadius: 30,
            fontSize: 12,
            fontWeight: 700,
            marginBottom: 14,
          }}
        >
          ✨ YOUR ADVENTURE DETAILS
        </span>

        <h1
          style={{
            fontSize: 36,
            margin: "0 0 12px",
          }}
        >
          🧳 {trip.name}
        </h1>

        <p style={{ color: "#c7bdd0", fontSize: 16 }}>
          📍 {trip.destination?.name}
          {trip.destination?.country
            ? `, ${trip.destination.country}`
            : ""}
        </p>
      </header>

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

      {message && (
        <p
          role="status"
          style={{
            background: "#24483c",
            color: "#a7f3d0",
            padding: 15,
            borderRadius: 12,
          }}
        >
          ✅ {message}
        </p>
      )}

      {/* Trip overview */}
      <section style={panelStyle}>
        <h2 style={{ marginTop: 0 }}>
          🌴 Trip Overview
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(190px, 1fr))",
            gap: 16,
            marginTop: 22,
          }}
        >
          {[
            {
              label: "Start Date",
              value: formatDate(trip.startDate),
              emoji: "📅",
            },
            {
              label: "End Date",
              value: formatDate(trip.endDate),
              emoji: "🏁",
            },
            {
              label: "Saved Activities",
              value: String(items.length),
              emoji: "⭐",
            },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                background: "#242535",
                padding: 20,
                borderRadius: 16,
                border: "1px solid #474054",
              }}
            >
              <span style={{ fontSize: 25 }}>
                {item.emoji}
              </span>

              <p
                style={{
                  color: "#b8b3ca",
                  fontSize: 13,
                  marginBottom: 7,
                }}
              >
                {item.label}
              </p>

              <strong style={{ fontSize: 16 }}>
                {item.value}
              </strong>
            </div>
          ))}
        </div>
      </section>

      {/* Edit trip */}
      <section style={{ ...panelStyle, marginTop: 24 }}>
        <h2 style={{ marginTop: 0 }}>
          ✏️ Manage Your Trip
        </h2>

        {!editing ? (
          <button
            type="button"
            style={{
              ...buttonStyle,
              background: "#ffb4c9",
              color: "#292231",
            }}
            onClick={() => {
              setEditing(true);
              setConfirmDelete(false);
              setMessage("");
            }}
          >
            Edit Trip
          </button>
        ) : (
          <form onSubmit={handleSave}>
            <label
              htmlFor="edit-name"
              style={{ display: "block", marginBottom: 18 }}
            >
              Trip Name

              <input
                id="edit-name"
                type="text"
                required
                maxLength={80}
                value={form.name}
                onChange={(event) =>
                  setForm({
                    ...form,
                    name: event.target.value,
                  })
                }
                style={inputStyle}
              />
            </label>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 16,
                marginBottom: 20,
              }}
            >
              <label htmlFor="edit-start">
                Start Date

                <input
                  id="edit-start"
                  type="date"
                  required
                  value={form.startDate}
                  max={form.endDate || undefined}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      startDate: event.target.value,
                    })
                  }
                  style={inputStyle}
                />
              </label>

              <label htmlFor="edit-end">
                End Date

                <input
                  id="edit-end"
                  type="date"
                  required
                  value={form.endDate}
                  min={form.startDate || undefined}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      endDate: event.target.value,
                    })
                  }
                  style={inputStyle}
                />
              </label>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <button
                type="submit"
                disabled={saving}
                style={{
                  ...buttonStyle,
                  background: "#ffb4c9",
                  color: "#292231",
                }}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>

              <button
                type="button"
                style={{
                  ...buttonStyle,
                  background: "#414050",
                  color: "#fff",
                }}
                onClick={() => {
                  setEditing(false);
                  setForm({
                    name: trip.name,
                    startDate: trip.startDate,
                    endDate: trip.endDate,
                  });
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Saved activities */}
      <section style={{ marginTop: 38 }}>
        <h2>⭐ Your Planned Activities</h2>

        <p
          style={{
            color: "#b8b3ca",
            marginBottom: 20,
          }}
        >
          Your selected activities and their best times.
        </p>

        {items.length === 0 ? (
          <div
            style={{
              ...panelStyle,
              textAlign: "center",
              padding: 36,
            }}
          >
            <div style={{ fontSize: 42 }}>🌤️</div>

            <h3>No activities saved yet!</h3>

            <p style={{ color: "#b8b3ca" }}>
              Explore weather conditions to find
              the best times for your activities.
            </p>

            <Link
              to="/explore"
              style={{
                display: "inline-block",
                marginTop: 14,
                padding: "13px 22px",
                borderRadius: 12,
                background: "#ffb56b",
                color: "#292231",
                fontWeight: 800,
                textDecoration: "none",
              }}
            >
              Explore Activities →
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(230px, 1fr))",
              gap: 16,
            }}
          >
            {items.map((item) => (
              <article
                key={item.id}
                style={panelStyle}
              >
                <span style={{ fontSize: 28 }}>☀️</span>

                <h3 style={{ margin: "12px 0" }}>
                  {ACTIVITIES[item.activity]?.label ||
                    item.activity}
                </h3>

                <p style={{ color: "#c7bdd0" }}>
                  🕒 {formatTime(item.chosenTime)}
                </p>

                <p
                  style={{
                    color: "#86efac",
                    fontSize: 23,
                    fontWeight: 800,
                  }}
                >
                  ⭐ {Math.round(item.expectedScore)}/100
                </p>

                {removeItemId === item.id ? (
                  <div>
                    <p style={{ color: "#ffd2da" }}>
                      Remove this activity?
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveItem(item.id)
                      }
                      style={{
                        ...buttonStyle,
                        background: "#f87171",
                        color: "#221e28",
                        marginRight: 8,
                      }}
                    >
                      Confirm
                    </button>

                    <button
                      type="button"
                      onClick={() => setRemoveItemId(null)}
                      style={{
                        ...buttonStyle,
                        background: "#414050",
                        color: "#fff",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setRemoveItemId(item.id)}
                    style={{
                      ...buttonStyle,
                      background: "#503440",
                      color: "#ffb4c9",
                    }}
                  >
                    Remove Activity
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Delete trip */}
      <section
        style={{
          ...panelStyle,
          marginTop: 38,
          border: "1px solid #855061",
        }}
      >
        <h2>🗑️ Delete Trip</h2>

        <p style={{ color: "#c7bdd0" }}>
          Deleting a trip also removes its saved activities.
        </p>

        {!confirmDelete ? (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            style={{
              ...buttonStyle,
              background: "#6b3546",
              color: "#fff",
            }}
          >
            Delete This Trip
          </button>
        ) : (
          <div>
            <p style={{ color: "#ffd2da" }}>
              Are you sure? This action cannot be undone.
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                style={{
                  ...buttonStyle,
                  background: "#f87171",
                  color: "#221e28",
                }}
              >
                {deleting
                  ? "Deleting..."
                  : "Yes, Delete Permanently"}
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={() => setConfirmDelete(false)}
                style={{
                  ...buttonStyle,
                  background: "#414050",
                  color: "#fff",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
