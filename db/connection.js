import { MongoClient } from "mongodb";

const URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
export const DB_NAME = "earthwatch";

// one client for the whole app. sessions keep a connection open anyway,
// so opening a new client on every request would only add latency
export const client = new MongoClient(URI);
export const clientPromise = client.connect();

export const getDB = async () => {
  await clientPromise;
  return client.db(DB_NAME);
};
