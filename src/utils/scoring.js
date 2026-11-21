// STUB: returns fake scores in the correct shape so other pages can be built now.
// Owner: Arwa. Replace the body with the real engine (trapezoid + weights + hard rules).
// IMPORTANT: keep the function name, the inputs, and the output shape exactly the same.

// src/utils/scoring.js
// The Scoring Engine. Turns hourly weather into a 0-100 score per hour.
//
// IMPORTANT (Rule 2): the signature of scoreHours NEVER changes:
//   scoreHours(hourly, activityKey, weights, sunTimes) -> ScoredHour[]
// If the skeleton's stub uses `export default` instead of a named export,
// change the export line below to match the stub, so Taghreed's imports keep working.

import { getActivity, HARD_RULES } from "./activities.js";
// Opening days/hours of the KAU Sports Tent live ONLY in campusData.js (Bayan).
import { isTentOpen } from "./campusData.js";

/**
 * Trapezoid function: gives a number from 0 to 1.
 * range = [zeroBelow, idealMin, idealMax, zeroAbove]
 */
export function trapezoid(value, range) {
  const [zeroBelow, idealMin, idealMax, zeroAbove] = range;

  // Missing data (null / NaN) counts as "not suitable" instead of crashing.
  if (!Number.isFinite(value)) return 0;

  // 1) Inside the ideal range -> perfect.
  if (value >= idealMin && value <= idealMax) return 1;

  // 2) Outside the extreme limits -> useless.
  if (value <= zeroBelow || value >= zeroAbove) return 0;

  // 3) In between -> straight line. We only reach here when
  //    zeroBelow < value < idealMin or idealMax < value < zeroAbove,
  //    so we never divide by zero.
  if (value < idealMin) return (value - zeroBelow) / (idealMin - zeroBelow);
  return (zeroAbove - value) / (zeroAbove - idealMax);
}

/**
 * Convert "YYYY-MM-DDTHH:mm" to minutes, WITHOUT changing time zones (Rule 4).
 * We read the numbers from the string and build the time as UTC only so that
 * subtracting two times gives the right difference. The result is never shown.
 */
function toMinutes(timeString) {
  const [date, clock] = timeString.split("T");
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = clock.split(":").map(Number);
  return Date.UTC(year, month - 1, day, hour, minute) / 60000;
}

/**
 * Golden hour factor (0 to 1) for photography.
 * 1 = within 45 minutes of sunrise or sunset, 0 = more than 2 hours away.
 */
function sunTimingFactor(time, sunTimes) {
  const day = sunTimes && sunTimes[time.slice(0, 10)]; // "YYYY-MM-DD"
  if (!day) return 0;

  const now = toMinutes(time);
  const distance = Math.min(
    Math.abs(now - toMinutes(day.sunrise)),
    Math.abs(now - toMinutes(day.sunset))
  );
  return trapezoid(distance, [-1, 0, 45, 120]);
}

/** Round to 2 decimals so the factors are easy to read. */
const round2 = (n) => Math.round(n * 100) / 100;

/**
 * Score every hour for one activity.
 * - hourly:      array from getForecast().hourly
 * - activityKey: "running" | "photography" | "beach"
 * - weights:     user's custom weights, or null/undefined to use the defaults
 * - sunTimes:    object from getForecast().sunTimes
 */
export function scoreHours(hourly, activityKey, weights, sunTimes) {
  const activity = getActivity(activityKey);
  if (!activity) {
    throw new Error(`Unknown activity: ${activityKey}`);
  }

  const w = weights || activity.weights;

  // Normalise: if the weights do not add up to 100 (sliders can be anything),
  // we divide by their total so the final score still stays between 0 and 100.
  const totalWeight = Object.values(w).reduce((sum, n) => sum + n, 0);

  return hourly.map((hour) => {
    // Step 1: each weather value -> a factor between 0 and 1.
    const factors = {
      temperature: trapezoid(hour.temperature, activity.idealRanges.temperature),
      humidity: trapezoid(hour.humidity, activity.idealRanges.humidity),
      wind: trapezoid(hour.windSpeed, activity.idealRanges.wind),
      uv: trapezoid(hour.uvIndex, activity.idealRanges.uv),
      clouds: trapezoid(hour.cloudCover, activity.idealRanges.clouds),
      rain: trapezoid(hour.precipitationProbability, activity.idealRanges.rain),
      sunTiming: activity.usesGoldenHour ? sunTimingFactor(hour.time, sunTimes) : 0,
    };

    // Step 2: hour score = sum of (weight x factor), scaled to 0-100.
    let weightedSum = 0;
    for (const name of Object.keys(factors)) {
      weightedSum += (w[name] || 0) * factors[name];
    }
    let score = totalWeight > 0 ? (weightedSum / totalWeight) * 100 : 0;

    // Step 3: hard rules (caps). The strictest rule wins.
    let capped = false;
    let reason = null;

    if (hour.precipitationProbability >= HARD_RULES.rainChanceLimit &&
        score > HARD_RULES.rainCapScore) {
      score = HARD_RULES.rainCapScore;
      capped = true;
      reason = "High chance of rain";
    }

    if (activity.daytimeOnly && !hour.isDay) {
      score = 0;
      capped = true;
      reason = "Night time";
    }

    // Campus rule: the Sports Tent is closed outside university hours.
    // It runs last so it wins over the rain cap (score 0 is stricter than 20).
    if (activityKey === "sportsTent" && !isTentOpen(hour.time)) {
      score = 0;
      capped = true;
      reason = "Outside campus hours";
    }

    // Round factors and score for the final output (shape = data contract).
    const roundedFactors = {};
    for (const name of Object.keys(factors)) {
      roundedFactors[name] = round2(factors[name]);
    }

    return {
      time: hour.time,
      score: Math.round(score),
      capped,
      reason,
      factors: roundedFactors,
    };
  });
}
