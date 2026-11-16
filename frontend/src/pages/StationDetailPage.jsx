import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { userShape } from "../propShapes.js";
import ReadingTable from "../components/ReadingTable.jsx";
import ReadingForm from "../components/ReadingForm.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";

export default function StationDetailPage({ user }) {
  // reads the id part of the URL
  const { id } = useParams();
  const [station, setStation] = useState(null);
  const [error, setError] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const [editingReading, setEditingReading] = useState(null);
  const [readingToDelete, setReadingToDelete] = useState(null);
  const [deletingReading, setDeletingReading] = useState(false);

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

  const handleDelete = async () => {
    setDeleting(true);
    const res = await fetch(`/api/stations/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setDeleting(false);
      setConfirmOpen(false);
      setError(data.error || "Could not delete this station");
      return;
    }
    navigate("/stations");
  };

  const handleAddReading = async (values) => {
    const res = await fetch(`/api/stations/${id}/readings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Could not add reading");
    }
    // add the new reading to the page without reloading everything
    setStation({ ...station, readings: [...station.readings, data] });
  };

  const handleUpdateReading = async (values) => {
    const res = await fetch(
      `/api/stations/${id}/readings/${editingReading._id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      }
    );
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Could not update reading");
    }
    // swap the edited reading into the list
    setStation({
      ...station,
      readings: station.readings.map((r) => (r._id === data._id ? data : r)),
    });
    setEditingReading(null);
  };

  const handleDeleteReading = async () => {
    setDeletingReading(true);
    const res = await fetch(
      `/api/stations/${id}/readings/${readingToDelete._id}`,
      { method: "DELETE" }
    );
    setDeletingReading(false);
    if (!res.ok) {
      const data = await res.json();
      setReadingToDelete(null);
      setError(data.error || "Could not delete reading");
      return;
    }
    // remove the deleted reading from the list
    setStation({
      ...station,
      readings: station.readings.filter((r) => r._id !== readingToDelete._id),
    });
    setReadingToDelete(null);
  };

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

  // does the viewer own this station
  const isOwner = user && station.ownerId === user._id;

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

      {isOwner && (
        <div>
          <Link to={`/stations/${station._id}/edit`}>Edit station</Link>{" "}
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => setConfirmOpen(true)}
          >
            Delete station
          </button>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this station?"
        message={`"${station.name}" and all of its readings will be permanently deleted.`}
        confirmLabel="Delete"
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />

      <h2>Readings ({station.readings.length})</h2>

      {isOwner && editingReading && (
        <>
          <h3>Edit reading</h3>
          <ReadingForm
            key={editingReading._id}
            initialValues={{
              value: editingReading.value,
              date: editingReading.date.slice(0, 10),
              notes: editingReading.notes,
            }}
            onSubmit={handleUpdateReading}
            onCancel={() => setEditingReading(null)}
            submitLabel="Save reading"
          />
        </>
      )}

      {isOwner && !editingReading && (
        <ReadingForm onSubmit={handleAddReading} submitLabel="Add reading" />
      )}

      <ReadingTable
        readings={station.readings}
        normalMin={station.normalMin}
        normalMax={station.normalMax}
        unit={station.unit}
        canEdit={Boolean(isOwner)}
        onEdit={setEditingReading}
        onDelete={setReadingToDelete}
      />

      <ConfirmDialog
        open={Boolean(readingToDelete)}
        title="Delete this reading?"
        message="This reading will be permanently deleted."
        confirmLabel="Delete"
        busy={deletingReading}
        onConfirm={handleDeleteReading}
        onCancel={() => setReadingToDelete(null)}
      />
    </div>
  );
}

StationDetailPage.propTypes = {
  user: userShape,
};
