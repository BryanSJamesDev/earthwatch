import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import TypeBadge from "./TypeBadge.jsx";
import SeverityBadge from "./SeverityBadge.jsx";
import { formatDate } from "../format.js";
import { eventShape } from "../propShapes.js";
import "./EventCard.css";

const MAX_PREVIEW = 160;

export default function EventCard({ event, severityLabels }) {
  const preview =
    event.description.length > MAX_PREVIEW
      ? `${event.description.slice(0, MAX_PREVIEW).trimEnd()}…`
      : event.description;

  return (
    <article className="event-card">
      <div className="event-card-badges">
        <TypeBadge type={event.type} />
        <SeverityBadge
          level={event.severity}
          label={severityLabels[event.severity - 1]}
        />
      </div>
      <h2 className="event-card-title">
        <Link to={`/events/${event._id}`}>{event.title}</Link>
      </h2>
      <p className="event-card-meta">
        <time dateTime={event.date.slice(0, 10)}>{formatDate(event.date)}</time>
        {" · "}
        {event.location}
        <span className="muted"> ({event.region})</span>
      </p>
      {preview && <p className="event-card-description">{preview}</p>}
    </article>
  );
}

EventCard.propTypes = {
  event: eventShape.isRequired,
  severityLabels: PropTypes.arrayOf(PropTypes.string).isRequired,
};
