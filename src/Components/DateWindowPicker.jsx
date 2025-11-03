// src/Components/DateWindowPicker.jsx
import React from "react";

export default function DateWindowPicker({ mode = "range", value = {}, onChange }) {
  if (mode === "day") {
    const day = value.day || "";
    return (
      <input
        type="date"
        value={day}
        onChange={(e) => onChange({ day: e.target.value })}
        className="px-2 py-1 rounded border text-sm bg-white"
      />
    );
  }

  // mode === 'range'
  const start = value.start || "";
  const end = value.end || "";
  return (
    <div className="flex items-center gap-2">
      <input
        type="date"
        value={start}
        onChange={(e) => onChange({ ...value, start: e.target.value })}
        className="px-2 py-1 rounded border text-sm bg-white"
      />
      <span className="text-xs text-gray-500">→</span>
      <input
        type="date"
        value={end}
        onChange={(e) => onChange({ ...value, end: e.target.value })}
        className="px-2 py-1 rounded border text-sm bg-white"
      />
    </div>
  );
}
