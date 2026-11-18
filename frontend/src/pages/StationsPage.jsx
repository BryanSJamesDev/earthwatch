import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { userShape } from "../propShapes.js";
import "./StationsPage.css";
import { STATION_TYPE_LABELS } from "../StationTypes.js";

StationsPage.propTypes = {
  user: userShape,
};
const PAGE_SIZE = 20;

export default function StationsPage({ user }) {
  // data from the server
  const [stations, setStations] = useState([]);
  const [total, setTotal] = useState(0);

  // filters and current page
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [state, setState] = useState("");
  const [page, setPage] = useState(1);

  // useEffect shell
  useEffect(() => {
    // define the async function to load stations from the API
    const loadStations = async () => {
      // build type, state, query, page
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (type) params.set("type", type);
      if (state) params.set("state", state);
      params.set("page", page);
      // http response
      const res = await fetch(`/api/stations?${params}`);

      if (!res.ok) {
        console.error("failed to fetch stations:", res.statusText);
        return;
      }

      // parse body
      const data = await res.json();
      // save it. triggers the re-render
      setStations(data.stations);
      setTotal(data.total);
    };

    // debounce
    const timeout = setTimeout(loadStations, 300);
    return () => clearTimeout(timeout);
  }, [q, type, state, page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <h1>Stations</h1>
      {user === null && (
        <p>
          <Link to="/login">Log in</Link> to add your own stations
        </p>
      )}
      <div className="station-filters">
        <input
          type="search"
          placeholder="search by city"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
        />

        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Types</option>
          <option value="air_quality">Air Quality</option>
          <option value="water_level">Water Level</option>
          <option value="temperature">Temperature</option>
        </select>

        <input
          type="text"
          placeholder="filter by state"
          value={state}
          onChange={(e) => {
            setState(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <p>{total} stations found</p>

      <ul>
        {stations.map((station) => (
          <li key={station._id}>
            <Link to={`/stations/${station._id}`}>{station.name}</Link> (
            {station.state}), {STATION_TYPE_LABELS[station.type]}
          </li>
        ))}
      </ul>

      <div className="station-pagination">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </button>
        <span>
          Page {page} of {Math.max(totalPages, 1)}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
