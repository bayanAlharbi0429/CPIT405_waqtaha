
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import { db } from "../firebase/config";
import { ACTIVITIES } from "../utils/activities";
import { KAU_CAMPUS, isTentOpen } from "../utils/campusData";

const TRIPS = "trips";
const ITEMS = "tripItems";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN =
  /^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d$/;

// Check that the user is signed in.
function requireUser(userId) {
  if (!userId || typeof userId !== "string") {
    throw new Error("Please sign in first.");
  }
}

// Validate trip information before saving.
function validateTrip(input) {
  const name = String(input.name || "").trim();
  const destination = input.destination;
  const startDate = input.startDate;
  const endDate = input.endDate;

  if (!name || name.length > 80) {
    throw new Error(
      "Trip name must be between 1 and 80 characters."
    );
  }

  if (
    !destination?.name ||
    !Number.isFinite(Number(destination.lat)) ||
    !Number.isFinite(Number(destination.lon))
  ) {
    throw new Error("Please choose a valid destination.");
  }

  if (
    !DATE_PATTERN.test(startDate || "") ||
    !DATE_PATTERN.test(endDate || "") ||
    startDate > endDate
  ) {
    throw new Error("Please enter valid trip dates.");
  }

  return {
    name,
    destination: {
      name: String(destination.name),
      country: String(destination.country || ""),
      lat: Number(destination.lat),
      lon: Number(destination.lon),
      timezone: String(destination.timezone || "auto"),
    },
    startDate,
    endDate,
  };
}

// Get all trips belonging to the signed-in user.
export async function getTrips(userId) {
  requireUser(userId);

  const tripsQuery = query(
    collection(db, TRIPS),
    where("userId", "==", userId)
  );

  const snapshot = await getDocs(tripsQuery);

  return snapshot.docs
    .map((item) => ({
      id: item.id,
      ...item.data(),
    }))
    .sort((a, b) =>
      b.startDate.localeCompare(a.startDate)
    );
}

// Get one trip by its ID.
export async function getTrip(userId, tripId) {
  requireUser(userId);

  if (!tripId) {
    throw new Error("Trip not found.");
  }

  const snapshot = await getDoc(
    doc(db, TRIPS, tripId)
  );

  if (
    !snapshot.exists() ||
    snapshot.data().userId !== userId
  ) {
    throw new Error("Trip not found.");
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

// Create and save a new trip.
export async function createTrip(userId, input) {
  requireUser(userId);

  const tripData = validateTrip(input);

  const tripRef = await addDoc(
    collection(db, TRIPS),
    {
      ...tripData,
      userId,
      createdAt: serverTimestamp(),
    }
  );

  return tripRef.id;
}

// Edit an existing trip.
export async function updateTrip(
  userId,
  tripId,
  input
) {
  const existingTrip = await getTrip(userId, tripId);

  const updatedData = validateTrip({
    ...existingTrip,
    ...input,
  });

  const activities = await getTripItems(
    userId,
    tripId
  );

  const outsideDates = activities.some((item) => {
    const date = item.chosenTime.slice(0, 10);

    return (
      date < updatedData.startDate ||
      date > updatedData.endDate
    );
  });

  if (outsideDates) {
    throw new Error(
      "Your new dates exclude a saved activity."
    );
  }

  await updateDoc(
    doc(db, TRIPS, tripId),
    updatedData
  );
}

// Get all activities saved in a trip.
export async function getTripItems(
  userId,
  tripId
) {
  requireUser(userId);

  const itemsQuery = query(
    collection(db, ITEMS),
    where("userId", "==", userId)
  );

  const snapshot = await getDocs(itemsQuery);

  return snapshot.docs
    .map((item) => ({
      id: item.id,
      ...item.data(),
    }))
    .filter((item) => item.tripId === tripId)
    .sort((a, b) =>
      a.chosenTime.localeCompare(b.chosenTime)
    );
}

// Add a selected activity and time to a trip.
export async function addTripItem(
  userId,
  tripId,
  activityData
) {
  const trip = await getTrip(userId, tripId);

  const {
    activity,
    chosenTime,
    expectedScore,
    note = "",
  } = activityData;

  // Notes belong to tripItems, not trips. Old items without a note still work.
  if (typeof note !== "string" || note.trim().length > 140) {
    throw new Error("Activity note must be 140 characters or fewer.");
  }
  const cleanNote = note.trim();

  if (!ACTIVITIES[activity]) {
    throw new Error("Invalid activity.");
  }

  if (!TIME_PATTERN.test(chosenTime || "")) {
    throw new Error("Invalid activity time.");
  }

  if (
    !Number.isFinite(expectedScore) ||
    expectedScore < 0 ||
    expectedScore > 100
  ) {
    throw new Error("Invalid activity score.");
  }

  // Defense in depth: a Sports Tent slot must be on campus, during opening hours.
  if (activity === "sportsTent") {
    const atCampus =
      Math.abs(Number(trip.destination?.lat) - KAU_CAMPUS.lat) < 0.001 &&
      Math.abs(Number(trip.destination?.lon) - KAU_CAMPUS.lon) < 0.001;
    if (!atCampus) {
      throw new Error("Sports Tent activities require a KAU Campus trip.");
    }
    if (!isTentOpen(chosenTime) || expectedScore <= 0) {
      throw new Error("Choose an available campus hour with a positive score.");
    }
  }

  const date = chosenTime.slice(0, 10);

  if (
    date < trip.startDate ||
    date > trip.endDate
  ) {
    throw new Error(
      "Selected time is outside your trip dates."
    );
  }

  const existingItems = await getTripItems(
    userId,
    tripId
  );

  const duplicate = existingItems.some(
    (item) =>
      item.activity === activity &&
      item.chosenTime === chosenTime
  );

  if (duplicate) {
    throw new Error(
      "This activity is already saved at this time."
    );
  }

  const itemRef = await addDoc(
    collection(db, ITEMS),
    {
      tripId,
      userId,
      activity,
      chosenTime,
      expectedScore,
      ...(cleanNote ? { note: cleanNote } : {}),
      savedAt: serverTimestamp(),
    }
  );

  return itemRef.id;
}

// Delete one activity from a trip.
export async function deleteTripItem(
  userId,
  itemId
) {
  requireUser(userId);

  const itemRef = doc(db, ITEMS, itemId);
  const snapshot = await getDoc(itemRef);

  if (
    !snapshot.exists() ||
    snapshot.data().userId !== userId
  ) {
    throw new Error("Activity not found.");
  }

  await deleteDoc(itemRef);
}

// Delete a trip and its saved activities.
export async function deleteTrip(
  userId,
  tripId
) {
  await getTrip(userId, tripId);

  const activities = await getTripItems(
    userId,
    tripId
  );

  // Delete activities in batches.
  for (
    let start = 0;
    start < activities.length;
    start += 400
  ) {
    const batch = writeBatch(db);

    const group = activities.slice(
      start,
      start + 400
    );

    group.forEach((item) => {
      batch.delete(doc(db, ITEMS, item.id));
    });

    await batch.commit();
  }

  await deleteDoc(doc(db, TRIPS, tripId));
}
