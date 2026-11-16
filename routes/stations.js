import express from "express";
import { requireAuth } from "../lib/auth.js";
import {
  getStations,
  getStation,
  createStation,
  updateStation,
  deleteStation,
} from "../db/stationsDB.js";

const router = express.Router();
const STATION_UNITS = {
  air_quality: "AQI",
  water_level: "m",
  temperature: "°C",
};

// cleans up the station form fields. serves as validation
const readStation = (body) => {
  const name = String(body.name || "").trim();
  const city = String(body.city || "").trim();
  const state = String(body.state || "")
    .trim()
    .toUpperCase();
  const normalMin = Number(body.normalMin);
  const normalMax = Number(body.normalMax);

  if (name.length < 3 || name.length > 100) {
    return { error: "Name must be 3-100 characters" };
  }
  if (!city) {
    return { error: "City is required" };
  }
  if (!/^[A-Z]{2}$/.test(state)) {
    return { error: "State must be a 2-letter code like TX" };
  }
  if (!STATION_UNITS[body.type]) {
    return { error: "Pick a station type from the list" };
  }
  if (!Number.isFinite(normalMin) || !Number.isFinite(normalMax)) {
    return { error: "Normal range must be numbers" };
  }
  if (normalMin >= normalMax) {
    return { error: "Normal min must be less than normal max" };
  }

  return {
    station: {
      name,
      city,
      state,
      type: body.type,
      unit: STATION_UNITS[body.type],
      normalMin,
      normalMax,
    },
  };
};

// compares ids
const isOwner = (station, user) =>
  station.ownerId != null && station.ownerId.equals(user._id);

// GET /api/stations - one page of stations, with optional filters
router.get("/", async (req, res) => {
  try {
    const { type, state, q } = req.query;
    const page = Number(req.query.page) || 1;
    const result = await getStations({ type, state, q, page });
    res.json(result);
  } catch (err) {
    console.error("Error fetching stations:", err);
    res.status(500).json({ error: "Failed to fetch stations" });
  }
});

// GET /api/stations/:id - one station by id with all its readings
router.get("/:id", async (req, res) => {
  try {
    const station = await getStation(req.params.id);
    if (!station) {
      return res.status(404).json({ error: "Station not found" });
    }
    res.json(station);
  } catch (err) {
    console.error("Error fetching station:", err);
    res.status(500).json({ error: "Failed to fetch station" });
  }
});

// POST /api/stations - create a new station (logged in users only)
router.post("/", requireAuth, async (req, res) => {
  try {
    const { error, station } = readStation(req.body);
    if (error) {
      return res.status(400).json({ error });
    }
    const newStation = {
      ...station,
      ownerId: req.user._id,
      ownerName: req.user.username,
      readings: [],
      createdAt: new Date(),
    };
    const id = await createStation(newStation);
    res.status(201).json({ ...newStation, _id: id });
  } catch (err) {
    console.error("Error creating station:", err);
    res.status(500).json({ error: "Failed to create station" });
  }
});

// PUT /api/stations/:id - update a station (owner only)
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const existing = await getStation(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: "Station not found" });
    }
    if (!isOwner(existing, req.user)) {
      return res
        .status(403)
        .json({ error: "Not authorized to edit this station" });
    }
    const { station, error } = readStation(req.body);
    if (error) {
      return res.status(400).json({ error });
    }

    await updateStation(req.params.id, station);
    res.json({ ...existing, ...station });
  } catch (err) {
    console.error("Error updating station:", err);
    res.status(500).json({ error: "Failed to update station" });
  }
});

// DELETE /api/stations/:id - delete a station (owner only)
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const existing = await getStation(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: "Station not found" });
    }
    if (!isOwner(existing, req.user)) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this station" });
    }

    await deleteStation(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error("Error deleting station:", err);
    res.status(500).json({ error: "Failed to delete station" });
  }
});

export default router;
