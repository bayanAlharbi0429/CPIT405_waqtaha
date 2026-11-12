// Helpers for the profile page: factor list, quick styles, and weight math.
// Weights keys follow the data contract in the team guide.

export const FACTORS = [
  { key: "temperature", label: "Temperature", hint: "How much heat or cold bothers you", color: "#ff9a3d" },
  { key: "humidity", label: "Humidity", hint: "Sticky air and sweaty hours", color: "#2dd4bf" },
  { key: "wind", label: "Wind", hint: "Breezy or calm hours", color: "#a3e635" },
  { key: "uv", label: "UV index", hint: "Strong sun on your skin", color: "#fbbf24" },
  { key: "clouds", label: "Cloud cover", hint: "Clear skies or overcast", color: "#a78bfa" },
  { key: "rain", label: "Rain chance", hint: "Getting wet", color: "#60a5fa" },
  { key: "sunTiming", label: "Sunrise and sunset", hint: "Being close to golden hour", color: "#ff5d8f" },
];

// Quick styles: ready-made slider positions
export const PRESETS = [
  { label: "Handles heat", values: { temperature: 10, humidity: 30, wind: 15, uv: 15, clouds: 10, rain: 20, sunTiming: 0 } },
  { label: "Cool and calm", values: { temperature: 35, humidity: 15, wind: 20, uv: 10, clouds: 5, rain: 15, sunTiming: 0 } },
  { label: "UV careful", values: { temperature: 10, humidity: 10, wind: 5, uv: 45, clouds: 10, rain: 15, sunTiming: 5 } },
  { label: "Golden hour hunter", values: { temperature: 5, humidity: 0, wind: 10, uv: 5, clouds: 25, rain: 15, sunTiming: 40 } },
];

// What the sun says for each mood (mood = the factor you care about most)
export const MOOD_MESSAGES = {
  temperature: "Temperature matters most to you. I'll watch the heat.",
  humidity: "Humidity is your top concern. I'll avoid the sticky hours.",
  wind: "You care most about wind. I'll look for calm hours.",
  uv: "UV comes first for you. Sunglasses on!",
  clouds: "You love clear skies. I'll keep an eye on the clouds.",
  rain: "Rain worries you most. I'll help you stay dry.",
  sunTiming: "Golden hour is your thing. Lovely choice!",
  balanced: "Nicely balanced. I'll weigh everything fairly.",
};

const sumOf = (weights) => Object.values(weights).reduce((a, b) => a + b, 0);

// The factor with the biggest weight
export function getTopFactor(weights) {
  return FACTORS.reduce((best, f) => (weights[f.key] > weights[best.key] ? f : best), FACTORS[0]).key;
}

// Mood of the sun: the top factor if it has at least 30% of the total, else "balanced"
export function getMood(weights) {
  const total = sumOf(weights);
  if (!total) return "balanced";
  const top = getTopFactor(weights);
  return (weights[top] / total) * 100 >= 30 ? top : "balanced";
}

// Scale the weights so they add up to exactly 100 (whole numbers).
// Returns null when every weight is 0.
export function normalizeWeights(weights) {
  const keys = Object.keys(weights);
  const total = sumOf(weights);
  if (!total) return null;

  const exact = keys.map((k) => (weights[k] / total) * 100);
  const floors = exact.map(Math.floor);
  const missing = 100 - floors.reduce((a, b) => a + b, 0);

  // Give the leftover points to the biggest fractions
  const order = exact.map((v, i) => ({ i, rest: v - floors[i] })).sort((a, b) => b.rest - a.rest);
  for (let n = 0; n < missing; n++) floors[order[n].i] += 1;

  return Object.fromEntries(keys.map((k, i) => [k, floors[i]]));
}