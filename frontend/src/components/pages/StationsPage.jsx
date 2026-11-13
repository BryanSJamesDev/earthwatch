import { useEffect, useState } from "react";

export default function StationsPage() {
  // create the state and setter
  const [stations, setStations] = useState([]);

  // useEffect shell
  useEffect(() => {
    // define the async function to load stations from the API
    const loadStations = async () => {
      // http response
      const res = await fetch("/api/stations");

      if (!res.ok) {
        console.error("failed to fetch stations:", res.statusText);
        return;
      }

      // parse body
      const data = await res.json();
      // save it. triggers the re-render
      setStations(data);
    };

    // call async function to load stations
    loadStations();
  }, []);

  return (
    <div>
      <h1>Stations</h1>
      <ul>
        {stations.map((station) => (
          <li key={station._id}>{station.name}</li>
        ))}
      </ul>
    </div>
  );
}
