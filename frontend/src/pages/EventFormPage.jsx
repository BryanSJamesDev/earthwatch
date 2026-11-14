import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../api.js";
import useEventOptions from "../hooks/useEventOptions.js";
import EventForm from "../components/EventForm.jsx";
import { userShape } from "../propShapes.js";
import "./EventFormPage.css";

// /events/new creates an event, /events/:id/edit edits one
export default function EventFormPage({ user }) {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { options, error: optionsError } = useEventOptions();

  const [loaded, setLoaded] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    apiFetch(`/events/${id}`, { signal: controller.signal })
      .then((event) => setLoaded({ id, event }))
      .catch((err) => {
        if (err.name !== "AbortError") setLoaded({ id, error: err.message });
      });
    return () => controller.abort();
  }, [id]);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    setError(null);
    try {
      const saved = await apiFetch(isEdit ? `/events/${id}` : "/events", {
        method: isEdit ? "PUT" : "POST",
        body: values,
      });
      navigate(`/events/${saved._id}`, { replace: isEdit });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  const handleCancel = () => navigate(isEdit ? `/events/${id}` : "/events");

  const title = isEdit ? "Edit event" : "Log a natural event";

  if (optionsError) return <p className="error-message">{optionsError}</p>;
  if (!options || (isEdit && loaded?.id !== id)) {
    return <p className="muted">Loading…</p>;
  }
  if (isEdit && loaded.error) {
    return (
      <section>
        <h1>{title}</h1>
        <p className="error-message">{loaded.error}</p>
        <Link to="/events">← Back to events</Link>
      </section>
    );
  }
  if (isEdit && loaded.event.authorId !== user._id) {
    return (
      <section>
        <h1>{title}</h1>
        <p className="error-message">
          Only the person who posted this event can edit it.
        </p>
        <Link to={`/events/${id}`}>← Back to the event</Link>
      </section>
    );
  }

  return (
    <section className="event-form-page">
      <h1>{title}</h1>
      <p className="muted">
        {isEdit
          ? "Update the details and save."
          : "Record what happened so others can find it. Every field except the description is required."}
      </p>
      <EventForm
        options={options}
        initialEvent={isEdit ? loaded.event : undefined}
        submitLabel={isEdit ? "Save changes" : "Add event"}
        submitting={submitting}
        error={error}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </section>
  );
}

EventFormPage.propTypes = {
  user: userShape.isRequired,
};
