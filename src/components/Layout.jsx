// Layout: wraps all protected pages with the navbar and the corner sun
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import CornerSun from "./CornerSun";
import { MoodProvider } from "../context/MoodContext";

export default function Layout() {
  return (
    <MoodProvider>
      <Navbar />
      <main className="app-main">
        <Outlet />
      </main>
      <CornerSun />
    </MoodProvider>
  );
}