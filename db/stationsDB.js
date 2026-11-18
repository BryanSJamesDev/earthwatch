import { getDB } from "./connection.js";
import { ObjectId } from "mongodb";

const PAGE_SIZE = 20;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// escapes regex special characters so search text is matched literally
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// one page of stations matching the filters (without readings),
// plus the total for pagination
export const getStations = async ({ type, state, q, page = 1 }) => {
  const filter = {};
  if (type) filter.type = type;
  if (state) filter.state = state;
  if (q) {
    const safeQ = escapeRegex(q);
    filter.$or = [
      { name: { $regex: safeQ, $options: "i" } },
      { city: { $regex: safeQ, $options: "i" } },
    ];
  }

  const db = await getDB();
  const collection = db.collection("stations");

  const stations = await collection
    .find(filter)
    .project({ readings: 0 })
    .skip((page - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE)
    .toArray();

  const total = await collection.countDocuments(filter);

  return { stations, total, page, pageSize: PAGE_SIZE };
};

// one station by id with all its readings
export const getStation = async (id) => {
  // if doesnt exist
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const db = await getDB();
  return db.collection("stations").findOne({ _id: new ObjectId(id) });
};

// create station
export const createStation = async (station) => {
  const db = await getDB();
  const result = await db.collection("stations").insertOne(station);
  return result.insertedId;
};

// update a station
export const updateStation = async (id, updates) => {
  const db = await getDB();
  return db
    .collection("stations")
    .updateOne({ _id: new ObjectId(id) }, { $set: updates });
};

// delete station
export const deleteStation = async (id) => {
  const db = await getDB();
  return db.collection("stations").deleteOne({ _id: new ObjectId(id) });
};

export const addReading = async (stationId, reading) => {
  const db = await getDB();
  await db
    .collection("stations")
    .updateOne(
      { _id: new ObjectId(stationId) },
      { $push: { readings: reading } }
    );
};

// returns false if the reading doesn't exist on this station
export const updateReading = async (stationId, readingId, updates) => {
  const db = await getDB();
  const result = await db.collection("stations").updateOne(
    {
      _id: new ObjectId(stationId),
      "readings._id": new ObjectId(readingId),
    },
    {
      $set: {
        "readings.$.value": updates.value,
        "readings.$.date": updates.date,
        "readings.$.notes": updates.notes,
      },
    }
  );
  return result.matchedCount > 0;
};

// returns false if the reading doesn't exist on this station
export const deleteReading = async (stationId, readingId) => {
  const db = await getDB();
  const result = await db
    .collection("stations")
    .updateOne(
      { _id: new ObjectId(stationId) },
      { $pull: { readings: { _id: new ObjectId(readingId) } } }
    );
  return result.modifiedCount > 0;
};

// stations with the most out-of-range readings in the last `days` days,
// counted back from the most recent reading so the dashboard never goes empty
export const getOutOfRangeStations = async (days, limit = 10) => {
  const db = await getDB();
  const collection = db.collection("stations");

  // find the date of the newest reading in the whole collection
  const [latest] = await collection
    .aggregate([
      { $unwind: "$readings" },
      { $group: { _id: null, maxDate: { $max: "$readings.date" } } },
    ])
    .toArray();
  const asOf = latest ? latest.maxDate : new Date();
  const since = new Date(asOf.getTime() - days * MS_PER_DAY);

  const stations = await collection
    .aggregate([
      { $unwind: "$readings" },
      { $match: { "readings.date": { $gte: since, $lte: asOf } } },
      {
        $match: {
          $expr: {
            $or: [
              { $lt: ["$readings.value", "$normalMin"] },
              { $gt: ["$readings.value", "$normalMax"] },
            ],
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          city: { $first: "$city" },
          state: { $first: "$state" },
          type: { $first: "$type" },
          outOfRangeCount: { $sum: 1 },
        },
      },
      { $sort: { outOfRangeCount: -1, name: 1 } },
      { $limit: limit },
    ])
    .toArray();

  return { asOf, stations };
};
