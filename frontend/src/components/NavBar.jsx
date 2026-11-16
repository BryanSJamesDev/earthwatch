import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { userShape } from "../propShapes.js";
import "./NavBar.css";

export default function NavBar({ user, onLogout }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    closeMenu();
    await onLogout();
    navigate("/events");
  };

  return (
    <header className="navbar">
      <nav className="navbar-inner" aria-label="Main">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <img src="/earth.svg" alt="" width="28" height="28" />
          EarthWatch
        </Link>

        <button
          type="button"
          className="navbar-toggle"
          aria-expanded={menuOpen}
          aria-controls="navbar-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="visually-hidden">Toggle navigation</span>
          <span className="navbar-toggle-bar" aria-hidden="true" />
          <span className="navbar-toggle-bar" aria-hidden="true" />
          <span className="navbar-toggle-bar" aria-hidden="true" />
        </button>

        <div
          id="navbar-menu"
          className={`navbar-menu${menuOpen ? " navbar-menu-open" : ""}`}
        >
          <ul className="navbar-links">
            <li>
              <NavLink to="/events" end onClick={closeMenu}>
                Events
              </NavLink>
            </li>
            <li>
              <NavLink to="/events/summary" onClick={closeMenu}>
                Event Summary
              </NavLink>
            </li>
            <li>
              <NavLink to="/stations" end onClick={closeMenu}>
                Stations
              </NavLink>
            </li>
            <li>
              <NavLink to="/stations/dashboard" onClick={closeMenu}>
                Station Dashboard
              </NavLink>
            </li>
          </ul>

          {/* nothing until the session check finishes, so it doesn't flicker */}
          {user !== undefined && (
            <div className="navbar-account">
              {user ? (
                <>
                  <span className="navbar-user">
                    Signed in as <strong>{user.username}</strong>
                  </span>
                  <button
                    type="button"
                    className="btn btn-secondary navbar-btn"
                    onClick={handleLogout}
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" onClick={closeMenu}>
                    Log in
                  </NavLink>
                  <Link
                    to="/register"
                    className="btn navbar-btn"
                    onClick={closeMenu}
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

NavBar.propTypes = {
  user: userShape,
  onLogout: PropTypes.func.isRequired,
};
