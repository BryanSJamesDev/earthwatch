import { getDB } from "./connection.js";
import { ObjectId } from "mongodb";

const PAGE_SIZE = 20;

// one page of stations matching the filters (without readings),
// plus the total for pagination
export const getStations = async ({ type, state, q, page = 1 }) => {
  const filter = {};
  if (type) filter.type = type;
  if (state) filter.state = state;
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { city: { $regex: q, $options: "i" } },
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
