
function formatDateTime(value) {
  if (!value || !value.includes("T")) {
    return {
      date: value || "Unknown date",
      time: "--:--",
      period: "",
    };
  }

  const [datePart, timePart] = value.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);

  const dateObject = new Date(Date.UTC(year, month - 1, day));

  const date = dateObject.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

  return {
    date,
    time: `${hour % 12 || 12}:${String(minute).padStart(2, "0")}`,
    period: hour >= 12 ? "PM" : "AM",
  };
}

const cardStyles = [
  {
    background: "linear-gradient(145deg, #543638, #342b3e)",
    accent: "#ffb66e",
    rank: "🥇 #1 BEST",
  },
  {
    background: "linear-gradient(145deg, #513246, #312c43)",
    accent: "#ff9fc1",
    rank: "🥈 #2 BEST",
  },
  {
    background: "linear-gradient(145deg, #393650, #292d45)",
    accent: "#c4a7ff",
    rank: "🥉 #3 BEST",
  },
];

function getScoreStatus(score) {
  if (score >= 75) {
    return { label: "Excellent", emoji: "✨" };
  }

  if (score >= 50) {
    return { label: "Good", emoji: "☀️" };
  }

  return { label: "Not ideal", emoji: "🌧️" };
}

export default function TopTimes({ hours = [] }) {
  const top3 = [...hours]
    .filter((hour) => Number.isFinite(hour.score))
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.time.localeCompare(b.time)
    )
    .slice(0, 3);

  return (
    <section style={{ marginTop: 36, width: "100%" }}>
      <div style={{ marginBottom: 22 }}>
        <span
          style={{
            display: "inline-block",
            color: "#ffb56b",
            background: "#443540",
            padding: "7px 13px",
            borderRadius: 25,
            fontSize: 12,
            fontWeight: 700,
            marginBottom: 12,
          }}
        >
          ⭐ THE BEST PICKS
        </span>

        <h2
          style={{
            color: "#fff",
            fontSize: 27,
            margin: "0 0 8px",
          }}
        >
          Your Top 3 Times 🏆
        </h2>

        <p
          style={{
            color: "#b8b3ca",
            fontSize: 14,
            margin: 0,
          }}
        >
          The weather picked its favorites. Here they are!
        </p>
      </div>

      {top3.length === 0 ? (
        <p style={{ color: "#b8b3ca" }}>
          No suitable times available.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(195px, 1fr))",
            gap: 16,
          }}
        >
          {top3.map((hour, index) => {
            const style = cardStyles[index];
            const formatted = formatDateTime(hour.time);
            const status = getScoreStatus(hour.score);

            return (
              <article
                key={hour.time}
                style={{
                  background: style.background,
                  border: `1px solid ${style.accent}55`,
                  borderRadius: 22,
                  padding: "25px 16px",
                  textAlign: "center",
                  boxShadow: "0 10px 24px #0002",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    background: "#ffffff15",
                    color: style.accent,
                    padding: "8px 14px",
                    borderRadius: 30,
                    fontSize: 12,
                    fontWeight: 800,
                    marginBottom: 20,
                  }}
                >
                  {style.rank}
                </span>

                <p
                  style={{
                    color: "#e5dce7",
                    fontSize: 13,
                    fontWeight: 600,
                    margin: "0 0 10px",
                  }}
                >
                  📅 {formatted.date}
                </p>

                <div style={{ marginBottom: 20 }}>
                  <strong
                    style={{
                      display: "block",
                      fontSize: 34,
                      color: "#fff",
                      letterSpacing: "-1px",
                    }}
                  >
                    {formatted.time}
                  </strong>

                  <span
                    style={{
                      color: "#f6d9de",
                      fontSize: 15,
                      fontWeight: 700,
                    }}
                  >
                    {formatted.period}
                  </span>
                </div>

                <div
                  style={{
                    borderTop: "1px solid #ffffff25",
                    paddingTop: 17,
                  }}
                >
                  <strong
                    style={{
                      color: style.accent,
                      fontSize: 35,
                    }}
                  >
                    {Math.round(hour.score)}
                    <span style={{ fontSize: 16 }}>/100</span>
                  </strong>

                  <p
                    style={{
                      color: style.accent,
                      fontWeight: 700,
                      fontSize: 14,
                      margin: "7px 0 0",
                    }}
                  >
                    {status.label} {status.emoji}
                  </p>

                  {hour.capped && hour.reason && (
                    <p
                      style={{
                        color: "#f4cfca",
                        fontSize: 12,
                        marginTop: 12,
                      }}
                    >
                      ⚠️ {hour.reason}
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
