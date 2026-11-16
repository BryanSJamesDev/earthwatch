import { useState } from "react";
import PropTypes from "prop-types";
import { capitalize } from "../format.js";
import { optionsShape } from "../propShapes.js";
import "./EventFilters.css";

// dropdowns and dates apply right away, the location box applies on Search
export default function EventFilters({ options, filters, onChange, onReset }) {
  const [location, setLocation] = useState(filters.location);
  const [prevLocation, setPrevLocation] = useState(filters.location);

  // keep the box in sync when the url changes (reset, back button)
  if (filters.location !== prevLocation) {
    setPrevLocation(filters.location);
    setLocation(filters.location);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    onChange({ location: location.trim() });
  };

  const hasFilters = Object.values(filters).some((value) => value !== "");

  return (
    <form className="event-filters" onSubmit={handleSubmit} role="search">
      <div className="event-filters-location">
        <label htmlFor="filter-location">Location</label>
        <div className="event-filters-search">
          <input
            id="filter-location"
            type="search"
            placeholder="e.g. California, Japan, Lismore"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <button type="submit" className="btn">
            Search
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="filter-type">Type</label>
        <select
          id="filter-type"
          value={filters.type}
          onChange={(e) => onChange({ type: e.target.value })}
        >
          <option value="">All types</option>
          {options.types.map((type) => (
            <option key={type} value={type}>
              {capitalize(type)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filter-region">Region</label>
        <select
          id="filter-region"
          value={filters.region}
          onChange={(e) => onChange({ region: e.target.value })}
        >
          <option value="">All regions</option>
          {options.regions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filter-severity">Severity</label>
        <select
          id="filter-severity"
          value={filters.minSeverity}
          onChange={(e) => onChange({ minSeverity: e.target.value })}
        >
          <option value="">Any severity</option>
          {options.severities.map((label, i) => (
            <option key={label} value={i + 1}>
              {i + 1 === options.severities.length
                ? label
                : `${label} or worse`}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filter-from">From</label>
        <input
          id="filter-from"
          type="date"
          value={filters.from}
          max={filters.to || undefined}
          onChange={(e) => onChange({ from: e.target.value })}
        />
      </div>

      <div>
        <label htmlFor="filter-to">To</label>
        <input
          id="filter-to"
          type="date"
          value={filters.to}
          min={filters.from || undefined}
          onChange={(e) => onChange({ to: e.target.value })}
        />
      </div>

      <div className="event-filters-reset">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onReset}
          disabled={!hasFilters}
        >
          Clear filters
        </button>
      </div>
    </form>
  );
}

EventFilters.propTypes = {
  options: optionsShape.isRequired,
  filters: PropTypes.shape({
    location: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    region: PropTypes.string.isRequired,
    minSeverity: PropTypes.string.isRequired,
    from: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
};
