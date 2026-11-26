import ScoreRing from "./ScoreRing";

// Use UTC only to label a destination-local calendar date; do not shift the hour.
function formatDateTime(value) {
  if (!value?.includes("T")) return { date: "Unknown date", time: "--:--" };
  const [datePart, timePart] = value.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day)).toLocaleDateString(
    "en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" }
  );
  return {
    date,
    time: `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`,
  };
}

const cards = [
  { rank: "🥇 #1 BEST", accent: "#ffb66e" },
  { rank: "🥈 #2 BEST", accent: "#ff9fc1" },
  { rank: "🥉 #3 BEST", accent: "#c4a7ff" },
];

export default function TopTimes({ hours = [] }) {
  const best = [...hours]
    .filter((hour) =>
      Number.isFinite(hour.score) &&
      hour.score > 0 &&
      !(hour.capped && hour.reason === "Outside campus hours")
    )
    .sort((a, b) => b.score - a.score || a.time.localeCompare(b.time))
    .slice(0, 3);

  return (
    <section className="glass section" style={{ marginTop: 24 }}>
      <span className="tag">⭐ THE BEST PICKS</span>
      <h2 style={{ margin: "14px 0 6px" }}>Your Top 3 Times 🏆</h2>
      <p className="section-sub">
        The best available hours for your activity — no closed or zero-score slots.
      </p>
      {best.length === 0 ? (
        <p className="msg">No suitable times match your filter. Try a lower minimum score.</p>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(195px, 1fr))",
          gap: 16,
        }}>
          {best.map((hour, index) => {
            const slot = formatDateTime(hour.time);
            return (
              <article key={hour.time} className="glass" style={{
                borderColor: `${cards[index].accent}77`,
                padding: 20,
                textAlign: "center",
              }}>
                <span style={{ color: cards[index].accent, fontWeight: 800, fontSize: 13 }}>
                  {cards[index].rank}
                </span>
                <p style={{ color: "var(--muted)", margin: "14px 0 4px" }}>
                  📅 {slot.date}
                </p>
                <h3 style={{ fontSize: 23, margin: "4px 0 16px" }}>{slot.time}</h3>
                <ScoreRing score={Math.round(hour.score)} size={92} />
                {hour.capped && hour.reason && (
                  <p className="msg msg-error" style={{ marginTop: 12 }}>⚠ {hour.reason}</p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
