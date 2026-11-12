// Navbar: top navigation for logged-in pages, with a menu button on mobile
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SunMascot from "./SunMascot";

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  // Close the mobile menu after choosing a link
  const close = () => setOpen(false);

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/dashboard" className="navbar-brand" onClick={close}>
          <SunMascot className="sun-mini" />
          Waqtaha
        </NavLink>

        <button
          className="navbar-toggle"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? "Close" : "Menu"}
        </button>

        <nav className={`navbar-links ${open ? "is-open" : ""}`}>
          <NavLink to="/dashboard" onClick={close}>Dashboard</NavLink>
          <NavLink to="/explore" onClick={close}>Explore</NavLink>
          <NavLink to="/trips" onClick={close}>My trips</NavLink>
          <NavLink to="/profile" onClick={close}>Profile</NavLink>
          <span className="navbar-user">{currentUser?.displayName}</span>
          <button className="navbar-logout" onClick={handleLogout}>Log out</button>
        </nav>
      </div>
    </header>
  );
}