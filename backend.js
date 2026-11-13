import "dotenv/config";
import express from "express";
import stationsRouter from "./routes/stations.js";
import { connectDB } from "./db/connection.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("./frontend/dist"));
app.use("/api/stations", stationsRouter);
// catch all sends index.html for any other GET request
app.get("/{*splat}", (req, res) => {
  res.sendFile("index.html", { root: "./frontend/dist" });
});

// connection to database
await connectDB();

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
