// MoodContext: lets any page change the mood of the corner sun
import { createContext, useContext, useState } from "react";

const MoodContext = createContext({ mood: null, setMood: () => {} });

export function MoodProvider({ children }) {
  const [mood, setMood] = useState(null);
  return <MoodContext.Provider value={{ mood, setMood }}>{children}</MoodContext.Provider>;
}

export function useSunMood() {
  return useContext(MoodContext);
}