// Activities are plain data, so adding a new activity needs no new logic.
// Weights of each activity sum to 100.
// Owner: Arwa (she will add idealRanges for the scoring engine).

export const ACTIVITIES = {
  running: {
    key: "running",
    label: "Running",
    type: "urban", // used for the filter: marine, mountain, desert, urban
    weights: { temperature: 30, humidity: 25, wind: 10, uv: 15, clouds: 5, rain: 15, sunTiming: 0 },
  },
  photography: {
    key: "photography",
    label: "Photography",
    type: "urban",
    weights: { temperature: 5, humidity: 0, wind: 10, uv: 5, clouds: 30, rain: 15, sunTiming: 35 },
  },
  beach: {
    key: "beach",
    label: "Beach",
    type: "marine",
    weights: { temperature: 25, humidity: 10, wind: 10, uv: 30, clouds: 10, rain: 15, sunTiming: 0 },
  },
};