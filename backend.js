import express from "express";
import stationsRouter from "./routes/station.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", express.static("./frontend/dist"));
app.use("/api", stationsRouter);

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
