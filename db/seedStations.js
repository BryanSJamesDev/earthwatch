import "dotenv/config";
import { getDB, client } from "./connection.js";
import { readFile } from "fs/promises";
import { ObjectId } from "mongodb";

// generating reads for each station type
// normalMin/normalMax are saved on each station
// possibleMin/possibleMax are the wider range readings are drawn from
// so some readings fall outside the normal range
const STATION_TYPES = {
  air_quality: {
    unit: "AQI",
    normalMin: 0,
    normalMax: 100,
    possibleMin: 0,
    possibleMax: 300,
  },
  water_level: {
    unit: "m",
    normalMin: 1,
    normalMax: 4,
    possibleMin: 0,
    possibleMax: 8,
  },
  temperature: {
    unit: "°C",
    normalMin: -10,
    normalMax: 35,
    possibleMin: -30,
    possibleMax: 50,
  },
};

// read stations data from JSON file
const stationsFileUrl = new URL("./data/stations.json", import.meta.url);
// get file contents as text
const stationsData = await readFile(stationsFileUrl, "utf-8");
// parse
const stations = JSON.parse(stationsData);

// returns random decimal between min and max and rounded to 1 decimal place
function randomBetween(min, max) {
  const value = Math.random() * (max - min) + min;
  return Math.round(value * 10) / 10;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;
// build 20-50 readings for each station
const makeReadings = (config) => {
  // 20-50 readings
  const count = Math.floor(Math.random() * 31) + 20;
  const readings = [];

  for (let i = 0; i < count; i++) {
    readings.push({
      _id: new ObjectId(),
      value: randomBetween(config.possibleMin, config.possibleMax),
      date: new Date(Date.now() - Math.random() * 60 * MS_PER_DAY),
      notes: "",
    });
  }
  return readings;
};

// connect
const db = await getDB();

// create full stations with mockaroo and seed data
const fullStations = stations.map((station) => {
  const config = STATION_TYPES[station.type];
  return {
    ...station,
    name: `${station.city} Monitoring Station`,
    unit: config.unit,
    normalMin: config.normalMin,
    normalMax: config.normalMax,
    ownerId: null,
    readings: makeReadings(config),
  };
});

// clear old stations
const stationsCollection = db.collection("stations");
await stationsCollection.deleteMany({ ownerId: null });
// insert new stations
const result = await stationsCollection.insertMany(fullStations);
console.log(`Inserted ${result.insertedCount} stations`);

await client.close();
