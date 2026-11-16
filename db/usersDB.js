import { ObjectId } from "mongodb";
import { getDB } from "./connection.js";

export default function usersDB(collectionName = "users") {
  const me = {};

  let indexReady;
  const getUsers = async () => {
    const users = (await getDB()).collection(collectionName);
    // usernames are stored lowercase, so this also makes them case-insensitive
    indexReady ??= users.createIndex({ username: 1 }, { unique: true });
    await indexReady;
    return users;
  };

  me.findByUsername = async (username) => {
    const users = await getUsers();
    return users.findOne({ username: String(username).trim().toLowerCase() });
  };

  me.findById = async (id) => {
    if (!ObjectId.isValid(id)) return null;
    const users = await getUsers();
    return users.findOne({ _id: new ObjectId(id) });
  };

  // returns the new user, or null if the username is already taken
  me.createUser = async ({ username, passwordHash }) => {
    const users = await getUsers();
    const user = { username, passwordHash, createdAt: new Date() };
    try {
      const result = await users.insertOne(user);
      return { ...user, _id: result.insertedId };
    } catch (err) {
      if (err.code === 11000) return null;
      throw err;
    }
  };

  return me;
}
