import { useState } from "react";
import PropTypes from "prop-types";
import "./ReadingForm.css";

const EMPTY = { value: "", date: "", notes: "" };

// works the same as StationForm but for the readings
export default function ReadingForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel,
}) {
  const [values, setValues] = useState({ ...EMPTY, ...initialValues });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSubmit(values);
      // clear the form so the next reading starts empty
      setValues({ ...EMPTY, ...initialValues });
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  return (
    <form className="reading-form" onSubmit={handleSubmit}>
      {error && <p className="reading-form-error">{error}</p>}

      <label>
        Value
        <input
          type="number"
          step="any"
          name="value"
          value={values.value}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Date
        <input
          type="date"
          name="date"
          value={values.date}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Notes
        <input name="notes" value={values.notes} onChange={handleChange} />
      </label>

      <div className="reading-form-actions">
        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

ReadingForm.propTypes = {
  initialValues: PropTypes.shape({
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    date: PropTypes.string,
    notes: PropTypes.string,
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  submitLabel: PropTypes.string.isRequired,
};
