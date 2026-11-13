import express from "express";
import { getDB } from "../db/connection.js";

const router = express.Router();

// GET /api/stations - list stations (without readings)
router.get("/", async (req, res) => {
  try {
    const stations = await getDB()
      .collection("stations")
      .find({})
      .project({ readings: 0 })
      .limit(20)
      .toArray();

    res.json(stations);
  } catch (err) {
    console.error("Error fetching stations:", err);
    res.status(500).json({ error: "Failed to fetch stations" });
  }
});
export default router;
