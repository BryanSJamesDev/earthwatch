import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div>
      <h1>EarthWatch</h1>
      <p>
        EarthWatch gives you one place to record and explore natural events and
        to track environmental monitoring stations over time. Browse wildfires,
        floods, earthquakes, and storms, or follow air quality, water level, and
        temperature readings to see how conditions change.
      </p>
      <p>Anyone can browse. Sign up to log your own events and stations.</p>
      <ul>
        <li>
          <Link to="/events">Explore natural events</Link>
        </li>
        <li>
          <Link to="/stations">Browse monitoring stations</Link>
        </li>
      </ul>
    </div>
  );
}

HomePage.propTypes = {};
