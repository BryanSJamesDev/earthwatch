// generates synthetic natural events with faker.
//   node scripts/seedEvents.js            -> writes data/events.json
//   node scripts/seedEvents.js --insert   -> also replaces the seeded events in MongoDB
import "dotenv/config";
import fs from "node:fs";
import { faker } from "@faker-js/faker";
import { BSON } from "mongodb";

const COUNT = 1200;
const INSERT = process.argv.includes("--insert");
const START = new Date("2019-01-01T00:00:00Z");
const END = new Date("2026-10-31T00:00:00Z");

// the same records every time the script runs
faker.seed(5610);

const NA = "North America";
const CAC = "Central America & Caribbean";
const SA = "South America";
const EU = "Europe";
const AF = "Africa";
const ME = "Middle East";
const AS = "Asia";
const OC = "Oceania";

// [place, area, region, hemisphere] where each type of event actually happens
const PLACES = {
  wildfire: [
    ["Paradise", "California, USA", NA, "N"],
    ["Malibu", "California, USA", NA, "N"],
    ["Santa Rosa", "California, USA", NA, "N"],
    ["Redding", "California, USA", NA, "N"],
    ["Bend", "Oregon, USA", NA, "N"],
    ["Boulder", "Colorado, USA", NA, "N"],
    ["Lahaina", "Hawaii, USA", NA, "N"],
    ["Kamloops", "British Columbia, Canada", NA, "N"],
    ["Fort McMurray", "Alberta, Canada", NA, "N"],
    ["Attica", "Greece", EU, "N"],
    ["Rhodes", "Greece", EU, "N"],
    ["Pedrogao Grande", "Portugal", EU, "N"],
    ["Valencia", "Spain", EU, "N"],
    ["Antalya", "Turkey", EU, "N"],
    ["Blue Mountains", "New South Wales, Australia", OC, "S"],
    ["Gippsland", "Victoria, Australia", OC, "S"],
    ["Perth Hills", "Western Australia, Australia", OC, "S"],
    ["Pantanal", "Mato Grosso, Brazil", SA, "S"],
    ["Valparaiso", "Chile", SA, "S"],
    ["Yakutsk", "Sakha Republic, Russia", AS, "N"],
    ["Bejaia", "Algeria", AF, "N"],
    ["Haifa", "Israel", ME, "N"],
  ],
  flood: [
    ["Sylhet", "Bangladesh", AS, "N"],
    ["Kochi", "Kerala, India", AS, "N"],
    ["Guwahati", "Assam, India", AS, "N"],
    ["Hyderabad", "Sindh, Pakistan", AS, "N"],
    ["Zhengzhou", "Henan, China", AS, "N"],
    ["Bad Neuenahr", "Ahr Valley, Germany", EU, "N"],
    ["Faenza", "Emilia-Romagna, Italy", EU, "N"],
    ["Paiporta", "Valencia, Spain", EU, "N"],
    ["Houston", "Texas, USA", NA, "N"],
    ["Baton Rouge", "Louisiana, USA", NA, "N"],
    ["Hazard", "Kentucky, USA", NA, "N"],
    ["Montpelier", "Vermont, USA", NA, "N"],
    ["Lagos", "Nigeria", AF, "N"],
    ["Derna", "Libya", AF, "N"],
    ["Nairobi", "Kenya", AF, "S"],
    ["Beira", "Mozambique", AF, "S"],
    ["Porto Alegre", "Rio Grande do Sul, Brazil", SA, "S"],
    ["Lismore", "New South Wales, Australia", OC, "S"],
    ["Brisbane", "Queensland, Australia", OC, "S"],
    ["Dubai", "United Arab Emirates", ME, "N"],
    ["Gonaives", "Haiti", CAC, "N"],
  ],
  earthquake: [
    ["Noto Peninsula", "Ishikawa, Japan", AS, "N"],
    ["Fukushima", "Japan", AS, "N"],
    ["Palu", "Sulawesi, Indonesia", AS, "S"],
    ["Kathmandu", "Nepal", AS, "N"],
    ["Davao", "Mindanao, Philippines", AS, "N"],
    ["Hualien", "Taiwan", AS, "N"],
    ["Chengdu", "Sichuan, China", AS, "N"],
    ["Herat", "Afghanistan", AS, "N"],
    ["Kahramanmaras", "Turkey", ME, "N"],
    ["Kermanshah", "Iran", ME, "N"],
    ["Concepcion", "Chile", SA, "S"],
    ["Lima", "Peru", SA, "S"],
    ["Guayaquil", "Ecuador", SA, "S"],
    ["Oaxaca", "Mexico", NA, "N"],
    ["Ridgecrest", "California, USA", NA, "N"],
    ["Anchorage", "Alaska, USA", NA, "N"],
    ["Amatrice", "Lazio, Italy", EU, "N"],
    ["Heraklion", "Crete, Greece", EU, "N"],
    ["Al Haouz", "Morocco", AF, "N"],
    ["Christchurch", "Canterbury, New Zealand", OC, "S"],
    ["Wellington", "New Zealand", OC, "S"],
    ["Les Cayes", "Haiti", CAC, "N"],
    ["Escuintla", "Guatemala", CAC, "N"],
  ],
  storm: [
    ["Fort Myers", "Florida, USA", NA, "N"],
    ["Miami", "Florida, USA", NA, "N"],
    ["New Orleans", "Louisiana, USA", NA, "N"],
    ["Asheville", "North Carolina, USA", NA, "N"],
    ["Moore", "Oklahoma, USA", NA, "N"],
    ["Halifax", "Nova Scotia, Canada", NA, "N"],
    ["San Juan", "Puerto Rico", CAC, "N"],
    ["Havana", "Cuba", CAC, "N"],
    ["Kingston", "Jamaica", CAC, "N"],
    ["Freeport", "Bahamas", CAC, "N"],
    ["La Ceiba", "Honduras", CAC, "N"],
    ["Tacloban", "Leyte, Philippines", AS, "N"],
    ["Naha", "Okinawa, Japan", AS, "N"],
    ["Cox's Bazar", "Bangladesh", AS, "N"],
    ["Puri", "Odisha, India", AS, "N"],
    ["Shenzhen", "Guangdong, China", AS, "N"],
    ["Beira", "Mozambique", AF, "S"],
    ["Toamasina", "Madagascar", AF, "S"],
    ["Penzance", "Cornwall, UK", EU, "N"],
    ["Galway", "Ireland", EU, "N"],
    ["Brest", "Brittany, France", EU, "N"],
    ["Townsville", "Queensland, Australia", OC, "S"],
    ["Port Vila", "Vanuatu", OC, "S"],
    ["Suva", "Fiji", OC, "S"],
    ["Muscat", "Oman", ME, "N"],
  ],
  volcano: [
    ["Kilauea", "Hawaii, USA", NA, "N"],
    ["Shishaldin", "Alaska, USA", NA, "N"],
    ["Mount St. Helens", "Washington, USA", NA, "N"],
    ["Popocatepetl", "Mexico", NA, "N"],
    ["Fuego", "Guatemala", CAC, "N"],
    ["Soufriere Hills", "Montserrat", CAC, "N"],
    ["La Soufriere", "St. Vincent", CAC, "N"],
    ["Cotopaxi", "Ecuador", SA, "S"],
    ["Villarrica", "Chile", SA, "S"],
    ["Nevado del Ruiz", "Colombia", SA, "N"],
    ["Fagradalsfjall", "Reykjanes, Iceland", EU, "N"],
    ["Etna", "Sicily, Italy", EU, "N"],
    ["Stromboli", "Italy", EU, "N"],
    ["Cumbre Vieja", "La Palma, Spain", EU, "N"],
    ["Nyiragongo", "Goma, DR Congo", AF, "S"],
    ["Erta Ale", "Afar, Ethiopia", AF, "N"],
    ["Merapi", "Java, Indonesia", AS, "S"],
    ["Semeru", "Java, Indonesia", AS, "S"],
    ["Sakurajima", "Kagoshima, Japan", AS, "N"],
    ["Taal", "Batangas, Philippines", AS, "N"],
    ["Whakaari", "Bay of Plenty, New Zealand", OC, "S"],
    ["Hunga Tonga", "Tonga", OC, "S"],
    ["Manam", "Papua New Guinea", OC, "S"],
  ],
};

// how common each type is overall
const TYPE_WEIGHTS = {
  wildfire: 28,
  flood: 26,
  storm: 24,
  earthquake: 14,
  volcano: 8,
};

// relative chance of each month (Jan..Dec) in the northern hemisphere.
// southern hemisphere places get the same pattern shifted by 6 months
const MONTH_WEIGHTS = {
  wildfire: [1, 1, 2, 3, 4, 6, 9, 10, 9, 6, 3, 1],
  flood: [2, 2, 3, 4, 5, 7, 9, 8, 6, 4, 3, 2],
  storm: [2, 2, 2, 3, 4, 5, 7, 9, 10, 8, 4, 2],
  earthquake: Array(12).fill(1),
  volcano: Array(12).fill(1),
};

// most events are minor, a few are extreme
const SEVERITY_WEIGHTS = [35, 30, 20, 10, 5];

const weighted = (weights) =>
  faker.helpers.weightedArrayElement(
    weights.map((weight, i) => ({ weight, value: i }))
  );

const pickType = () =>
  faker.helpers.weightedArrayElement(
    Object.entries(TYPE_WEIGHTS).map(([value, weight]) => ({ value, weight }))
  );

// a date whose month follows the seasonal pattern for the type and hemisphere
const pickDate = (type, hemisphere) => {
  const shift = hemisphere === "S" ? 6 : 0;
  const weights = MONTH_WEIGHTS[type].map((_, m, w) => w[(m + shift) % 12]);
  for (;;) {
    const month = weighted(weights);
    const year = faker.number.int({
      min: START.getUTCFullYear(),
      max: END.getUTCFullYear(),
    });
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const day = faker.number.int({ min: 1, max: daysInMonth });
    const date = new Date(Date.UTC(year, month, day));
    if (date >= START && date <= END) return date;
  }
};

// scales a [min, max] range by severity (1-5) so worse events get bigger numbers
const scaled = (severity, ranges) => {
  const [min, max] = ranges[severity - 1];
  return faker.number.int({ min, max });
};

const fmt = (n) => n.toLocaleString("en-US");

const STORM_WORD = {
  [NA]: "Hurricane",
  [CAC]: "Hurricane",
  [AS]: "Typhoon",
  [OC]: "Cyclone",
  [AF]: "Cyclone",
  [ME]: "Cyclone",
  [EU]: "Storm",
  [SA]: "Storm",
};

const FIRE_NAMES = [
  "Canyon",
  "Ridge",
  "Creek",
  "Pine",
  "Oak",
  "Mesa",
  "Cedar",
  "Hollow",
  "Summit",
  "Willow",
  "Granite",
  "Eagle",
  "Coyote",
  "Juniper",
  "Bear",
];

const writers = {
  wildfire: (place, severity) => {
    const area = scaled(severity, [
      [20, 400],
      [400, 5000],
      [5000, 30000],
      [30000, 120000],
      [120000, 400000],
    ]);
    const evacuated = scaled(severity, [
      [0, 50],
      [50, 800],
      [800, 6000],
      [6000, 30000],
      [30000, 120000],
    ]);
    const containment = faker.number.int({ min: 5, max: 100 });
    const title = faker.helpers.arrayElement([
      `${faker.helpers.arrayElement(FIRE_NAMES)} Fire`,
      `${place[0]} wildfire`,
      `${faker.helpers.arrayElement(FIRE_NAMES)} Complex Fire`,
      `Brush fire near ${place[0]}`,
    ]);
    const cause = faker.helpers.arrayElement([
      "Dry lightning is the suspected cause.",
      "The cause is under investigation.",
      "Strong, dry winds pushed the fire across ridgelines.",
      "Officials believe it started near a power line.",
      "A heat wave and low humidity helped it spread quickly.",
    ]);
    const evac =
      evacuated > 0
        ? `About ${fmt(evacuated)} residents were told to evacuate.`
        : "No evacuations were ordered.";
    return {
      title,
      description: `The fire burned roughly ${fmt(area)} acres and was ${containment}% contained at last report. ${evac} ${cause}`,
    };
  },

  flood: (place, severity) => {
    const rain = scaled(severity, [
      [40, 90],
      [90, 160],
      [160, 280],
      [280, 450],
      [450, 900],
    ]);
    const homes = scaled(severity, [
      [5, 80],
      [80, 600],
      [600, 5000],
      [5000, 40000],
      [40000, 300000],
    ]);
    const title = faker.helpers.arrayElement([
      `${place[0]} flooding`,
      `Flash flood in ${place[0]}`,
      `River flooding near ${place[0]}`,
      `Heavy rain floods ${place[0]}`,
    ]);
    const extra = faker.helpers.arrayElement([
      "Several roads and bridges were closed.",
      "Rescue crews used boats to reach stranded residents.",
      "The local river rose well above flood stage.",
      "Schools closed while water receded.",
      "Power was cut to parts of the area.",
    ]);
    return {
      title,
      description: `About ${rain} mm of rain fell in a short period, flooding an estimated ${fmt(homes)} homes. ${extra}`,
    };
  },

  earthquake: (place, severity) => {
    const magnitude = faker.number.float({
      min: [4.0, 5.0, 6.0, 6.7, 7.5][severity - 1],
      max: [4.9, 5.9, 6.6, 7.4, 8.6][severity - 1],
      fractionDigits: 1,
    });
    const depth = faker.number.int({ min: 5, max: 120 });
    const aftershocks = scaled(severity, [
      [0, 5],
      [3, 20],
      [10, 60],
      [40, 200],
      [100, 600],
    ]);
    const title = faker.helpers.arrayElement([
      `M${magnitude.toFixed(1)} earthquake near ${place[0]}`,
      `M${magnitude.toFixed(1)} quake shakes ${place[1].split(",").pop().trim()}`,
    ]);
    const effect = [
      "Shaking was felt but caused little damage.",
      "Some older buildings were damaged and a few people were hurt.",
      "Buildings collapsed in several towns and landslides blocked roads.",
      "Widespread damage was reported and thousands were displaced.",
      "The quake caused severe destruction across the region and a tsunami warning was issued for nearby coasts.",
    ][severity - 1];
    return {
      title,
      description: `A magnitude ${magnitude.toFixed(1)} earthquake struck at a depth of ${depth} km. ${effect} ${fmt(aftershocks)} aftershocks were recorded in the following days.`,
    };
  },

  storm: (place, severity) => {
    const wind = scaled(severity, [
      [50, 80],
      [80, 120],
      [120, 160],
      [160, 210],
      [210, 290],
    ]);
    const name = faker.person.firstName();
    const region = place[2];
    let title;
    if (region === NA && severity <= 2 && faker.datatype.boolean()) {
      title = `Tornado outbreak near ${place[0]}`;
    } else if (severity <= 1) {
      title = `Severe thunderstorm in ${place[0]}`;
    } else if (severity === 2 && STORM_WORD[region] !== "Storm") {
      title = `Tropical Storm ${name}`;
    } else {
      title = `${STORM_WORD[region]} ${name}`;
    }
    const extra = faker.helpers.arrayElement([
      "Downed trees left many without power.",
      "Storm surge flooded low-lying coastal streets.",
      "Ports and airports suspended operations.",
      "Shelters opened ahead of landfall.",
      "Crops and fishing boats were damaged.",
    ]);
    return {
      title,
      description: `Winds reached about ${wind} km/h as the storm passed ${place[0]}. ${extra}`,
    };
  },

  volcano: (place, severity) => {
    const plume = scaled(severity, [
      [1, 3],
      [3, 6],
      [6, 12],
      [12, 20],
      [20, 40],
    ]);
    const title = faker.helpers.arrayElement([
      `${place[0]} eruption`,
      `Ash plume from ${place[0]}`,
      `Lava flow at ${place[0]}`,
      `Increased activity at ${place[0]}`,
    ]);
    const effect = [
      "Activity stayed near the summit and posed no threat to nearby towns.",
      "Light ashfall was reported in nearby villages.",
      "Authorities raised the alert level and closed the area around the crater.",
      "Nearby villages were evacuated and flights were diverted.",
      "Ash grounded flights across the region and thousands were evacuated.",
    ][severity - 1];
    return {
      title,
      description: `The volcano sent an ash column about ${plume} km high. ${effect}`,
    };
  },
};

const makeEvent = () => {
  const type = pickType();
  const place = faker.helpers.arrayElement(PLACES[type]);
  const severity = weighted(SEVERITY_WEIGHTS) + 1;
  const date = pickDate(type, place[3]);
  const { title, description } = writers[type](place, severity);
  // the record shows up in the app a few days after the event
  const createdAt = new Date(
    date.getTime() + faker.number.int({ min: 0, max: 5 }) * 24 * 60 * 60 * 1000
  );
  return {
    title,
    type,
    severity,
    region: place[2],
    location: `${place[0]}, ${place[1]}`,
    date,
    description,
    // seeded events have no author, so nobody can edit or delete them
    authorId: null,
    authorName: "EarthWatch seed data",
    createdAt,
    updatedAt: createdAt,
  };
};

const events = Array.from({ length: COUNT }, makeEvent).sort(
  (a, b) => a.date - b.date
);

// extended json keeps the dates as real dates when imported with Compass
fs.mkdirSync("data", { recursive: true });
fs.writeFileSync(
  "data/events.json",
  BSON.EJSON.stringify(events, null, 2, { relaxed: true })
);
console.log(`Wrote ${events.length} events to data/events.json`);

if (INSERT) {
  const { client, getDB } = await import("../db/connection.js");
  try {
    const collection = (await getDB()).collection("events");
    // only replaces seeded events, anything users created stays
    const { deletedCount } = await collection.deleteMany({ authorId: null });
    const { insertedCount } = await collection.insertMany(events);
    console.log(
      `Removed ${deletedCount} old seeded events, inserted ${insertedCount}`
    );
  } finally {
    await client.close();
  }
}
