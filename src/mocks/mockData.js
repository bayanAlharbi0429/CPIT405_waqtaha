// Mock data that follows the data contract in the team guide.
// Used for development until the real API and scoring engine are ready.

export const mockDestination = {
  name: "Jeddah",
  country: "Saudi Arabia",
  lat: 21.54,
  lon: 39.17,
  timezone: "Asia/Riyadh",
};

const pad = (n) => String(n).padStart(2, "0");

// 48 hours of fake weather (2 days). Time format: "YYYY-MM-DDTHH:mm"
// in the destination's local time. Do not convert with new Date().
export const mockHourly = Array.from({ length: 48 }, (_, i) => {
  const day = 12 + Math.floor(i / 24);
  const hour = i % 24;
  const isDay = hour >= 6 && hour < 18;
  return {
    time: `2026-11-${pad(day)}T${pad(hour)}:00`,
    temperature: Math.round(26 + 6 * Math.sin(((hour - 9) / 24) * 2 * Math.PI)),
    humidity: 60,
    windSpeed: 12 + (hour % 5),
    uvIndex: isDay ? Math.round(8 * Math.sin(((hour - 6) / 12) * Math.PI)) : 0,
    cloudCover: (hour * 7) % 60,
    precipitationProbability: hour % 6 === 0 ? 10 : 0,
    isDay,
  };
});

export const mockSunTimes = {
  "2026-11-12": { sunrise: "2026-11-12T06:12", sunset: "2026-11-12T17:05" },
  "2026-11-13": { sunrise: "2026-11-13T06:13", sunset: "2026-11-13T17:04" },
};