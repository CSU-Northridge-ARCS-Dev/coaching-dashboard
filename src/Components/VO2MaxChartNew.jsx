// src/Components/VO2MaxChartNew.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import DateWindowPicker from "./DateWindowPicker";
import {
  debounce,
  isValidDateOrder,
  toISOAtEndOfDay,
  toISOAtStartOfDay,
} from "../Utils/dates";

export default function VO2MaxChartNew({ userId }) {
  const [range, setRange] = useState({ start: "", end: "" });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);

  const canQuery = useMemo(
    () => isValidDateOrder(range.start, range.end) && Boolean(userId),
    [range.start, range.end, userId]
  );

  const fetchData = async () => {
    if (!canQuery) return;
    setStatus("loading"); setError("");

    const startISO = toISOAtStartOfDay(range.start);
    const endISO   = toISOAtEndOfDay(range.end);

    try {
      const url = `/api/vo2max?userId=${encodeURIComponent(userId)}&start=${encodeURIComponent(startISO)}&end=${encodeURIComponent(endISO)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        setRows([]); setStatus("empty");
      } else {
        setRows(data); setStatus("ready");
      }
    } catch (e) {
      setError(e.message || "Failed to fetch VO₂ max.");
      setStatus("error");
    }
  };

  const debouncedFetchRef = useRef(debounce(fetchData, 500));

  useEffect(() => {
    if (canQuery) debouncedFetchRef.current();
    else { setStatus("idle"); setRows([]); }
  }, [range.start, range.end, userId, canQuery]);

  return (
    <div className="p-4 border rounded-2xl shadow-sm space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="text-lg font-semibold">VO₂ Max (New)</h3>
        <DateWindowPicker mode="range" value={range} onChange={setRange} />
      </div>

      {status === "idle" && <p className="text-sm text-gray-600">Pick a date range.</p>}
      {status === "loading" && <p className="text-sm">Loading…</p>}
      {status === "error" && <p className="text-sm text-red-600">Error: {error}</p>}
      {status === "empty" && <p className="text-sm text-gray-600">No data for this window.</p>}
      {status === "ready" && (
        <ul className="list-disc pl-6 text-sm">
          {rows.map((r, i) => (
            <li key={i}>
              {new Date(r.timestamp).toLocaleDateString()} — {r.vo2max}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
