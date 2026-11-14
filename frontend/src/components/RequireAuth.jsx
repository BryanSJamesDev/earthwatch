import { Navigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { userShape } from "../propShapes.js";

// sends logged out users to the login page, then back here afterwards
export default function RequireAuth({ user, children }) {
  const location = useLocation();

  if (user === undefined) {
    return <p className="muted">Loading…</p>;
  }
  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }
  return children;
}

RequireAuth.propTypes = {
  user: userShape,
  children: PropTypes.node.isRequired,
};
