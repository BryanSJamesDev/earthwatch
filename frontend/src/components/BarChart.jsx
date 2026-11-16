import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import "./BarChart.css";

// horizontal bars sized relative to the biggest value.
// rows with an href link to the matching events
export default function BarChart({ title, data, emptyMessage }) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <figure className="bar-chart">
      <figcaption className="bar-chart-title">{title}</figcaption>
      {data.length === 0 ? (
        <p className="muted">{emptyMessage}</p>
      ) : (
        <ol className="bar-chart-rows">
          {data.map((d) => (
            <li key={d.label} className="bar-chart-row">
              <span className="bar-chart-label">
                {d.href ? <Link to={d.href}>{d.label}</Link> : d.label}
              </span>
              <span className="bar-chart-track" aria-hidden="true">
                <span
                  className="bar-chart-bar"
                  style={{ width: `${(d.value / max) * 100}%` }}
                />
              </span>
              <span className="bar-chart-value">
                {d.value.toLocaleString()}
                {d.note && <span className="muted"> · {d.note}</span>}
              </span>
            </li>
          ))}
        </ol>
      )}
    </figure>
  );
}

BarChart.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
      note: PropTypes.string,
      href: PropTypes.string,
    })
  ).isRequired,
  emptyMessage: PropTypes.string,
};
