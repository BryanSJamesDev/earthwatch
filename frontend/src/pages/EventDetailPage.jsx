import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../api.js";
import useEventOptions from "../hooks/useEventOptions.js";
import TypeBadge from "../components/TypeBadge.jsx";
import SeverityBadge from "../components/SeverityBadge.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import { formatDate } from "../format.js";
import { userShape } from "../propShapes.js";
import "./EventDetailPage.css";

export default function EventDetailPage({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { options } = useEventOptions();

  const [result, setResult] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    apiFetch(`/events/${id}`, { signal: controller.signal })
      .then((event) => setResult({ id, event }))
      .catch((err) => {
        if (err.name !== "AbortError") setResult({ id, error: err.message });
      });
    return () => controller.abort();
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await apiFetch(`/events/${id}`, { method: "DELETE" });
      navigate("/events", { replace: true });
    } catch (err) {
      setDeleteError(err.message);
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  if (result?.id !== id) {
    return <p className="muted">Loading event…</p>;
  }
  if (result.error) {
    return (
      <section className="event-detail">
        <p className="error-message" role="alert">
          {result.error}
        </p>
        <Link to="/events">← Back to events</Link>
      </section>
    );
  }

  const { event } = result;
  const isAuthor = Boolean(user && event.authorId === user._id);
  const severityLabel = options?.severities[event.severity - 1] ?? "Severity";

  return (
    <article className="event-detail">
      <Link to="/events" className="event-detail-back">
        ← Back to events
      </Link>

      <header className="event-detail-header">
        <div className="event-detail-badges">
          <TypeBadge type={event.type} />
          <SeverityBadge level={event.severity} label={severityLabel} />
        </div>
        <h1>{event.title}</h1>
      </header>

      {deleteError && (
        <p className="error-message" role="alert">
          {deleteError}
        </p>
      )}

      <dl className="event-detail-facts">
        <div>
          <dt>Date</dt>
          <dd>
            <time dateTime={event.date.slice(0, 10)}>
              {formatDate(event.date)}
            </time>
          </dd>
        </div>
        <div>
          <dt>Location</dt>
          <dd>{event.location}</dd>
        </div>
        <div>
          <dt>Region</dt>
          <dd>
            <Link to={`/events?region=${encodeURIComponent(event.region)}`}>
              {event.region}
            </Link>
          </dd>
        </div>
        <div>
          <dt>Posted by</dt>
          <dd>{event.authorName || "Unknown"}</dd>
        </div>
      </dl>

      <section className="event-detail-description">
        <h2>What happened</h2>
        {event.description ? (
          <p>{event.description}</p>
        ) : (
          <p className="muted">No description was added.</p>
        )}
      </section>

      <footer className="event-detail-footer">
        <p className="muted">
          Added {formatDate(event.createdAt)}
          {event.updatedAt !== event.createdAt &&
            ` · Last edited ${formatDate(event.updatedAt)}`}
        </p>
        {isAuthor && (
          <div className="event-detail-actions">
            <Link to={`/events/${event._id}/edit`} className="btn">
              Edit
            </Link>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => setConfirmOpen(true)}
            >
              Delete
            </button>
          </div>
        )}
      </footer>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this event?"
        message={`"${event.title}" will be removed for everyone. This can't be undone.`}
        confirmLabel="Delete event"
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </article>
  );
}

EventDetailPage.propTypes = {
  user: userShape,
};
