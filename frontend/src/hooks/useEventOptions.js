import { useEffect, useState } from "react";
import { apiFetch } from "../api.js";

// the lists only change when the server changes, so fetch them once and share
let optionsPromise;

// event types, regions, and severity labels from /api/events/options
export default function useEventOptions() {
  const [options, setOptions] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    optionsPromise ??= apiFetch("/events/options");
    optionsPromise
      .then((data) => active && setOptions(data))
      .catch((err) => {
        // let the next component try again
        optionsPromise = undefined;
        if (active) setError(err.message);
      });
    return () => {
      active = false;
    };
  }, []);

  return { options, error };
}
