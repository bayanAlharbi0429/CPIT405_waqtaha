// AuthContext: keeps track of the logged-in user across the whole app
import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/config";

const AuthContext = createContext();

// Small helper so other files can write useAuth() instead of useContext(...)
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [, setVersion] = useState(0);

  // Create a new account, then save the user's data in Firestore
  async function register(name, email, password) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    await setDoc(doc(db, "users", cred.user.uid), {
      name,
      email,
      createdAt: serverTimestamp(),
    });
    return cred;
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  // Re-render consumers after the profile (like the display name) changes
  function refreshUser() {
    setVersion((v) => v + 1);
  }

  // Firebase tells us when the user logs in or out (this is the session)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = { currentUser, register, login, logout, refreshUser };
  
  // Wait until Firebase finishes checking before showing the app
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}