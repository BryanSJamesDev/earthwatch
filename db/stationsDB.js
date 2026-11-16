import { getDB } from "./connection.js";

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
