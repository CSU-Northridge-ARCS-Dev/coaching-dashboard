import React, { useEffect, useMemo, useRef, useState } from "react";
import DateWindowPicker from "./DateWindowPicker";
import { debounce, windowFromSingleDay } from "../Utils/dates";
import { PopupCalendar } from "../Components/DatePicker";

export default function SleepTimelineNew({ userId }) {
  const [pick, setPick] = useState({ day: "" });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [sessions, setSessions] = useState([]);

  // Calendar state
  const [showCalendar, setShowCalendar] = useState(false);
  const [dateRange, setDateRange] = useState(null); // { startDate, endDate }

  // Allow query if we have a userId AND (a day OR a dateRange)
  const canQuery = useMemo(
    () => Boolean(userId && (pick.day || dateRange)),
    [userId, pick.day, dateRange]
  );

  const fetchData = async () => {
    if (!canQuery) return;
    setStatus("loading");
    setError("");

    let startISO, endISO;

    if (dateRange) {
      // Range from PopupCalendar
      startISO = dateRange.startDate.toISOString();
      endISO = dateRange.endDate.toISOString();
    } else {
      // Single day
      [startISO, endISO] = windowFromSingleDay(pick.day);
    }

    try {
      const url = `/api/sleep?userId=${encodeURIComponent(userId)}&start=${encodeURIComponent(
        startISO
      )}&end=${encodeURIComponent(endISO)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        setSessions([]);
        setStatus("empty");
      } else {
        setSessions(data);
        setStatus("ready");
      }
    } catch (e) {
      setError(e.message || "Failed to fetch sleep.");
      setStatus("error");
    }
  };

  const debouncedFetchRef = useRef(debounce(fetchData, 500));

  useEffect(() => {
    if (canQuery) debouncedFetchRef.current();
    else {
      setStatus("idle");
      setSessions([]);
    }
    // include dateRange so fetch runs when a range is chosen
  }, [pick.day, userId, canQuery, dateRange]);

  // Called by PopupCalendar when user hits Save
  function handleCalendarChange({ startDate, endDate }) {
    setDateRange({ startDate, endDate });
    // Note: keeping pick.day unchanged; range takes precedence when present.
  }

  return (
    <div className="p-4 border rounded-2xl shadow-sm space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="text-lg font-semibold">Sleep Timeline (New)</h3>

        <div className="flex items-center gap-2">
          {/* Existing single-day picker */}
          <DateWindowPicker mode="day" value={pick} onChange={setPick} />

          {/* Range picker trigger */}
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

      {/* Show currently selected range (if any) */}
      {dateRange && (
        <p className="text-xs text-gray-600">
          Range: {dateRange.startDate.toISOString().slice(0, 10)} →{" "}
          {dateRange.endDate.toISOString().slice(0, 10)}{" "}
          <button
            className="ml-2 underline"
            onClick={() => setDateRange(null)}
            title="Clear range"
          >
            clear
          </button>
        </p>
      )}

      {status === "idle" && <p className="text-sm text-gray-600">Choose a day or pick a date range.</p>}
      {status === "loading" && <p className="text-sm">Loading…</p>}
      {status === "error" && <p className="text-sm text-red-600">Error: {error}</p>}
      {status === "empty" && <p className="text-sm text-gray-600">No sleep sessions.</p>}
      {status === "ready" && (
        <div className="space-y-2">
          {sessions.map((s, i) => (
            <div key={i} className="border rounded-lg p-3">
              <div className="text-sm">
                <span className="font-medium">Start:</span>{" "}
                {new Date(s.start).toLocaleString()}
              </div>
              <div className="text-sm">
                <span className="font-medium">End:</span>{" "}
                {new Date(s.end).toLocaleString()}
              </div>
              <div className="text-sm">
                <span className="font-medium">Duration:</span>{" "}
                {Math.round((new Date(s.end) - new Date(s.start)) / 60000)} min
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Calendar overlay */}
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
            zIndex: 1000
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

