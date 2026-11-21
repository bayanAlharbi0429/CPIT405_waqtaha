// Activities are plain data, so adding a new activity needs no new logic.
// Weights of each activity sum to 100.
// Owner: Arwa (she will add idealRanges for the scoring engine).

// src/utils/activities.js
// Every activity is PLAIN DATA (no logic). To add a new activity later you
// only add one more object to ACTIVITIES; scoring.js does not change.
//
// Trapezoid ideal ranges are [zeroBelow, idealMin, idealMax, zeroAbove]:
//   value inside [idealMin, idealMax]  -> factor = 1 (perfect)
//   value <= zeroBelow or >= zeroAbove -> factor = 0 (terrible)
//   in between                         -> drops in a straight line
//
// Units: temperature °C, humidity %, wind km/h, uv index, clouds %,
// rain = probability of rain %.
//
// Weights come from the team guide (Section 7). Each row sums to 100.
// These are starting values: adjust them after testing on real data.

export const ACTIVITIES = {
  running: {
    key: "running",
    label: "Running",
    type: "urban",
    description: "Cool, dry, calm hours with low sun intensity.",
    // Which kinds of places this activity suits (used by the Explore filter).
    types: ["urban", "mountain", "desert"],
    weights: {
      temperature: 30, humidity: 25, wind: 10, uv: 15, clouds: 5, rain: 15, sunTiming: 0,
    },
    idealRanges: {
      temperature: [5, 12, 22, 35],
      humidity: [10, 30, 60, 90],
      wind: [0, 0, 15, 40],
      uv: [0, 0, 5, 11],
      clouds: [0, 0, 70, 100],
      rain: [0, 0, 10, 60],
    },
    usesGoldenHour: false,
    daytimeOnly: true,
  },
  photography: {
    key: "photography",
    label: "Photography",
    type: "urban",
    description: "Soft light near sunrise and sunset, a few clouds, no rain.",
    types: ["marine", "mountain", "desert", "urban"],
    weights: {
      temperature: 5, humidity: 0, wind: 10, uv: 5, clouds: 30, rain: 15, sunTiming: 35,
    },
    idealRanges: {
      temperature: [0, 10, 30, 40],
      humidity: [0, 0, 100, 100],
      wind: [0, 0, 25, 50],
      uv: [0, 0, 11, 13],
      clouds: [0, 20, 70, 100], // a few clouds make the sky more interesting
      rain: [0, 0, 10, 50],
    },
    usesGoldenHour: true, // sunTiming factor is calculated for this activity
    daytimeOnly: true,
  },
  beach: {
    key: "beach",
    label: "Beach",
    type: "marine",
    description: "Warm, sunny, light wind. UV must not be extreme.",
    types: ["marine"],
    weights: {
      temperature: 25, humidity: 10, wind: 10, uv: 30, clouds: 10, rain: 15, sunTiming: 0,
    },
    idealRanges: {
      temperature: [20, 27, 34, 42],
      humidity: [20, 30, 70, 95],
      wind: [0, 0, 20, 45],
      uv: [0, 0, 7, 11], // high UV is a health risk, so it lowers the score
      clouds: [0, 0, 40, 90],
      rain: [0, 0, 10, 50],
    },
    usesGoldenHour: false,
    daytimeOnly: true,
  },
  // KAU Sports Tent: an INDOOR activity. Weather only affects the walk to the
  // tent. The opening hours are a hard rule inside scoreHours (scoring.js).
  sportsTent: {
    key: "sportsTent",
    label: "Sports Tent",
    type: "campus",
    description: "Stress relief and hobbies at KAU. Weather only affects your walk.",
    types: ["campus"],
    weights: {
      temperature: 30, humidity: 20, wind: 5, uv: 25, clouds: 5, rain: 15, sunTiming: 0,
    },
    idealRanges: {
      temperature: [10, 20, 29, 40],
      humidity: [10, 30, 60, 95],
      wind: [0, 0, 20, 45],
      uv: [0, 0, 5, 11],
      clouds: [0, 0, 100, 100], // clouds do not matter for an indoor activity
      rain: [0, 0, 10, 60],
    },
    usesGoldenHour: false,
    daytimeOnly: false, // the campus-hours rule replaces the "night" rule
  },
};

// Hard rules (caps) shared by all activities for now.
// If rain chance is at or above this %, the score can never exceed RAIN_CAP_SCORE.
export const HARD_RULES = {
  rainChanceLimit: 60,
  rainCapScore: 20,
};

// Environment types for the Explore filter.
export const ACTIVITY_TYPES = [
  { key: "all", label: "All" },
  { key: "campus", label: "Campus" },
  { key: "marine", label: "Marine" },
  { key: "mountain", label: "Mountain" },
  { key: "desert", label: "Desert" },
  { key: "urban", label: "Urban" },
];

/** Find one activity by its key ("running" | "photography" | "beach"). */
export function getActivity(activityKey) {
  return ACTIVITIES[activityKey];
}

/** Filter activities by environment type. "all" returns every activity. */
export function getActivitiesByType(typeKey) {
  const all = Object.values(ACTIVITIES);
  if (typeKey === "all") return all;
  return all.filter((a) => a.types.includes(typeKey));
}



