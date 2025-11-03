// src/Components/HeartRateChartNew.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import DateWindowPicker from "./DateWindowPicker";
import {
  debounce,
  isValidDateOrder,
  toISOAtEndOfDay,
  toISOAtStartOfDay,
} from "../Utils/dates";
// import { PopupCalendar } from "../Components/DatePicker";
import PopupCalendar from "./DatePicker/PopupCalendar";

export default function HeartRateChartNew({ userId }) {
  // Existing manual range (YYYY-MM-DD)
  const [range, setRange] = useState({ start: "", end: "" });

  // Popup calendar state
  const [showCalendar, setShowCalendar] = useState(false);
  const [dateRange, setDateRange] = useState(null); // { startDate: Date, endDate: Date }

  const [status, setStatus] = useState("idle"); // idle | loading | error | ready | empty
  const [error, setError] = useState("");
  const [points, setPoints] = useState([]);

  // Allow query if we have a userId AND (a valid manual range OR a popup range)
  const canQuery = useMemo(
    () =>
      Boolean(userId) &&
      (dateRange || isValidDateOrder(range.start, range.end)),
    [userId, range.start, range.end, dateRange]
  );

  const fetchData = async () => {
    if (!canQuery) return;
    setStatus("loading");
    setError("");

    let startISO, endISO;

    if (dateRange) {
      // Range selected from the PopupCalendar (already UTC start/end)
      startISO = dateRange.startDate.toISOString();
      endISO = dateRange.endDate.toISOString();
    } else {
      // Manual YYYY-MM-DD range via DateWindowPicker
      startISO = toISOAtStartOfDay(range.start);
      endISO = toISOAtEndOfDay(range.end);
    }

    try {
      const url = `/api/heart-rate?userId=${encodeURIComponent(
        userId
      )}&start=${encodeURIComponent(startISO)}&end=${encodeURIComponent(
        endISO
      )}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        setPoints([]);
        setStatus("empty");
      } else {
        setPoints(data);
        setStatus("ready");
      }
    } catch (e) {
      setError(e.message || "Failed to fetch heart rate.");
      setStatus("error");
    }
  };

  const debouncedFetchRef = useRef(debounce(fetchData, 500));

  useEffect(() => {
    if (canQuery) debouncedFetchRef.current();
    else {
      setStatus("idle");
      setPoints([]);
    }
  }, [range.start, range.end, userId, canQuery, dateRange]);

  // Called when PopupCalendar user clicks Save
  function handleCalendarChange({ startDate, endDate }) {
    setDateRange({ startDate, endDate });
  }

  return (
    <div className="p-4 border rounded-2xl shadow-sm space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="text-lg font-semibold">Heart Rate (New)</h3>

        <div className="flex items-center gap-2">
          {/* Existing manual range picker */}
          <DateWindowPicker mode="range" value={range} onChange={setRange} />

          {/* Range picker trigger (popup) */}
          <button
            type="button"
            onClick={() => setShowCalendar(true)}
            className="px-3 py-2 rounded-md border bg-white hover:bg-gray-50 text-sm"
            title="Pick a date range"
          >
            Pick Date Range
          </button>
        </div>
      </div>

      {/* Show currently selected popup range (if any) */}
      {dateRange && (
        <p className="text-xs text-gray-600">
          Range: {dateRange.startDate.toISOString().slice(0, 10)} →{" "}
          {dateRange.endDate.toISOString().slice(0, 10)}{" "}
          <button
            className="ml-2 underline"
            onClick={() => setDateRange(null)}
            title="Clear popup range"
          >
            clear
          </button>
        </p>
      )}

      {status === "idle" && (
        <p className="text-sm text-gray-600">
          Select a start & end date or pick a date range.
        </p>
      )}
      {status === "loading" && <p className="text-sm">Loading…</p>}
      {status === "error" && (
        <p className="text-sm text-red-600">Error: {error}</p>
      )}
      {status === "empty" && (
        <p className="text-sm text-gray-600">No data for this window.</p>
      )}
      {status === "ready" && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">Time</th>
                <th className="py-2">BPM</th>
              </tr>
            </thead>
            <tbody>
              {points.map((p, i) => (
                <tr key={i} className="border-b">
                  <td className="py-1 pr-4">
                    {new Date(p.timestamp).toLocaleString()}
                  </td>
                  <td className="py-1">{p.bpm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Popup calendar overlay */}
      {showCalendar && (
        <div
          onClick={() => setShowCalendar(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <PopupCalendar
            onChange={handleCalendarChange}
            onClose={() => setShowCalendar(false)}
          />
        </div>
      )}
    </div>
  );
}
