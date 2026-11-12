// CornerSun: the sun mascot peeking from the corner on every logged-in page.
// It shows a warm message that depends on the page, or on the profile mood.
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import SunMascot from "./SunMascot";
import { useSunMood } from "../context/MoodContext";
import { MOOD_MESSAGES } from "../utils/weightsHelpers";

const MESSAGES = {
  "/dashboard": "Let's make your day a happy one.",
  "/explore": "Tell me where, and I'll find your sunny hours.",
  "/results": "Green hours are your best bet. Enjoy!",
  "/trips": "A good plan makes the day lighter.",
  "/profile": "Tell me what you love, I'll plan around it.",
};
const DEFAULT_MESSAGE = "We're here to help your day go well.";

export default function CornerSun() {
  const { pathname } = useLocation();
  const { mood } = useSunMood();
  const [open, setOpen] = useState(false);
  const [wave, setWave] = useState(false);

  const pageMessage =
    MESSAGES[pathname] ||
    (pathname.startsWith("/trips/") ? "Your plan for this trip lives here." : DEFAULT_MESSAGE);
  const message = mood ? MOOD_MESSAGES[mood] : pageMessage;

  // When the mood changes, show the message for a few seconds
  useEffect(() => {
    if (!mood) return;
    setOpen(true);
    const t = setTimeout(() => setOpen(false), 3500);
    return () => clearTimeout(t);
  }, [mood]);

  // Click: toggle the message (useful on phones) and wiggle for a moment
  function handleClick() {
    setOpen(!open);
    setWave(true);
    setTimeout(() => setWave(false), 700);
  }

  function handleKey(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  }

  return (
    <div
      className={`corner-sun ${open ? "is-open" : ""} ${wave ? "wave" : ""}`}
      role="button"
      tabIndex={0}
      aria-label="Waqt the sun. Press for a message."
      onClick={handleClick}
      onKeyDown={handleKey}
    >
      <span className="corner-bubble" aria-live="polite">{message}</span>
      <SunMascot mood={mood} />
    </div>
  );
}