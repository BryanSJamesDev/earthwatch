import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiFetch } from "../api.js";
import useEventOptions from "../hooks/useEventOptions.js";
import EventFilters from "../components/EventFilters.jsx";
import EventCard from "../components/EventCard.jsx";
import Pagination from "../components/Pagination.jsx";
import { userShape } from "../propShapes.js";
import "./EventsPage.css";

const FILTER_KEYS = ["location", "type", "region", "minSeverity", "from", "to"];

// filters, sort, and page all live in the url so the back button works
// and a filtered view can be shared or bookmarked
export default function EventsPage({ user }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { options, error: optionsError } = useEventOptions();

  const queryKey = searchParams.toString();
  // remembers which query the data belongs to, so loading can be derived
  const [result, setResult] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    apiFetch(`/events?${queryKey}`, { signal: controller.signal })
      .then((data) => setResult({ key: queryKey, data }))
      .catch((err) => {
        if (err.name !== "AbortError") {
          setResult({ key: queryKey, error: err.message });
        }
      });
    return () => controller.abort();
  }, [queryKey]);

  const loading = result?.key !== queryKey;
  const data = result?.data;

  const filters = Object.fromEntries(
    FILTER_KEYS.map((key) => [key, searchParams.get(key) || ""])
  );
  const sort = searchParams.get("sort") || "newest";
  const page = Math.max(1, parseInt(searchParams.get("page")) || 1);

  // any filter change starts again from page 1
  const updateParams = (updates, keepPage = false) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(updates)) {
      if (value === "" || value == null) next.delete(key);
      else next.set(key, value);
    }
    if (!keepPage) next.delete("page");
    setSearchParams(next);
  };

  const handlePageChange = (newPage) => {
    updateParams({ page: newPage > 1 ? newPage : "" }, true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;

  return (
    <section className="events-page">
      <header className="events-page-header">
        <div>
          <h1>Natural Events</h1>
          <p className="muted">
            Browse wildfires, floods, earthquakes, storms, and volcanic
            eruptions. Filter by location, type, severity, or date, and open an
            event to read the full report.{" "}
            {user
              ? "You can edit or delete the events you posted."
              : "Log in to add your own."}
          </p>
        </div>
        <Link
          to={user ? "/events/new" : "/login?next=%2Fevents%2Fnew"}
          className="btn"
        >
          + Log an event
        </Link>
      </header>

      {optionsError && <p className="error-message">{optionsError}</p>}
      {options && (
        <EventFilters
          options={options}
          filters={filters}
          onChange={(updates) => updateParams(updates)}
          onReset={() => setSearchParams(sort === "newest" ? {} : { sort })}
        />
      )}

      <div className="events-page-toolbar">
        <p className="events-page-count" aria-live="polite">
          {data &&
            `${data.total.toLocaleString()} event${data.total === 1 ? "" : "s"} found`}
        </p>
        <div className="events-page-sort">
          <label htmlFor="events-sort">Sort by</label>
          <select
            id="events-sort"
            value={sort}
            onChange={(e) =>
              updateParams({
                sort: e.target.value === "newest" ? "" : e.target.value,
              })
            }
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="severity">Most severe first</option>
          </select>
        </div>
      </div>

      {result?.error && !loading && (
        <p className="error-message" role="alert">
          {result.error}
        </p>
      )}
      {!data && loading && <p className="muted">Loading events…</p>}

      {data && options && (
        <div
          className={`events-page-list${loading ? " events-page-loading" : ""}`}
          aria-busy={loading}
        >
          {data.events.length === 0 ? (
            <p className="events-page-empty">
              No events match these filters. Try a wider date range or clear
              some filters.
            </p>
          ) : (
            data.events.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                severityLabels={options.severities}
              />
            ))
          )}
        </div>
      )}

      {data && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </section>
  );
}

EventsPage.propTypes = {
  user: userShape,
};
