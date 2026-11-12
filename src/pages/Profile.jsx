// Profile page (protected). Owner: Bayan.
// Part 1: edit the display name. Part 2: custom weights for each activity.
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useSunMood } from "../context/MoodContext";
import { ACTIVITIES } from "../utils/activities";
import { FACTORS, PRESETS, getMood, getTopFactor, normalizeWeights } from "../utils/weightsHelpers";
import { getEffectiveWeights, saveActivityWeights, updateUserName } from "../services/profileApi";

const ACTIVITY_KEYS = Object.keys(ACTIVITIES);
const NO_MSG = { type: "", text: "" };

export default function Profile() {
  const { currentUser, refreshUser } = useAuth();
  const { setMood } = useSunMood();

  // Account section
  const [name, setName] = useState(currentUser.displayName || "");
  const [savingName, setSavingName] = useState(false);
  const [nameMsg, setNameMsg] = useState(NO_MSG);

  // Weights section: weights = { running: {...}, photography: {...}, beach: {...} }
  const [activity, setActivity] = useState(ACTIVITY_KEYS[0]);
  const [weights, setWeights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(NO_MSG);

  // Load the saved weights (or the defaults) for every activity
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const entries = await Promise.all(
          ACTIVITY_KEYS.map(async (key) => [key, await getEffectiveWeights(currentUser.uid, key)])
        );
        if (!cancelled) setWeights(Object.fromEntries(entries));
      } catch (err) {
        if (!cancelled) setLoadError("Could not load your preferences. Please refresh the page.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [currentUser.uid]);

  // The sun reacts to the factor you care about most
  useEffect(() => {
    if (weights) setMood(getMood(weights[activity]));
  }, [weights, activity, setMood]);

  // When leaving this page, the sun goes back to normal
  useEffect(() => () => setMood(null), [setMood]);

  const current = weights ? weights[activity] : null;
  const total = current ? Object.values(current).reduce((a, b) => a + b, 0) : 0;
  const share = (key) => (total ? Math.round((current[key] / total) * 100) : 0);

  // Donut chart: one colored slice per factor
  const donutBackground = useMemo(() => {
    if (!current || !total) return "rgba(255, 255, 255, 0.1)";
    let acc = 0;
    const stops = FACTORS.map((f) => {
      const start = acc;
      acc += (current[f.key] / total) * 100;
      return `${f.color} ${start}% ${acc}%`;
    });
    return `conic-gradient(${stops.join(", ")})`;
  }, [current, total]);

  const topFactor = current ? FACTORS.find((f) => f.key === getTopFactor(current)) : null;

  function setCurrent(next) {
    setSaveMsg(NO_MSG);
    setWeights((prev) => ({ ...prev, [activity]: next }));
  }

  function changeFactor(key, value) {
    setCurrent({ ...current, [key]: Number(value) });
  }

  async function handleNameSubmit(e) {
    e.preventDefault();
    setNameMsg(NO_MSG);

    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setNameMsg({ type: "error", text: "Please enter at least 2 characters." });
      return;
    }

    try {
      setSavingName(true);
      await updateUserName(currentUser, trimmed);
      refreshUser();
      setNameMsg({ type: "ok", text: "Name updated." });
    } catch (err) {
      setNameMsg({ type: "error", text: "Could not update your name. Please try again." });
    } finally {
      setSavingName(false);
    }
  }

  // Save all activities at once, scaled so each one adds up to 100
  async function handleSave() {
    setSaveMsg(NO_MSG);

    const normalized = {};
    for (const key of ACTIVITY_KEYS) {
      const result = normalizeWeights(weights[key]);
      if (!result) {
        setSaveMsg({ type: "error", text: `Set at least one factor above 0 for ${ACTIVITIES[key].label}.` });
        return;
      }
      normalized[key] = result;
    }

    try {
      setSaving(true);
      await Promise.all(
        ACTIVITY_KEYS.map((key) => saveActivityWeights(currentUser.uid, key, normalized[key]))
      );
      setWeights(normalized);
      setSaveMsg({ type: "ok", text: "Saved! Your weights now apply to every search." });
    } catch (err) {
      setSaveMsg({ type: "error", text: "Could not save. Check your connection and try again." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <h1 className="reveal">
        Your <span className="marker">profile</span>
      </h1>
      <p className="auth-sub reveal" style={{ "--i": 1 }}>
        Manage your account and tell Waqtaha what weather matters to you.
      </p>

      <section className="glass section reveal" style={{ "--i": 2 }}>
        <h2>Account</h2>
        <p className="section-sub">This is how you appear in the app.</p>

        <form className="inline-form" onSubmit={handleNameSubmit}>
          <div className="field">
            <label htmlFor="profile-name">Full name</label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <button type="submit" disabled={savingName}>
            {savingName ? "Saving..." : "Save name"}
          </button>
        </form>

        {nameMsg.text && (
          <div className={`msg msg-${nameMsg.type}`} role="status">{nameMsg.text}</div>
        )}
        <p className="readonly">Email: {currentUser.email}</p>
      </section>

      <section className="glass section reveal" style={{ "--i": 3 }}>
        <h2>What matters to you</h2>
        <p className="section-sub">
          Move the sliders to set how much each factor counts for each activity.
          Your weights are used in every search.
        </p>

        {loading && <p className="section-sub">Loading your preferences...</p>}
        {loadError && <div className="msg msg-error" role="alert">{loadError}</div>}

        {current && (
          <>
            <div className="tabs" role="group" aria-label="Choose an activity">
              {ACTIVITY_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  className="tab"
                  aria-pressed={activity === key}
                  onClick={() => setActivity(key)}
                >
                  {ACTIVITIES[key].label}
                </button>
              ))}
            </div>

            <div className="chips">
              <span className="chips-label">Quick styles:</span>
              {PRESETS.map((p) => (
                <button key={p.label} type="button" className="chip" onClick={() => setCurrent({ ...p.values })}>
                  {p.label}
                </button>
              ))}
              <button
                type="button"
                className="chip"
                onClick={() => setCurrent({ ...ACTIVITIES[activity].weights })}
              >
                Reset
              </button>
            </div>

            <div className="weights-layout">
              <div>
                {FACTORS.map((f) => (
                  <div className="factor" key={f.key}>
                    <div className="factor-head">
                      <label htmlFor={`w-${f.key}`}>
                        <span className="dot" style={{ background: f.color }} />
                        {f.label}
                      </label>
                      <span className="factor-pct">{share(f.key)}%</span>
                    </div>
                    <p className="factor-hint">{f.hint}</p>
                    <input
                      id={`w-${f.key}`}
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={current[f.key]}
                      style={{ "--p": `${current[f.key]}%` }}
                      onChange={(e) => changeFactor(f.key, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <div className="donut-wrap">
                <div className="donut-box">
                  <div className="donut" style={{ background: donutBackground }} />
                  <div className="donut-label">
                    <span className="donut-small">Top factor</span>
                    <strong>{topFactor.label}</strong>
                  </div>
                </div>
                <p className="hint">The shares always add up to 100% when you save.</p>
              </div>
            </div>

            <div className="save-row">
              <button type="button" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save my weights"}
              </button>
            </div>
            {saveMsg.text && (
              <div className={`msg msg-${saveMsg.type}`} role="status">{saveMsg.text}</div>
            )}
          </>
        )}
      </section>
    </div>
  );
}