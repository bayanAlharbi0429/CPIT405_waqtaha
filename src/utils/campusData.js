// Single source of truth for the KAU campus and the Sports Tent.
// Owner: Bayan. Everyone reads from here, nobody hardcodes these values elsewhere.

export const KAU_CAMPUS = {
  name: "KAU Campus",
  country: "Saudi Arabia",
  lat: 21.497723,
  lon: 39.231389,
  timezone: "Asia/Riyadh",
};

// ASSUMPTION: the tent follows the university day until we confirm its real hours.
// University week: Sunday to Thursday. 0 = Sunday ... 4 = Thursday.
export const SPORTS_TENT = {
  name: "KAU Sports Tent",
  openDays: [0, 1, 2, 3, 4],
  openHours: { from: 8, to: 16 }, // 8 AM to 4 PM ("to" is not included)
  // The tent is an enclosed space, so the weather mostly affects the walk to it.
  isIndoor: true,
  // TODO: replace with the real activities and hobbies offered at the tent
  offerings: [
    { label: "Light exercise", note: "Move and reset your mind" },
    { label: "Hobbies corner", note: "Do something you enjoy" },
    { label: "Stress relief", note: "Take a short break between lectures" },
  ],
};

// Starting weights for the "sportsTent" activity (they add up to 100).
// Used as a fallback until the activity exists in activities.js.
export const TENT_DEFAULT_WEIGHTS = {
  temperature: 30, humidity: 20, wind: 5, uv: 25, clouds: 5, rain: 15, sunTiming: 0,
};

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatHour(hour) {
  return `${hour % 12 || 12} ${hour < 12 ? "AM" : "PM"}`;
}

// time is "YYYY-MM-DDTHH:mm" in the destination's local time.
// We read the text directly, so no time zone conversion can shift the hour.
function parseSlot(time) {
  const [datePart, timePart] = time.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  return {
    weekday: new Date(year, month - 1, day).getDay(),
    month,
    day,
    hour: Number(timePart.slice(0, 2)),
  };
}

// Is this hour inside the campus hours?
export function isTentOpen(time) {
  const { weekday, hour } = parseSlot(time);
  return (
    SPORTS_TENT.openDays.includes(weekday) &&
    hour >= SPORTS_TENT.openHours.from &&
    hour < SPORTS_TENT.openHours.to
  );
}

// Friendly label for a slot, like { day: "Sunday", date: "Nov 22", hour: "9 AM" }
export function formatSlot(time) {
  const s = parseSlot(time);
  return { day: DAY_NAMES[s.weekday], date: `${MONTH_NAMES[s.month - 1]} ${s.day}`, hour: formatHour(s.hour) };
}

// Text like "Sunday to Thursday, 8 AM to 4 PM"
export function describeSchedule() {
  const days = SPORTS_TENT.openDays;
  const { from, to } = SPORTS_TENT.openHours;
  return `${DAY_NAMES[days[0]]} to ${DAY_NAMES[days[days.length - 1]]}, ${formatHour(from)} to ${formatHour(to)}`;
}