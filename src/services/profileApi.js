// Firestore functions for the user profile and the custom weights (activityProfiles).
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { db } from "../firebase/config";
import { ACTIVITIES } from "../utils/activities";

// One document per user and activity: activityProfiles/{uid}_{activityKey}
const profileDoc = (uid, activityKey) => doc(db, "activityProfiles", `${uid}_${activityKey}`);

// Returns the saved weights, or null if the user never saved any
export async function getActivityWeights(uid, activityKey) {
  const snap = await getDoc(profileDoc(uid, activityKey));
  return snap.exists() ? snap.data().weights : null;
}

// Returns the saved weights, or the activity defaults.
// Other pages (Results, Explore) can call this one function to get the right weights.
export async function getEffectiveWeights(uid, activityKey) {
  const saved = await getActivityWeights(uid, activityKey);
  return saved || { ...ACTIVITIES[activityKey].weights };
}

export async function saveActivityWeights(uid, activityKey, weights) {
  await setDoc(profileDoc(uid, activityKey), {
    userId: uid,
    activity: activityKey,
    weights,
    updatedAt: serverTimestamp(),
  });
}

// Update the display name in Firebase Auth and in the users document
export async function updateUserName(user, name) {
  await updateProfile(user, { displayName: name });
  await setDoc(doc(db, "users", user.uid), { name }, { merge: true });
}