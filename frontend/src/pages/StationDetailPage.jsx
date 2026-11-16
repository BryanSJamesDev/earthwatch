import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

export default function StationDetailPage() {
  // reads the id part of the URL
  const { id } = useParams();
  const [station, setStation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStation = async () => {
      const res = await fetch(`/api/stations/${id}`);
      // station wasnt found
      if (res.status === 404) {
        setError("Station not found");
        return;
      }
      // other error
      if (!res.ok) {
        setError("Failed to fetch station");
        return;
      }

      const data = await res.json();
      setStation(data);
    };

    loadStation();
  }, [id]);

  // station wasnt found. show message and a way back for user
  if (error) {
    return (
      <div>
        {error}
        <Link to="/stations">Back to Stations</Link>
      </div>
    );
  }

  // station is still null hasnt been fetched
  if (!station) {
    return <div>Loading...</div>;
  }

  // show the station
  return (
    <div>
      <Link to="/stations">Back to Stations</Link>
      <h1>{station.name}</h1>
      <p>
        {station.city}, {station.state} - {station.type}
      </p>
      <p>
        Normal Range: {station.normalMin} to {station.normalMax} {station.unit}
      </p>

      <h2>Readings ({station.readings.length})</h2>
    </div>
  );
}
