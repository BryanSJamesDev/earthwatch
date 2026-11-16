import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./StationDashboardPage.css";
import { STATION_TYPE_LABELS } from "../StationTypes";

export default function StationDashboardPage() {
  const [range, setRange] = useState("week");
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError("");
      const res = await fetch(`/api/stations/dashboard?range=${range}`);
      if (!res.ok) {
        setError("Could not load the dashboard.");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setStations(data.stations);
      setLoading(false);
    };
    loadDashboard();
  }, [range]);

  return (
    <div>
      <h1>Station Dashboard</h1>
      <p>
        Stations with the most out-of-range readings. These are the areas that
        may need attention.
      </p>

      <div className="dashboard-range">
        <button
          type="button"
          aria-pressed={range === "week"}
          onClick={() => setRange("week")}
        >
          Past week
        </button>
        <button
          type="button"
          aria-pressed={range === "month"}
          onClick={() => setRange("month")}
        >
          Past month
        </button>
      </div>

      {error && <p>{error}</p>}
      {loading && <p>Loading...</p>}

      {!loading && !error && stations.length === 0 && (
        <p>No out-of-range readings in this period.</p>
      )}

      {!loading && !error && stations.length > 0 && (
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Station</th>
              <th>Location</th>
              <th>Type</th>
              <th>Out-of-range readings</th>
            </tr>
          </thead>
          <tbody>
            {stations.map((station, index) => (
              <tr key={station._id}>
                <td>{index + 1}</td>
                <td>
                  <Link to={`/stations/${station._id}`}>{station.name}</Link>
                </td>
                <td>
                  {station.city}, {station.state}
                </td>
                <td>{STATION_TYPE_LABELS[station.type]}</td>
                <td>{station.outOfRangeCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

StationDashboardPage.propTypes = {};
