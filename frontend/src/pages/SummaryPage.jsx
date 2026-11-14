import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiFetch } from "../api.js";
import useEventOptions from "../hooks/useEventOptions.js";
import BarChart from "../components/BarChart.jsx";
import { MONTHS, capitalize } from "../format.js";
import "./SummaryPage.css";

// counts of events by type, month, and region, from one mongo aggregation
export default function SummaryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { options } = useEventOptions();

  const queryKey = searchParams.toString();
  const [result, setResult] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    apiFetch(`/events/summary?${queryKey}`, { signal: controller.signal })
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

  const year = searchParams.get("year") || "";
  const type = searchParams.get("type") || "";
  const region = searchParams.get("region") || "";

  const setFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  // link from a bar to the event list with the same filters applied
  const eventsLink = (extra) => {
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (region) params.set("region", region);
    if (year) {
      params.set("from", `${year}-01-01`);
      params.set("to", `${year}-12-31`);
    }
    for (const [key, value] of Object.entries(extra)) params.set(key, value);
    return `/events?${params}`;
  };

  let byType = [];
  let byMonth = [];
  let byRegion = [];
  let highlights = [];
  if (data) {
    byType = data.byType.map((t) => ({
      label: capitalize(t.type),
      value: t.count,
      note: `avg severity ${t.avgSeverity}`,
      href: eventsLink({ type: t.type }),
    }));
    // every month shows up, even the ones with no events
    const monthCounts = new Map(data.byMonth.map((m) => [m.month, m.count]));
    byMonth = MONTHS.map((label, i) => ({
      label,
      value: monthCounts.get(i + 1) || 0,
    }));
    byRegion = data.byRegion.map((r) => ({
      label: r.region,
      value: r.count,
      href: eventsLink({ region: r.region }),
    }));

    const busiestMonth = byMonth.reduce((a, b) => (b.value > a.value ? b : a));
    highlights = [
      { label: "Events", value: data.total.toLocaleString() },
      { label: "Most common type", value: byType[0]?.label ?? "-" },
      {
        label: "Busiest month",
        value: busiestMonth.value ? busiestMonth.label : "-",
      },
      { label: "Most affected region", value: byRegion[0]?.label ?? "-" },
    ];
  }

  return (
    <section className="summary-page">
      <header className="summary-page-header">
        <h1>Event Summary</h1>
        <p className="muted">
          See which natural events are most common, when in the year they
          happen, and where. Narrow it down by year, type, or region, and click
          a type or region to see those events.
        </p>
      </header>

      <form
        className="summary-page-filters"
        onSubmit={(e) => e.preventDefault()}
      >
        <div>
          <label htmlFor="summary-year">Year</label>
          <select
            id="summary-year"
            value={year}
            onChange={(e) => setFilter("year", e.target.value)}
          >
            <option value="">All years</option>
            {data?.years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="summary-type">Type</label>
          <select
            id="summary-type"
            value={type}
            onChange={(e) => setFilter("type", e.target.value)}
          >
            <option value="">All types</option>
            {options?.types.map((t) => (
              <option key={t} value={t}>
                {capitalize(t)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="summary-region">Region</label>
          <select
            id="summary-region"
            value={region}
            onChange={(e) => setFilter("region", e.target.value)}
          >
            <option value="">All regions</option>
            {options?.regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </form>

      {result?.error && !loading && (
        <p className="error-message" role="alert">
          {result.error}
        </p>
      )}
      {!data && loading && <p className="muted">Loading summary…</p>}

      {data && (
        <div
          className={`summary-page-body${loading ? " summary-page-loading" : ""}`}
          aria-busy={loading}
        >
          <dl className="summary-page-highlights">
            {highlights.map((h) => (
              <div key={h.label} className="summary-page-highlight">
                <dt>{h.label}</dt>
                <dd>{h.value}</dd>
              </div>
            ))}
          </dl>

          <div className="summary-page-charts">
            <BarChart
              title="Events by type"
              data={byType}
              emptyMessage="No events match these filters."
            />
            <BarChart
              title="Events by month of the year"
              data={byMonth}
              emptyMessage="No events match these filters."
            />
            <BarChart
              title="Events by region"
              data={byRegion}
              emptyMessage="No events match these filters."
            />
          </div>
        </div>
      )}
    </section>
  );
}

SummaryPage.propTypes = {};
