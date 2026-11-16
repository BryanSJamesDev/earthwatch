import express from "express";
import { getDB } from "../db/connection.js";

const router = express.Router();

// GET /api/stations - list stations (without readings)
router.get("/", async (req, res) => {
  try {
    // read the query parameters
    const { type, state, q } = req.query;
    const page = Number(req.query.page) || 1;

    // build filter from what the user sent
    const filter = {};

    // type of measurement
    if (type) {
      filter.type = type;
    }
    // state of stations
    if (state) {
      filter.state = state;
    }
    // search query
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { city: { $regex: q, $options: "i" } },
      ];
    }

    // pagination size
    const PAGE_SIZE = 20;
    const db = await getDB();
    const collection = db.collection("stations");

    // get one page of matching stations
    const stations = await collection
      .find(filter)
      .project({ readings: 0 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .toArray();

    // count all matching stations
    const total = await collection.countDocuments(filter);

    res.json({ stations, total, page, pageSize: PAGE_SIZE });
  } catch (err) {
    console.error("Error fetching stations:", err);
    res.status(500).json({ error: "Failed to fetch stations" });
  }
});
export default router;
