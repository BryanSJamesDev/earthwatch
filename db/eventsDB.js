import { ObjectId } from "mongodb";
import { getDB } from "./connection.js";

const SORTS = {
  newest: { date: -1, _id: -1 },
  oldest: { date: 1, _id: 1 },
  severity: { severity: -1, date: -1, _id: -1 },
};

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// turns the filters from the query string into a mongo query
const buildQuery = ({ type, region, location, minSeverity, from, to } = {}) => {
  const query = {};
  if (type) query.type = type;
  if (region) query.region = region;
  if (location) {
    query.location = { $regex: escapeRegex(location), $options: "i" };
  }
  if (minSeverity) query.severity = { $gte: minSeverity };
  if (from || to) {
    query.date = {};
    if (from) query.date.$gte = from;
    if (to) query.date.$lte = to;
  }
  return query;
};

export default function eventsDB(collectionName = "events") {
  const me = {};

  let indexesReady;
  const getEvents = async () => {
    const events = (await getDB()).collection(collectionName);
    indexesReady ??= events.createIndexes([
      { key: { date: -1 } },
      { key: { type: 1, date: -1 } },
      { key: { region: 1, date: -1 } },
      { key: { severity: -1, date: -1 } },
    ]);
    await indexesReady;
    return events;
  };

  // one page of events matching the filters, plus the total for pagination
  me.getEvents = async ({
    filters,
    sort = "newest",
    page = 1,
    pageSize = 20,
  } = {}) => {
    const events = await getEvents();
    const query = buildQuery(filters);
    const [results, total] = await Promise.all([
      events
        .find(query)
        .sort(SORTS[sort] || SORTS.newest)
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .toArray(),
      events.countDocuments(query),
    ]);
    return { events: results, total, page, pageSize };
  };

  me.getEvent = async (id) => {
    const events = await getEvents();
    return events.findOne({ _id: new ObjectId(id) });
  };

  me.createEvent = async (event) => {
    const events = await getEvents();
    const result = await events.insertOne(event);
    return result.insertedId;
  };

  me.updateEvent = async (id, updates) => {
    const events = await getEvents();
    const result = await events.updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );
    return result.matchedCount;
  };

  me.deleteEvent = async (id) => {
    const events = await getEvents();
    const result = await events.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount;
  };

  // counts by type, by month, and by region in a single aggregation.
  // months are calendar months (1-12) so seasonal patterns show up
  me.getSummary = async (filters) => {
    const events = await getEvents();
    const [result] = await events
      .aggregate([
        { $match: buildQuery(filters) },
        {
          $facet: {
            total: [{ $count: "count" }],
            byType: [
              {
                $group: {
                  _id: "$type",
                  count: { $sum: 1 },
                  avgSeverity: { $avg: "$severity" },
                },
              },
              { $sort: { count: -1, _id: 1 } },
            ],
            byMonth: [
              { $group: { _id: { $month: "$date" }, count: { $sum: 1 } } },
              { $sort: { _id: 1 } },
            ],
            byRegion: [
              { $group: { _id: "$region", count: { $sum: 1 } } },
              { $sort: { count: -1, _id: 1 } },
            ],
          },
        },
      ])
      .toArray();

    return {
      total: result.total[0]?.count || 0,
      byType: result.byType.map((t) => ({
        type: t._id,
        count: t.count,
        avgSeverity: Math.round(t.avgSeverity * 10) / 10,
      })),
      byMonth: result.byMonth.map((m) => ({ month: m._id, count: m.count })),
      byRegion: result.byRegion.map((r) => ({
        region: r._id,
        count: r.count,
      })),
    };
  };

  // every year that has events, newest first, for the summary year picker
  me.getYears = async () => {
    const events = await getEvents();
    const years = await events
      .aggregate([
        { $group: { _id: { $year: "$date" } } },
        { $sort: { _id: -1 } },
      ])
      .toArray();
    return years.map((y) => y._id);
  };

  return me;
}
