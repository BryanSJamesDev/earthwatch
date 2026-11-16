import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import PropTypes from "prop-types";
import { apiFetch } from "../api.js";
import "./AuthPage.css";

// only follow redirects inside the app, never to another site
const safeNext = (next) =>
  next && next.startsWith("/") && !next.startsWith("//") ? next : "/events";

// login and sign up share this page, mode picks which one
export default function AuthPage({ mode, onAuth }) {
  const isRegister = mode === "register";
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = safeNext(searchParams.get("next"));

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isRegister && password !== confirm) {
      setError("Passwords don't match");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const data = await apiFetch(`/auth/${mode}`, {
        method: "POST",
        body: { username, password },
      });
      onAuth(data.user);
      navigate(next, { replace: true });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  // keeps ?next= when switching between login and sign up
  const otherLink = `${isRegister ? "/login" : "/register"}${
    searchParams.get("next") ? `?next=${encodeURIComponent(next)}` : ""
  }`;

  return (
    <section className="auth-page">
      <h1>{isRegister ? "Create an account" : "Log in"}</h1>
      <p className="muted">
        {isRegister
          ? "Sign up to log natural events. Anyone can browse, but only you can edit or delete what you post."
          : "Log in to add events and manage the ones you posted."}
      </p>

      <form className="auth-form" onSubmit={handleSubmit}>
        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}

        <div className="auth-field">
          <label htmlFor="auth-username">Username</label>
          <input
            id="auth-username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            minLength={3}
            maxLength={30}
            required
          />
          {isRegister && (
            <small className="muted">
              3-30 characters: letters, numbers, . _ or -
            </small>
          )}
        </div>

        <div className="auth-field">
          <label htmlFor="auth-password">Password</label>
          <input
            id="auth-password"
            type="password"
            autoComplete={isRegister ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={isRegister ? 8 : undefined}
            maxLength={72}
            required
          />
          {isRegister && <small className="muted">At least 8 characters</small>}
        </div>

        {isRegister && (
          <div className="auth-field">
            <label htmlFor="auth-confirm">Confirm password</label>
            <input
              id="auth-confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>
        )}

        <button type="submit" className="btn auth-submit" disabled={submitting}>
          {submitting ? "Please wait…" : isRegister ? "Sign up" : "Log in"}
        </button>
      </form>

      <p className="auth-switch">
        {isRegister ? "Already have an account? " : "New to EarthWatch? "}
        <Link to={otherLink}>
          {isRegister ? "Log in" : "Create an account"}
        </Link>
      </p>
    </section>
  );
}

AuthPage.propTypes = {
  mode: PropTypes.oneOf(["login", "register"]).isRequired,
  onAuth: PropTypes.func.isRequired,
};
