import PropTypes from "prop-types";
import { capitalize } from "../format.js";
import "./TypeBadge.css";

export default function TypeBadge({ type }) {
  return (
    <span className={`type-badge type-badge-${type}`}>{capitalize(type)}</span>
  );
}

TypeBadge.propTypes = {
  type: PropTypes.string.isRequired,
};
