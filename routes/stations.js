import express from "express";
import { getStations } from "../db/stationsDB.js";

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

export default router;
