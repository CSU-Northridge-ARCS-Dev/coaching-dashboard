import React, { useEffect, useMemo, useState } from "react";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const RANGES = [
  "Yesterday",
  "Last 7 days",
  "Last 30 days",
  "Last month",
  "Last 60 days",
  "Last 90 days",
  "UTC",
];

// ---------- helpers ----------
function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

// Create a 6x7 matrix for the given month
function getCalendarMatrix(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = getDaysInMonth(year, month);
  const weeks = [];
  let currentDay = 1 - firstDay;

  for (let i = 0; i < 6; i++) {
    const week = [];
    for (let j = 0; j < 7; j++) {
      if (currentDay < 1 || currentDay > daysInMonth) {
        week.push(null);
      } else {
        week.push(currentDay);
      }
      currentDay++;
    }
    weeks.push(week);
  }
  return weeks;
}

const toDateStrUTC = (d) => {
  // Normalize to UTC date string YYYY-MM-DD (no mutation of original Date)
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const fromDateStrUTC = (str) => new Date(`${str}T00:00:00Z`);

function buildRangeSet(startDate, endDate) {
  const s = new Set();
  const start = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate()));
  const end = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate()));
  for (let d = start; d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    s.add(toDateStrUTC(d));
  }
  return s;
}

// ---------- sub calendar ----------
function Calendar({ year, month, selectedDates, onDateClick }) {
  const weeks = useMemo(() => getCalendarMatrix(year, month), [year, month]);

  return (
    <div className="calendar">
      <div className="header" style={{ backgroundColor: "#f9a825" }}>
        <strong>
          {new Date(year, month).toLocaleString("default", { month: "long" })} {year}
        </strong>
      </div>
      <div className="weekdays">
        {WEEKDAYS.map((wd) => (
          <div key={wd} className="weekday">
            {wd}
          </div>
        ))}
      </div>
      <div className="days">
        {weeks.map((week, i) =>
          week.map((day, idx) => {
            if (day === null) {
              return <div key={`${i}-${idx}`} className="day empty" />;
            }
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isSelected = selectedDates.has(dateStr);
            return (
              <div
                key={dateStr}
                className={`day${isSelected ? " selected" : ""}`}
                onClick={() => onDateClick(dateStr)}
              >
                {day}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ---------- main popup calendar ----------
export default function PopupCalendar({ onClose, onChange }) {
  const today = useMemo(() => {
    const t = new Date();
    return new Date(Date.UTC(t.getFullYear(), t.getMonth(), t.getDate()));
  }, []);

  // Left month starts at "today", right is next month
  const [leftMonth, setLeftMonth] = useState(today.getUTCMonth());
  const [leftYear, setLeftYear] = useState(today.getUTCFullYear());
  const [rightMonth, setRightMonth] = useState((today.getUTCMonth() + 1) % 12);
  const [rightYear, setRightYear] = useState(
    today.getUTCMonth() === 11 ? today.getUTCFullYear() + 1 : today.getUTCFullYear()
  );

  // Selection state
  const [selectedDates, setSelectedDates] = useState(() => new Set());
  const [activeRange, setActiveRange] = useState(null); // start with no preset
  const [anchorDate, setAnchorDate] = useState(null); // first click (YYYY-MM-DD)

  // Apply preset ranges when activeRange changes
  useEffect(() => {
    if (!activeRange) return;

    const now = new Date(); // local clock, but we convert via UTC strings
    const end = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() - 1));
    let start = null;

    switch (activeRange) {
      case "Yesterday": {
        start = new Date(end);
        break;
      }
      case "Last 7 days": {
        start = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate() - 6));
        break;
      }
      case "Last 30 days": {
        start = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate() - 29));
        break;
      }
      case "Last month": {
        const lmFirst = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - 1, 1));
        const lmLast = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 0));
        start = lmFirst;
        // override end to last month’s end
        const set = buildRangeSet(start, lmLast);
        setSelectedDates(set);
        // snap visible months to start
        setLeftYear(lmFirst.getUTCFullYear());
        setLeftMonth(lmFirst.getUTCMonth());
        const rm = (lmFirst.getUTCMonth() + 1) % 12;
        setRightMonth(rm);
        setRightYear(rm === 0 ? lmFirst.getUTCFullYear() + 1 : lmFirst.getUTCFullYear());
        setAnchorDate(null);
        return;
      }
      case "Last 60 days": {
        start = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate() - 59));
        break;
      }
      case "Last 90 days": {
        start = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate() - 89));
        break;
      }
      case "UTC": {
        // clear selection
        setSelectedDates(new Set());
        setAnchorDate(null);
        return;
      }
      default: {
        setSelectedDates(new Set());
        setAnchorDate(null);
        return;
      }
    }

    if (start) {
      const set = buildRangeSet(start, end);
      setSelectedDates(set);
      // snap visible months to start
      setLeftYear(start.getUTCFullYear());
      setLeftMonth(start.getUTCMonth());
      const rm = (start.getUTCMonth() + 1) % 12;
      setRightMonth(rm);
      setRightYear(rm === 0 ? start.getUTCFullYear() + 1 : start.getUTCFullYear());
      setAnchorDate(null);
    }
  }, [activeRange]);

  // 2-click selection logic
  function handleDateClick(dateStr) {
    setActiveRange(null); // manual selection clears presets
    if (!anchorDate) {
      setAnchorDate(dateStr);
      setSelectedDates(new Set([dateStr]));
      return;
    }
    const [a, b] = [anchorDate, dateStr].sort();
    const start = fromDateStrUTC(a);
    const end = fromDateStrUTC(b);
    const set = buildRangeSet(start, end);
    setSelectedDates(set);
    setAnchorDate(null);
  }

  // Save/Cancel (no alerts)
  function handleSave() {
    if (typeof onChange === "function" && selectedDates.size) {
      const sorted = [...selectedDates].sort();
      const startDate = new Date(`${sorted[0]}T00:00:00Z`);
      const endDate = new Date(`${sorted[sorted.length - 1]}T23:59:59Z`);
      onChange({ startDate, endDate });
    }
    onClose?.();
  }

  function handleCancel() {
    onClose?.();
  }

  // Month navigation (left controls both)
  function prevMonth() {
    let newLeftMonth = leftMonth - 1;
    let newLeftYear = leftYear;
    if (newLeftMonth < 0) {
      newLeftMonth = 11;
      newLeftYear -= 1;
    }
    setLeftMonth(newLeftMonth);
    setLeftYear(newLeftYear);

    const newRightMonth = (newLeftMonth + 1) % 12;
    const newRightYear = newLeftMonth === 11 ? newLeftYear + 1 : newLeftYear;
    setRightMonth(newRightMonth);
    setRightYear(newRightYear);
  }

  function nextMonth() {
    let newLeftMonth = leftMonth + 1;
    let newLeftYear = leftYear;
    if (newLeftMonth > 11) {
      newLeftMonth = 0;
      newLeftYear += 1;
    }
    setLeftMonth(newLeftMonth);
    setLeftYear(newLeftYear);

    const newRightMonth = (newLeftMonth + 1) % 12;
    const newRightYear = newLeftMonth === 11 ? newLeftYear + 1 : newLeftYear;
    setRightMonth(newRightMonth);
    setRightYear(newRightYear);
  }

  return (
    <div
      className="popup-calendar-container"
      role="dialog"
      aria-modal="true"
      aria-label="Select date range"
      onClick={(e) => e.stopPropagation()} // let parent overlay handle outside click
    >
      {/* Sidebar presets */}
      <div className="sidebar">
        {RANGES.map((r) => (
          <div
            key={r}
            className={`range-item${activeRange === r ? " active" : ""}`}
            onClick={() => setActiveRange(r)}
          >
            {r}
          </div>
        ))}
      </div>

      {/* Calendars + actions */}
      <div className="calendars">
        <div className="nav-header">
          <button onClick={prevMonth} className="nav-btn">
            {"<"}
          </button>
          <div style={{ width: "100%" }} />
          <button onClick={nextMonth} className="nav-btn">
            {">"}
          </button>
        </div>

        <div className="calendars-row">
          <Calendar year={leftYear} month={leftMonth} selectedDates={selectedDates} onDateClick={handleDateClick} />
          <Calendar year={rightYear} month={rightMonth} selectedDates={selectedDates} onDateClick={handleDateClick} />
        </div>

        <div className="action-buttons">
          <button onClick={handleCancel} className="cancel-btn">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="save-btn"
            disabled={!selectedDates.size}
            style={{ opacity: selectedDates.size ? 1 : 0.6, cursor: selectedDates.size ? "pointer" : "not-allowed" }}
          >
            Save
          </button>
        </div>
      </div>

      {/* styles */}
      <style>{`
        .popup-calendar-container {
          display: flex;
          font-family: Arial, sans-serif;
          border: 1px solid #ddd;
          border-radius: 8px;
          width: 700px;
          background: white;
          user-select: none;
        }
        .sidebar {
          width: 150px;
          border-right: 1px solid #ddd;
          padding: 10px;
          background-color: #f7f7f7;
        }
        .range-item {
          padding: 8px 10px;
          cursor: pointer;
          color: #555;
          border-radius: 4px;
        }
        .range-item:hover {
          background: #eee;
        }
        .range-item.active {
          background: #ddd;
          font-weight: bold;
          border-left: 4px solid #f9a825;
          color: #222;
        }
        .calendars {
          flex: 1;
          padding: 10px;
          display: flex;
          flex-direction: column;
        }
        .nav-header {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
        }
        .nav-btn {
          border: none;
          background: #f9a825;
          color: #222;
          font-size: 16px;
          font-weight: bold;
          padding: 4px 10px;
          border-radius: 4px;
          cursor: pointer;
        }
        .nav-btn:hover {
          background: #c79500;
        }
        .calendars-row {
          display: flex;
          gap: 20px;
          justify-content: center;
        }
        .calendar {
          width: 270px;
          border: 1px solid #ddd;
          border-radius: 6px;
        }
        .calendar .header {
          padding: 8px;
          text-align: center;
          color: #222;
          font-weight: bold;
        }
        .weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          background: #f0f0f0;
          padding: 4px 0;
          border-bottom: 1px solid #ddd;
          text-align: center;
          font-size: 12px;
          font-weight: 600;
          color: #777;
        }
        .weekday {
          font-weight: 600;
        }
        .days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          padding: 8px;
          gap: 6px;
          text-align: center;
          font-size: 14px;
        }
        .day {
          cursor: pointer;
          padding: 6px 0;
          border-radius: 4px;
          user-select: none;
          color: #222;
          transition: background-color 0.2s ease;
        }
        .day:hover {
          background-color: #eee;
        }
        .day.selected {
          background-color: #1976d2;
          color: white;
          font-weight: bold;
        }
        .day.empty {
          cursor: default;
          background: transparent;
        }
        .action-buttons {
          margin-top: 12px;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
        .cancel-btn {
          background: transparent;
          border: none;
          color: #1976d2;
          font-weight: 600;
          cursor: pointer;
          font-size: 14px;
        }
        .cancel-btn:hover {
          text-decoration: underline;
        }
        .save-btn {
          background-color: #1976d2;
          border: none;
          color: white;
          padding: 6px 16px;
          font-weight: 600;
          border-radius: 20px;
          cursor: pointer;
          font-size: 14px;
        }
        .save-btn:hover {
          background-color: #145a9c;
        }
      `}</style>
    </div>
  );
}