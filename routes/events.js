import express from "express";
import { ObjectId } from "mongodb";
import eventsDB from "../db/eventsDB.js";
import { requireAuth } from "../lib/auth.js";
import { EVENT_TYPES, REGIONS, SEVERITY_LABELS } from "../lib/eventOptions.js";

const router = express.Router();
const myDB = eventsDB();

const MAX_TITLE = 100;
const MAX_LOCATION = 100;
const MAX_DESCRIPTION = 2000;
const MAX_PAGE_SIZE = 50;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// "2025-08-14" -> Date at midnight UTC, or null if it isn't a real date
const parseDate = (value) => {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return null;
  const date = new Date(`${value}T00:00:00Z`);
  // rejects dates like 2025-02-31 that Date would roll over
  if (isNaN(date) || date.toISOString().slice(0, 10) !== value) return null;
  return date;
};

// reads the list filters from the query string, ignoring invalid ones
const readFilters = (query) => {
  const filters = {};
  if (EVENT_TYPES.includes(query.type)) filters.type = query.type;
  if (REGIONS.includes(query.region)) filters.region = query.region;
  if (query.location) {
    filters.location = String(query.location).trim().slice(0, MAX_LOCATION);
  }
  const minSeverity = parseInt(query.minSeverity);
  if (minSeverity >= 1 && minSeverity <= SEVERITY_LABELS.length) {
    filters.minSeverity = minSeverity;
  }
  const from = parseDate(query.from);
  if (from) filters.from = from;
  const to = parseDate(query.to);
  if (to) filters.to = to;
  return filters;
};

// cleans up the fields from the event form.
// returns { event } or { error } when something is missing or invalid
const readEvent = (body) => {
  const title = String(body.title || "").trim();
  const location = String(body.location || "").trim();
  const description = String(body.description || "").trim();
  const severity = Number(body.severity);
  const date = parseDate(body.date);

  if (title.length < 3 || title.length > MAX_TITLE) {
    return { error: `Title must be 3-${MAX_TITLE} characters` };
  }
  if (!EVENT_TYPES.includes(body.type)) {
    return { error: `Type must be one of: ${EVENT_TYPES.join(", ")}` };
  }
  if (
    !Number.isInteger(severity) ||
    severity < 1 ||
    severity > SEVERITY_LABELS.length
  ) {
    return { error: `Severity must be 1-${SEVERITY_LABELS.length}` };
  }
  if (!REGIONS.includes(body.region)) {
    return { error: "Pick a region from the list" };
  }
  if (location.length < 2 || location.length > MAX_LOCATION) {
    return { error: `Location must be 2-${MAX_LOCATION} characters` };
  }
  if (!date) {
    return { error: "Date must be a valid date (YYYY-MM-DD)" };
  }
  // a day of slack for time zones ahead of UTC
  if (date.getTime() > Date.now() + 24 * 60 * 60 * 1000) {
    return { error: "Date can't be in the future" };
  }
  if (description.length > MAX_DESCRIPTION) {
    return {
      error: `Description must be ${MAX_DESCRIPTION} characters or less`,
    };
  }

  return {
    event: {
      title,
      type: body.type,
      severity,
      region: body.region,
      location,
      date,
      description,
    },
  };
};

const isAuthor = (event, user) =>
  event.authorId != null && event.authorId.equals(user._id);

// stops bad ids from turning into 500s
router.param("id", (req, res, next, id) => {
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid event id" });
  }
  next();
});

router.get("/events/options", (req, res) => {
  res.json({
    types: EVENT_TYPES,
    regions: REGIONS,
    severities: SEVERITY_LABELS,
  });
});

// counts by type, month, and region, optionally for one year / type / region
router.get("/events/summary", async (req, res) => {
  try {
    const filters = readFilters({
      type: req.query.type,
      region: req.query.region,
    });
    const year = parseInt(req.query.year);
    if (year >= 1900 && year <= 9999) {
      filters.from = new Date(Date.UTC(year, 0, 1));
      filters.to = new Date(Date.UTC(year, 11, 31));
    }

    const [summary, years] = await Promise.all([
      myDB.getSummary(filters),
      myDB.getYears(),
    ]);
    res.json({ ...summary, years });
  } catch (err) {
    console.error("Error building event summary:", err);
    res.status(500).json({ error: "Failed to load the summary" });
  }
});

// paginated list with filters, e.g. /events?type=flood&minSeverity=3&page=2
router.get("/events", async (req, res) => {
  try {
    const filters = readFilters(req.query);
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, parseInt(req.query.pageSize) || 20)
    );
    const result = await myDB.getEvents({
      filters,
      sort: req.query.sort,
      page,
      pageSize,
    });
    res.json(result);
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

router.get("/events/:id", async (req, res) => {
  try {
    const event = await myDB.getEvent(req.params.id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json(event);
  } catch (err) {
    console.error("Error fetching event:", err);
    res.status(500).json({ error: "Failed to fetch event" });
  }
});

router.post("/events", requireAuth, async (req, res) => {
  try {
    const { event, error } = readEvent(req.body);
    if (error) {
      return res.status(400).json({ error });
    }

    const now = new Date();
    const newEvent = {
      ...event,
      authorId: req.user._id,
      authorName: req.user.username,
      createdAt: now,
      updatedAt: now,
    };
    const id = await myDB.createEvent(newEvent);
    res.status(201).json({ ...newEvent, _id: id });
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ error: "Failed to create event" });
  }
});

router.put("/events/:id", requireAuth, async (req, res) => {
  try {
    const existing = await myDB.getEvent(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: "Event not found" });
    }
    if (!isAuthor(existing, req.user)) {
      return res
        .status(403)
        .json({ error: "Only the author can edit this event" });
    }

    const { event, error } = readEvent(req.body);
    if (error) {
      return res.status(400).json({ error });
    }

    const updates = { ...event, updatedAt: new Date() };
    await myDB.updateEvent(req.params.id, updates);
    res.json({ ...existing, ...updates });
  } catch (err) {
    console.error("Error updating event:", err);
    res.status(500).json({ error: "Failed to update event" });
  }
});

router.delete("/events/:id", requireAuth, async (req, res) => {
  try {
    const existing = await myDB.getEvent(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: "Event not found" });
    }
    if (!isAuthor(existing, req.user)) {
      return res
        .status(403)
        .json({ error: "Only the author can delete this event" });
    }

    await myDB.deleteEvent(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error("Error deleting event:", err);
    res.status(500).json({ error: "Failed to delete event" });
  }
});

export default router;
