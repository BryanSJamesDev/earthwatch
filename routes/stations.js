import express from "express";
import { getStations, getStation } from "../db/stationsDB.js";

const router = express.Router();

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

export default router;
