
// src/services/weatherApi.js
// Talks to Open-Meteo (free, no API key needed).
// This file ONLY fetches and reshapes data. It does not know about React.
// The component that calls these functions owns the "loading" and "error"
// states; here we just make sure that every failure throws an Error with a
// message that is safe to show directly to the user.

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

// If the server does not answer within 10 seconds we give up ("slow response").
const TIMEOUT_MS = 10000;

/**
 * Small helper used by both API functions.
 * It adds a timeout and turns every possible failure into a clear message.
 */
async function fetchJson(url) {
  // AbortController lets us cancel a request that takes too long.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });

    // fetch() does NOT throw on 404/500, so we check response.ok ourselves.
    if (!response.ok) {
      throw new Error(
        "The weather service had a problem. Please try again in a moment."
      );
    }
    return await response.json();
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("The weather service is taking too long. Please try again.");
    }
    // When there is no internet, fetch() throws a TypeError.
    if (error instanceof TypeError) {
      throw new Error("No internet connection. Check your network and try again.");
    }
    throw error; // already one of our friendly messages
  } finally {
    // Always stop the timer, whether we succeeded or failed.
    clearTimeout(timer);
  }
}

/**
 * Search a city by name.
 * Returns an array of Destination objects (see data contract, Section 6):
 *   { name, country, lat, lon, timezone }
 * Throws "city not found" if there are no matches.
 */
export async function searchDestinations(cityName) {
  const trimmed = (cityName || "").trim();
  if (trimmed.length < 2) {
    throw new Error("Please type at least 2 letters of a city name.");
  }

  // URLSearchParams builds and safely encodes the query string for us.
  const params = new URLSearchParams({
    name: trimmed,
    count: "5",
    language: "en",
    format: "json",
  });

  const data = await fetchJson(`${GEOCODING_URL}?${params}`);

  // When nothing matches, Open-Meteo leaves out the "results" key entirely.
  if (!data.results || data.results.length === 0) {
    throw new Error(`We could not find a city called "${trimmed}". Check the spelling.`);
  }

  // Rename Open-Meteo's fields to match OUR contract exactly.
  return data.results.map((place) => ({
    name: place.name,
    country: place.country || "",
    lat: place.latitude,
    lon: place.longitude,
    timezone: place.timezone,
  }));
}

/**
 * Get the hourly forecast for the next 7 days.
 * Returns exactly the shape from the data contract:
 * {
 *   hourly: [{ time, temperature, humidity, windSpeed, uvIndex, cloudCover,
 *              precipitationProbability, isDay }],
 *   sunTimes: { "YYYY-MM-DD": { sunrise, sunset } }
 * }
 * timezone=auto makes the API return times in the DESTINATION's local time
 * as "YYYY-MM-DDTHH:mm" (Rule 4). We must never convert these strings.
 */
export async function getForecast(lat, lon) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    hourly: [
      "temperature_2m",
      "relative_humidity_2m",
      "wind_speed_10m",
      "uv_index",
      "cloud_cover",
      "precipitation_probability",
      "is_day",
    ].join(","),
    daily: "sunrise,sunset",
    timezone: "auto",
    forecast_days: "7",
  });

  const data = await fetchJson(`${FORECAST_URL}?${params}`);

  // Make sure the parts we need are really there ("missing data" error).
  if (!data.hourly || !data.hourly.time || data.hourly.time.length === 0 || !data.daily) {
    throw new Error("The forecast data for this place is incomplete. Try another city.");
  }

  const h = data.hourly;

  // The API returns one separate array per weather value.
  // We combine them into one object per hour, which is easier to use.
  const hourly = h.time.map((time, i) => ({
    time, // already "YYYY-MM-DDTHH:mm" in local time
    temperature: h.temperature_2m[i],
    humidity: h.relative_humidity_2m[i],
    windSpeed: h.wind_speed_10m[i],
    uvIndex: h.uv_index[i],
    cloudCover: h.cloud_cover[i],
    precipitationProbability: h.precipitation_probability[i],
    isDay: h.is_day[i] === 1, // the API gives 1 or 0; the contract wants true/false
  }));

  // Same idea for sunrise/sunset: one entry per date.
  const sunTimes = {};
  data.daily.time.forEach((date, i) => {
    sunTimes[date] = {
      sunrise: data.daily.sunrise[i],
      sunset: data.daily.sunset[i],
    };
  });

  return { hourly, sunTimes };
}
