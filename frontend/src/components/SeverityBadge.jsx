import PropTypes from "prop-types";
import "./SeverityBadge.css";

// e.g. "Severe (4/5)" with a color that gets stronger with the level
export default function SeverityBadge({ level, label }) {
  return (
    <span className={`severity-badge severity-badge-${level}`}>
      {label} <span className="severity-badge-level">({level}/5)</span>
    </span>
  );
}

SeverityBadge.propTypes = {
  level: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
};
