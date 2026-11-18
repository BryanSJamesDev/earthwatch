import { useState } from "react";
import PropTypes from "prop-types";
import "./StationForm.css";

const EMPTY = {
  name: "",
  city: "",
  state: "",
  type: "",
  normalMin: "",
  normalMax: "",
};

export default function StationForm({ initialValues, onSubmit, submitLabel }) {
  const [values, setValues] = useState({ ...EMPTY, ...initialValues });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // one change handler for every input using the input's name
  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <form className="station-form" onSubmit={handleSubmit}>
      {error && <p className="station-form-error">{error}</p>}

      <label>
        Name
        <input
          name="name"
          value={values.name}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        City
        <input
          name="city"
          value={values.city}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        State
        <input
          name="state"
          value={values.state}
          onChange={handleChange}
          placeholder="State"
          maxLength="2"
          required
        />
      </label>

      <label>
        Type
        <select
          name="type"
          value={values.type}
          onChange={handleChange}
          required
        >
          <option value="">Select a type</option>
          <option value="air_quality">Air Quality (AQI)</option>
          <option value="water_level">Water Level (m)</option>
          <option value="temperature">Temperature (°C)</option>
        </select>
      </label>

      <label>
        Normal Min
        <input
          name="normalMin"
          type="number"
          value={values.normalMin}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Normal Max
        <input
          name="normalMax"
          type="number"
          value={values.normalMax}
          onChange={handleChange}
          required
        />
      </label>

      <button type="submit" disabled={saving}>
        {submitLabel}
      </button>
    </form>
  );
}

StationForm.propTypes = {
  initialValues: PropTypes.shape({
    name: PropTypes.string,
    city: PropTypes.string,
    state: PropTypes.string,
    type: PropTypes.string,
    normalMin: PropTypes.number,
    normalMax: PropTypes.number,
  }),
  onSubmit: PropTypes.func.isRequired,
  submitLabel: PropTypes.string.isRequired,
};
