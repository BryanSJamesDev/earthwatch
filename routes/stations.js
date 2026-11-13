import express from "express";

const router = express.Router();

// sample data for station monitor
const stations = [
  { id: 1, name: "Station A", location: "Location A" },
  { id: 2, name: "Station B", location: "Location B" },
  { id: 3, name: "Station C", location: "Location C" },
];

// GET /stations - retrieves all stations
router.get("/", (req, res) => {
  res.json(stations);
});

export default router;
