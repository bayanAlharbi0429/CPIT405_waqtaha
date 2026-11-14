
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

// Format destination-local time without timezone conversion.
function formatTime(value) {
  if (!value || !value.includes("T")) {
    return {
      date: value || "",
      time: "",
      shortTime: "",
    };
  }

  const [datePart, timePart] = value.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);

  const calendarDate = new Date(
    Date.UTC(year, month - 1, day)
  );

  const date = calendarDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

  const hour12 = hour % 12 || 12;
  const period = hour >= 12 ? "PM" : "AM";

  return {
    date,
    time: `${hour12}:${String(minute).padStart(2, "0")} ${period}`,
    shortTime:
      minute === 0
        ? `${hour12} ${period}`
        : `${hour12}:${String(minute).padStart(2, "0")} ${period}`,
  };
}

// Two-line labels: date on top, time underneath.
function ChartTick({ x, y, payload }) {
  const formatted = formatTime(payload.value);

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={15}
        textAnchor="middle"
        fill="#b8b3ca"
        fontSize={11}
        fontWeight={500}
      >
        {formatted.date}
      </text>

      <text
        x={0}
        y={32}
        textAnchor="middle"
        fill="#ffb56b"
        fontSize={12}
        fontWeight={700}
      >
        {formatted.shortTime}
      </text>
    </g>
  );
}

function ScoreTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const hour = payload[0].payload;
  const formatted = formatTime(hour.time);

  const score = Math.round(hour.score);

  const label =
    score >= 75
      ? "Excellent ✨"
      : score >= 50
      ? "Good ☀️"
      : "Not ideal 🌧️";

  return (
    <div
      style={{
        background: "#292535",
        border: "1px solid #62566c",
        borderRadius: 16,
        padding: "16px 20px",
        boxShadow: "0 12px 30px #0005",
      }}
    >
      <p
        style={{
          color: "#bdb5ce",
          fontSize: 13,
          margin: "0 0 4px",
        }}
      >
        {formatted.date}
      </p>

      <p
        style={{
          color: "#fff",
          fontSize: 22,
          fontWeight: 800,
          margin: "0 0 10px",
        }}
      >
        {formatted.time}
      </p>

      <p
        style={{
          color: "#ffb56b",
          fontSize: 20,
          fontWeight: 700,
          margin: "0 0 4px",
        }}
      >
        {score}/100
      </p>

      <p style={{ color: "#ffccd5", margin: 0 }}>
        {label}
      </p>
    </div>
  );
}

export default function HourlyChart({ hours = [] }) {
  const chartData = hours.map((hour) => ({
    time: hour.time,
    score: hour.score,
  }));

  if (chartData.length === 0) {
    return <p>No weather results available.</p>;
  }

  // Show a few readable ticks instead of every hour.
  const step = Math.max(
    1,
    Math.ceil((chartData.length - 1) / 5)
  );

  const tickValues = chartData
    .filter(
      (_, index) =>
        index % step === 0 ||
        index === chartData.length - 1
    )
    .map((item) => item.time);

  return (
    <section
      style={{
        width: "100%",
        minWidth: 0,
        marginTop: 28,
        padding: "24px 16px",
        borderRadius: 22,
        boxSizing: "border-box",
        background:
          "linear-gradient(145deg, #292333, #1e2533)",
        border: "1px solid #494050",
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <span
          style={{
            display: "inline-block",
            background: "#473247",
            color: "#ffb7ca",
            padding: "7px 13px",
            borderRadius: 30,
            fontSize: 12,
            fontWeight: 700,
            marginBottom: 14,
          }}
        >
          ✨ WEATHER VIBES
        </span>

        <h2
          style={{
            fontSize: 24,
            margin: "0 0 8px",
            color: "#fff",
          }}
        >
          Your Best Hours 🌤️
        </h2>

        <p
          style={{
            color: "#b8b3ca",
            fontSize: 14,
            margin: 0,
          }}
        >
          Discover when the weather matches your plans!
        </p>
      </div>

      <div
        role="img"
        aria-label="Hourly activity suitability scores from 0 to 100"
        style={{ width: "100%", height: 340 }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{
              top: 20,
              right: 18,
              left: -16,
              bottom: 18,
            }}
          >
            <defs>
              <linearGradient
                id="waqtahaChartGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#ff92ae"
                  stopOpacity={0.5}
                />
                <stop
                  offset="100%"
                  stopColor="#ff92ae"
                  stopOpacity={0.01}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              vertical={false}
              stroke="#51485d"
              strokeDasharray="4 6"
            />

            <XAxis
              dataKey="time"
              ticks={tickValues}
              tick={<ChartTick />}
              tickLine={false}
              axisLine={false}
              interval={0}
              height={55}
            />

            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#b8b3ca",
                fontSize: 12,
              }}
            />

            <Tooltip
              content={<ScoreTooltip />}
              cursor={{
                stroke: "#ffb56b",
                strokeDasharray: "4 4",
              }}
            />

            <ReferenceLine
              y={75}
              stroke="#ffb56b"
              strokeDasharray="5 5"
              strokeOpacity={0.6}
            />

            <Area
              type="linear"
              dataKey="score"
              stroke="#ff92ae"
              strokeWidth={3}
              fill="url(#waqtahaChartGradient)"
              activeDot={{
                r: 6,
                fill: "#ffb56b",
                stroke: "#fff",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p
        style={{
          fontSize: 12,
          color: "#aaa3b8",
          textAlign: "center",
          margin: "8px 0 0",
        }}
      >
        Scores closer to 100 mean better conditions ✨
      </p>
    </section>
  );
}
