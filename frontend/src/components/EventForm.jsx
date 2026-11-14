import { useState } from "react";
import PropTypes from "prop-types";
import { capitalize, toDateInput } from "../format.js";
import { eventShape, optionsShape } from "../propShapes.js";
import "./EventForm.css";

const MAX_DESCRIPTION = 2000;

const toFormValues = (event) => ({
  title: event?.title ?? "",
  type: event?.type ?? "",
  severity: event ? String(event.severity) : "",
  region: event?.region ?? "",
  location: event?.location ?? "",
  date: event ? toDateInput(event.date) : "",
  description: event?.description ?? "",
});

// used for both creating and editing. initialEvent fills it in for editing
export default function EventForm({
  options,
  initialEvent,
  submitLabel,
  submitting,
  error,
  onSubmit,
  onCancel,
}) {
  const [values, setValues] = useState(() => toFormValues(initialEvent));
  // local date, not UTC, so "today" matches the user's calendar
  const [today] = useState(() => {
    const now = new Date();
    return toDateInput(now.getTime() - now.getTimezoneOffset() * 60000);
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...values, severity: Number(values.severity) });
  };

  return (
    <form className="event-form" onSubmit={handleSubmit}>
      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}

      <div className="event-form-full">
        <label htmlFor="event-title">Title</label>
        <input
          id="event-title"
          name="title"
          type="text"
          placeholder="e.g. Cedar Creek Fire"
          value={values.title}
          onChange={handleChange}
          minLength={3}
          maxLength={100}
          required
        />
      </div>

      <div>
        <label htmlFor="event-type">Type</label>
        <select
          id="event-type"
          name="type"
          value={values.type}
          onChange={handleChange}
          required
        >
          <option value="" disabled>
            Choose a type
          </option>
          {options.types.map((type) => (
            <option key={type} value={type}>
              {capitalize(type)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="event-severity">Severity</label>
        <select
          id="event-severity"
          name="severity"
          value={values.severity}
          onChange={handleChange}
          required
        >
          <option value="" disabled>
            How serious was it?
          </option>
          {options.severities.map((label, i) => (
            <option key={label} value={i + 1}>
              {i + 1} - {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="event-date">Date</label>
        <input
          id="event-date"
          name="date"
          type="date"
          value={values.date}
          max={today}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="event-region">Region</label>
        <select
          id="event-region"
          name="region"
          value={values.region}
          onChange={handleChange}
          required
        >
          <option value="" disabled>
            Choose a region
          </option>
          {options.regions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </div>

      <div className="event-form-full">
        <label htmlFor="event-location">Location</label>
        <input
          id="event-location"
          name="location"
          type="text"
          placeholder="City, state or province, country"
          value={values.location}
          onChange={handleChange}
          minLength={2}
          maxLength={100}
          required
        />
      </div>

      <div className="event-form-full">
        <label htmlFor="event-description">Description</label>
        <textarea
          id="event-description"
          name="description"
          rows={6}
          placeholder="What happened? Include anything useful like damage, evacuations, or measurements."
          value={values.description}
          onChange={handleChange}
          maxLength={MAX_DESCRIPTION}
          aria-describedby="event-description-count"
        />
        <small id="event-description-count" className="muted">
          {values.description.length}/{MAX_DESCRIPTION} characters
        </small>
      </div>

      <div className="event-form-actions event-form-full">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </button>
        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}

EventForm.propTypes = {
  options: optionsShape.isRequired,
  initialEvent: eventShape,
  submitLabel: PropTypes.string.isRequired,
  submitting: PropTypes.bool,
  error: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
