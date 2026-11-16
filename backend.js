import "dotenv/config";
import path from "node:path";
import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import { clientPromise, DB_NAME } from "./db/connection.js";
import passport from "./lib/passport.js";
import authRouter from "./routes/auth.js";
import eventsRouter from "./routes/events.js";
import stationsRouter from "./routes/stations.js";

console.log("initializing backend.js");

const port = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === "production";

if (isProduction && !process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be set in production");
}

const app = express();

// Render sits behind a proxy, needed for secure cookies
app.set("trust proxy", 1);

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "earthwatch-dev-secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ clientPromise, dbName: DB_NAME }),
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRouter);
app.use("/api", eventsRouter);
app.use("/api/stations", stationsRouter);

// unknown api routes get json instead of the react page
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Not found" });
});

// the built react app. any other path goes to index.html so
// react router can handle it on the client
const distPath = path.resolve("frontend", "dist");
app.use(express.static(distPath));
app.get("/{*splat}", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
