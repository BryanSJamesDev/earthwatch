// event dates are stored as midnight UTC, so they're shown in UTC too.
// otherwise someone west of UTC would see the day before
export const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

// "2025-08-14" for <input type="date">
export const toDateInput = (value) =>
  new Date(value).toISOString().slice(0, 10);

export const capitalize = (text) =>
  text.charAt(0).toUpperCase() + text.slice(1);

export const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
