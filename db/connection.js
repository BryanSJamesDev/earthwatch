import { MongoClient } from "mongodb";

let db;

export const connectDB = async () => {
  const URI = process.env.MONGODB_URI;
  // if uri missing
  if (!URI) {
    throw new Error("MONGODB_URI is not defined");
  }
  // create client with uri
  const client = new MongoClient(URI);
  // connect to the database
  await client.connect();
  db = client.db("earthwatch");
  console.log("connected to mongoDB");
};

export const getDB = () => db;
