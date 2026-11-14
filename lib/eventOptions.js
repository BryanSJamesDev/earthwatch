// allowed values for events. the api serves these to the frontend so the
// form, the filters, and the validation all use the same lists
export const EVENT_TYPES = [
  "wildfire",
  "flood",
  "earthquake",
  "storm",
  "volcano",
];

export const REGIONS = [
  "North America",
  "Central America & Caribbean",
  "South America",
  "Europe",
  "Africa",
  "Middle East",
  "Asia",
  "Oceania",
];

// index + 1 is the stored severity level
export const SEVERITY_LABELS = [
  "Minor",
  "Moderate",
  "Serious",
  "Severe",
  "Extreme",
];
