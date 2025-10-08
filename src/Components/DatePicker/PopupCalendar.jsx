import React, { useState, useEffect } from "react";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const ranges = [
  "Yesterday",
  "Last 7 days",
  "Last 30 days",
  "Last month",
  "Last 60 days",
  "Last 90 days",
  "UTC"
];

// Helper to get days in month
function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

// Create a matrix for calendar dates of the month
function getCalendarMatrix(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = getDaysInMonth(year, month);
  const weeks = [];
  let currentDay = 1 - firstDay;

  for (let i = 0; i < 6; i++) { // max 6 weeks in month view
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

function Calendar({ year, month, selectedDates, onDateClick }) {
  const weeks = getCalendarMatrix(year, month);

  return (
    <div className="calendar">
      <div className="header" style={{ backgroundColor: "#f9a825" }}>
        <strong>
          {new Date(year, month).toLocaleString("default", { month: "long" })} {year}
        </strong>
      </div>
      <div className="weekdays">
        {WEEKDAYS.map((wd) => (
          <div key={wd} className="weekday">{wd}</div>
        ))}
      </div>
      <div className="days">
        {weeks.map((week, i) =>
          week.map((day, idx) => {
            if (day === null) {
              return <div key={`${i}-${idx}`} className="day empty"></div>;
            }
            const dateStr = `${year}-${(month + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
            const isSelected = selectedDates.has(dateStr);
            return (
              <div
                key={`${i}-${idx}`}
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

export default function PopupCalendar() {
  const today = new Date();
  const [leftMonth, setLeftMonth] = useState(today.getMonth());
  const [leftYear, setLeftYear] = useState(today.getFullYear());
  // Right month is always next month
  const [rightMonth, setRightMonth] = useState((today.getMonth() + 1) % 12);
  const [rightYear, setRightYear] = useState(
    today.getMonth() === 11 ? today.getFullYear() + 1 : today.getFullYear()
  );

  const [selectedDates, setSelectedDates] = useState(new Set());
  const [activeRange, setActiveRange] = useState(null);

  // When range changes, update selected dates accordingly
  useEffect(() => {
    let startDate, endDate;
    const now = new Date();

    switch (activeRange) {
      case "Yesterday":
        endDate = new Date(now);
        endDate.setDate(now.getDate() - 1);
        startDate = new Date(endDate);
        break;
      case "Last 7 days":
        endDate = new Date(now);
        endDate.setDate(now.getDate() - 1);
        startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 6);
        break;
      case "Last 30 days":
        endDate = new Date(now);
        endDate.setDate(now.getDate() - 1);
        startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 29);
        break;
      case "Last month":
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        startDate = lastMonth;
        endDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);
        break;
      case "Last 60 days":
        endDate = new Date(now);
        endDate.setDate(now.getDate() - 1);
        startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 59);
        break;
      case "Last 90 days":
        endDate = new Date(now);
        endDate.setDate(now.getDate() - 1);
        startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 89);
        break;
      case "UTC":
        // Maybe select all dates or clear selection, here clearing
        startDate = null;
        endDate = null;
        break;
      default:
        startDate = null;
        endDate = null;
    }

    if (startDate && endDate) {
      // build range dates set
      const datesSet = new Set();
      let curr = new Date(startDate);
      while (curr <= endDate) {
        const dateStr = `${curr.getFullYear()}-${(curr.getMonth() + 1)
          .toString()
          .padStart(2, "0")}-${curr.getDate().toString().padStart(2, "0")}`;
        datesSet.add(dateStr);
        curr.setDate(curr.getDate() + 1);
      }
      setSelectedDates(datesSet);

      // adjust months shown
      setLeftYear(startDate.getFullYear());
      setLeftMonth(startDate.getMonth());
      const rightMonthTemp = (startDate.getMonth() + 1) % 12;
      setRightMonth(rightMonthTemp);
      setRightYear(rightMonthTemp === 0 ? startDate.getFullYear() + 1 : startDate.getFullYear());
    } else {
      setSelectedDates(new Set());
    }
  }, [activeRange]);

  function handleDateClick(dateStr) {
    const newSelected = new Set(selectedDates);
    if (selectedDates.has(dateStr)) {
      newSelected.delete(dateStr);
    } else {
      newSelected.add(dateStr);
      setActiveRange(null); // clear quick selection when user picks manually
    }
    setSelectedDates(newSelected);
  }

  function prevMonth() {
    // decrement left month
    let newLeftMonth = leftMonth - 1;
    let newLeftYear = leftYear;
    if (newLeftMonth < 0) {
      newLeftMonth = 11;
      newLeftYear -= 1;
    }
    setLeftMonth(newLeftMonth);
    setLeftYear(newLeftYear);

    // right month = left +1
    let newRightMonth = (newLeftMonth + 1) % 12;
    let newRightYear = newLeftMonth === 11 ? newLeftYear + 1 : newLeftYear;
    setRightMonth(newRightMonth);
    setRightYear(newRightYear);
  }

  function nextMonth() {
    // increment left month
    let newLeftMonth = leftMonth + 1;
    let newLeftYear = leftYear;
    if (newLeftMonth > 11) {
      newLeftMonth = 0;
      newLeftYear += 1;
    }
    setLeftMonth(newLeftMonth);
    setLeftYear(newLeftYear);

    // right month = left +1
    let newRightMonth = (newLeftMonth + 1) % 12;
    let newRightYear = newLeftMonth === 11 ? newLeftYear + 1 : newLeftYear;
    setRightMonth(newRightMonth);
    setRightYear(newRightYear);
  }

  function handleSave() {
    // Implement save logic here — e.g., send selected dates to parent or backend
    alert(`Saved dates:\n${[...selectedDates].join(", ")}`);
  }

  function handleCancel() {
    // Implement cancel logic here — e.g., close modal or revert changes
    alert("Cancelled");
  }

  return (
    <div className="popup-calendar-container">
      <div className="sidebar">
        {ranges.map((r) => (
          <div
            key={r}
            className={`range-item${activeRange === r ? " active" : ""}`}
            onClick={() => setActiveRange(r)}
          >
            {r}
          </div>
        ))}
      </div>

      <div className="calendars">
        <div className="nav-header">
          <button onClick={prevMonth} className="nav-btn">{`<`}</button>
          <div style={{ width: "100%" }} />
          <button onClick={nextMonth} className="nav-btn">{`>`}</button>
        </div>
        <div className="calendars-row">
          <Calendar
            year={leftYear}
            month={leftMonth}
            selectedDates={selectedDates}
            onDateClick={handleDateClick}
          />
          <Calendar
            year={rightYear}
            month={rightMonth}
            selectedDates={selectedDates}
            onDateClick={handleDateClick}
          />
        </div>

        <div className="action-buttons">
          <button onClick={handleCancel} className="cancel-btn">
            Cancel
          </button>
          <button onClick={handleSave} className="save-btn">
            Save
          </button>
        </div>
      </div>

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