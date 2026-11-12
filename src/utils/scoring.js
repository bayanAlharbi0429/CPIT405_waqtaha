// STUB: returns fake scores in the correct shape so other pages can be built now.
// Owner: Arwa. Replace the body with the real engine (trapezoid + weights + hard rules).
// IMPORTANT: keep the function name, the inputs, and the output shape exactly the same.

export function scoreHours(hourly, activityKey, weights, sunTimes) {
  return hourly.map((h) => {
    const hour = Number(h.time.slice(11, 13));
    const score = h.isDay
      ? 50 + Math.round(30 * Math.sin(((hour - 6) / 12) * Math.PI))
      : 0;
    return {
      time: h.time,
      score,
      capped: false,
      reason: null,
      factors: { temperature: 1, humidity: 1, wind: 1, uv: 1, clouds: 1, rain: 1, sunTiming: 0 },
    };
  });
}