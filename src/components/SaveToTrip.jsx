
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import {
  getTrips,
  addTripItem,
} from "../services/tripsApi";

export default function SaveToTrip({
  hour,
  destination,
  activityKey,
}) {
  const { currentUser } = useAuth();

  const [open, setOpen] = useState(false);
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load the user's trips when the selector opens.
  useEffect(() => {
    if (!open) return;

    let active = true;

    async function loadTrips() {
      setLoading(true);
      setError("");

      try {
        if (!currentUser?.uid) {
          throw new Error("Please sign in first.");
        }

        const savedTrips = await getTrips(
          currentUser.uid
        );

        if (active) {
          setTrips(savedTrips);
          setSelectedTrip("");
        }
      } catch (err) {
        if (active) {
          setError(
            err.message || "Could not load your trips."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadTrips();

    return () => {
      active = false;
    };
  }, [open, currentUser?.uid]);

  const chosenDate = hour?.time?.slice(0, 10);

  // Only show trips for the same destination
  // whose dates include the chosen activity time.
  const eligibleTrips = trips.filter((trip) => {
    const sameDestination =
      trip.destination?.name?.trim().toLowerCase() ===
      destination?.name?.trim().toLowerCase();

    const withinDates =
      chosenDate >= trip.startDate &&
      chosenDate <= trip.endDate;

    return sameDestination && withinDates;
  });

  async function handleSave() {
    setError("");
    setSuccess("");

    if (!selectedTrip) {
      setError("Please select a trip.");
      return;
    }

    setSaving(true);

    try {
      await addTripItem(
        currentUser.uid,
        selectedTrip,
        {
          activity: activityKey,
          chosenTime: hour.time,
          expectedScore: hour.score,
        }
      );

      setSuccess("Activity added to your trip!");
      setOpen(false);
    } catch (err) {
      setError(
        err.message || "Could not save this activity."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ marginTop: 14 }}>
      <button
        type="button"
        onClick={() => {
          setOpen(!open);
          setError("");
          setSuccess("");
        }}
        style={{
          width: "100%",
          padding: "11px 14px",
          borderRadius: 12,
          border: "1px solid #ff9fc1",
          background: "#443243",
          color: "#ffb4c9",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        {open ? "Cancel" : "＋ Add to Trip"}
      </button>

      {success && (
        <p
          role="status"
          style={{
            color: "#86efac",
            fontSize: 13,
            marginTop: 10,
          }}
        >
          ✅ {success}
        </p>
      )}

      {open && (
        <div
          style={{
            marginTop: 12,
            padding: 15,
            background: "#252638",
            borderRadius: 12,
            border: "1px solid #51465d",
          }}
        >
          <p
            style={{
              color: "#fff",
              fontWeight: 700,
              margin: "0 0 12px",
            }}
          >
            🧳 Choose Your Trip
          </p>

          {loading ? (
            <p role="status">Loading trips...</p>
          ) : eligibleTrips.length === 0 && !error ? (
            <div>
              <p
                style={{
                  color: "#ffc9d5",
                  fontSize: 13,
                }}
              >
                No trips match this destination
                and date.
              </p>

              <Link
                to="/trips"
                style={{
                  color: "#ffb56b",
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                Create or edit a trip →
              </Link>
            </div>
          ) : (
            eligibleTrips.length > 0 && (
              <>
                <select
                  aria-label="Choose a trip"
                  value={selectedTrip}
                  onChange={(event) =>
                    setSelectedTrip(event.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: 11,
                    borderRadius: 9,
                    background: "#302c40",
                    border: "1px solid #65546c",
                    color: "#fff",
                    marginBottom: 12,
                  }}
                >
                  <option value="">
                    Select a trip
                  </option>

                  {eligibleTrips.map((trip) => (
                    <option
                      key={trip.id}
                      value={trip.id}
                    >
                      {trip.name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  disabled={saving || !selectedTrip}
                  onClick={handleSave}
                  style={{
                    width: "100%",
                    padding: 11,
                    borderRadius: 10,
                    border: "none",
                    background: "#ffb56b",
                    color: "#282334",
                    fontWeight: 800,
                    cursor: saving ? "wait" : "pointer",
                    opacity:
                      saving || !selectedTrip ? 0.6 : 1,
                  }}
                >
                  {saving
                    ? "Saving..."
                    : "Save Activity ✨"}
                </button>
              </>
            )
          )}

          {error && (
            <p
              role="alert"
              style={{
                color: "#fca5a5",
                fontSize: 13,
                marginTop: 12,
              }}
            >
              ⚠️ {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
