import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StationForm from "../components/StationForm.jsx";

export default function StationFormPage() {
  // only exists in the edit route
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [station, setStation] = useState(null);
  const [loadError, setLoadError] = useState("");

  // when editing load the station so the form starts to fill in
  useEffect(() => {
    if (!isEdit) return;
    const loadStation = async () => {
      const res = await fetch(`/api/stations/${id}`);
      if (!res.ok) {
        setLoadError("Failed to load station");
        return;
      }
      setStation(await res.json());
    };
    loadStation();
  }, [id, isEdit]);

  const handleSubmit = async (values) => {
    const method = isEdit ? "PUT" : "POST";
    const url = isEdit ? `/api/stations/${id}` : "/api/stations";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Something went wrong");
    }
    navigate(`/stations/${data._id}`);
  };

  if (loadError) {
    return <p className="error-message">{loadError}</p>;
  }
  if (isEdit && !station) {
    return <p>Loading station...</p>;
  }
  return (
    <div>
      <h1>{isEdit ? "Edit Station" : "Create Station"}</h1>
      <StationForm
        initialValues={station}
        onSubmit={handleSubmit}
        submitLabel={isEdit ? "Save Station" : "Create Station"}
      />
    </div>
  );
}

StationFormPage.propTypes = {};
