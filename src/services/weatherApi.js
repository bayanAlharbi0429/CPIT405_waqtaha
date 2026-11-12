// STUB: returns mock data in the correct shape.
// Owner: Arwa. Replace with real Open-Meteo calls (with loading and error handling).
import { mockDestination, mockHourly, mockSunTimes } from "../mocks/mockData";

// Real version: search a city by name using the Geocoding API.
// Returns an array of destinations: { name, country, lat, lon, timezone }
export async function searchDestinations(name) {
  return [mockDestination];
}

// Real version: fetch the hourly forecast for the coordinates.
// Returns { hourly: [...], sunTimes: { "YYYY-MM-DD": { sunrise, sunset } } }
export async function getForecast(lat, lon) {
  return { hourly: mockHourly, sunTimes: mockSunTimes };
}