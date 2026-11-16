import PropTypes from "prop-types";
import "./ReadingTable.css";

export default function ReadingTable({ readings, normalMin, normalMax, unit }) {
  // copy before sorting so we do not change the array we were given
  const sorted = [...readings].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  // no readings
  if (sorted.length === 0) {
    return <p>No readings yet.</p>;
  }

  return (
    <table className="reading-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Value</th>
          <th>Status</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((reading) => {
          // compute for each row
          const outOfRange =
            reading.value < normalMin || reading.value > normalMax;
          return (
            <tr key={reading._id} className={outOfRange ? "out-of-range" : ""}>
              <td>{new Date(reading.date).toLocaleString()}</td>
              <td>
                {reading.value} {unit}
              </td>
              <td>{outOfRange ? "Out of Range" : "Normal"}</td>
              <td>{reading.notes}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

ReadingTable.propTypes = {
  readings: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
      notes: PropTypes.string,
    })
  ).isRequired,
  normalMin: PropTypes.number.isRequired,
  normalMax: PropTypes.number.isRequired,
  unit: PropTypes.string.isRequired,
};
