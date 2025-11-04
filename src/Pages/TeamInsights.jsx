import React, { useEffect, useMemo, useState } from "react";
import { getAuth } from "firebase/auth";
import PopupCalendar from "../Components/DatePicker/PopupCalendar";
import HeartGraph from "../Components/HeartGraph"; // your existing component
import MultiHeartGraph from "../Components/Team/MultiHeartGraph.jsx";
import { toISOAtStartOfDay, toISOAtEndOfDay } from "../Components/../Utils/dates";
import Navbar from "../Components/Navbar";

export default function TeamInsights() {
  const coachId = getAuth().currentUser?.uid;
  const [athletes, setAthletes] = useState([]);           // [{id, firstName, lastName, email}]
  const [selected, setSelected] = useState([]);           // [athleteId]
  const [showCal, setShowCal] = useState(false);
  const [range, setRange] = useState(null);               // {startDate, endDate}
  const [mode, setMode] = useState("compare");            // "compare" | "team-overlay" | "team-grid" | "team-avg"
  const [series, setSeries] = useState([]);               // for overlay modes
  const [avg, setAvg] = useState([]);                     // for team-avg

  // load roster
  useEffect(() => {
    (async () => {
      if (!coachId) return;
      const res = await fetch(`/api/getUsers?coachId=${encodeURIComponent(coachId)}`);
      const json = await res.json();
      setAthletes(json.users || []);
    })();
  }, [coachId]);

  const athleteIds = useMemo(() => {
    if (mode === "team-overlay" || mode === "team-grid" || mode === "team-avg") {
      return (athletes || []).map(a => a.id);
    }
    return selected;
  }, [mode, selected, athletes]);

  const startISO = range ? toISOAtStartOfDay(range.startDate.toISOString().slice(0,10)) : "";
  const endISO   = range ? toISOAtEndOfDay(range.endDate.toISOString().slice(0,10))   : "";

  async function fetchTeam(modeKind) {
    if (!athleteIds?.length || !startISO || !endISO) return;

    const base = `/api/team/heart-rate?athleteIds=${encodeURIComponent(athleteIds.join(","))}&start=${encodeURIComponent(startISO)}&end=${encodeURIComponent(endISO)}`;
    if (modeKind === "team-avg") {
      const res = await fetch(base + "&mode=avg");
      const data = await res.json();
      setAvg(data.average || []);
      setSeries([]);
    } else {
      const res = await fetch(base + "&mode=overlay");
      const data = await res.json();
      setSeries(data.series || []);
      setAvg([]);
    }
  }

  // refetch when inputs change
  useEffect(() => {
    if (!startISO || !endISO) return;
    fetchTeam(mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, startISO, endISO, athleteIds.join(",")]);

  // calendar selection
  function handleCalendarChange({ startDate, endDate }) {
    setRange({ startDate, endDate });
  }

  return (
    <>
      <Navbar /> {/* <-- added */}
      <div className="tw-ml-64 tw-min-h-screen tw-bg-[#0b0e14] tw-text-white tw-p-6 space-y-6">
        <header className="tw-flex tw-flex-wrap tw-items-center tw-justify-between gap-4">
          <h1 className="tw-text-2xl tw-font-bold">Team Insights — Heart Rate</h1>
          <div className="tw-flex tw-items-center gap-2">
            {range && (
              <span className="tw-text-xs tw-opacity-70">
                {range.startDate.toISOString().slice(0, 10)} → {range.endDate.toISOString().slice(0, 10)}
                <button className="tw-underline tw-ml-2" onClick={() => setRange(null)}>
                  clear
                </button>
              </span>
            )}
            <button
              className="tw-px-3 tw-py-2 tw-rounded-md tw-border tw-bg-white tw-text-black hover:tw-bg-gray-50 tw-text-sm"
              onClick={() => setShowCal(true)}
            >
              Pick Date Range
            </button>
          </div>
        </header>

        {/* mode toggles */}
        <div className="tw-flex tw-flex-wrap tw-gap-2">
          <button
            className={`tw-px-3 tw-py-2 tw-rounded-md tw-text-sm ${mode === "compare" ? "tw-bg-blue-600" : "tw-bg-[#1F2A40]"}`}
            onClick={() => setMode("compare")}
            title="Overlay only the athletes you select below"
          >
            Compare selected
          </button>
          <button
            className={`tw-px-3 tw-py-2 tw-rounded-md tw-text-sm ${mode === "team-overlay" ? "tw-bg-blue-600" : "tw-bg-[#1F2A40]"}`}
            onClick={() => setMode("team-overlay")}
          >
            Entire team (overlay)
          </button>
          <button
            className={`tw-px-3 tw-py-2 tw-rounded-md tw-text-sm ${mode === "team-grid" ? "tw-bg-blue-600" : "tw-bg-[#1F2A40]"}`}
            onClick={() => setMode("team-grid")}
          >
            Entire team (grid)
          </button>
          <button
            className={`tw-px-3 tw-py-2 tw-rounded-md tw-text-sm ${mode === "team-avg" ? "tw-bg-blue-600" : "tw-bg-[#1F2A40]"}`}
            onClick={() => setMode("team-avg")}
            title="One line = team minute-average"
          >
            Team average
          </button>
        </div>

        {/* athlete multi-select */}
        <div className="tw-bg-[#111623] tw-rounded-xl tw-p-4">
          <div className="tw-text-sm tw-mb-2 tw-opacity-80">Athletes</div>
          <div className="tw-flex tw-flex-wrap tw-gap-2">
            {(athletes || []).map((a) => {
              const checked = selected.includes(a.id);
              return (
                <label
                  key={a.id}
                  className={`tw-cursor-pointer tw-px-3 tw-py-1 tw-rounded-full tw-border ${
                    checked ? "tw-bg-blue-600" : "tw-bg-[#1F2A40]"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="tw-mr-2"
                    disabled={mode !== "compare"}
                    checked={checked}
                    onChange={(e) => {
                      setSelected((prev) => {
                        if (e.target.checked) return [...prev, a.id];
                        return prev.filter((x) => x !== a.id);
                      });
                    }}
                  />
                  {a.firstName} {a.lastName}
                </label>
              );
            })}
          </div>
        </div>

        {!range && <p className="tw-text-sm tw-opacity-70">Pick a date range to load data.</p>}

        {range && mode !== "team-grid" && (series.length > 0 || avg.length > 0) && (
          <div className="tw-bg-[#111623] tw-rounded-xl tw-p-4">
            {mode === "team-avg" ? (
              <MultiHeartGraph title="Team Average (BPM)" average={avg} />
            ) : (
              <MultiHeartGraph
                title={mode === "compare" ? "Compare Selected Athletes" : "Entire Team (Overlay)"}
                series={series}
              />
            )}
          </div>
        )}

        {range && mode === "team-grid" && (
          <div className="tw-grid md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-4">
            {(athleteIds || []).map((id) => {
              const label = athletes.find((a) => a.id === id);
              return (
                <div key={id} className="tw-bg-[#111623] tw-rounded-xl tw-p-4">
                  <div className="tw-text-sm tw-mb-2 tw-opacity-80">
                    {label ? `${label.firstName} ${label.lastName}` : id}
                  </div>
                  <HeartGraph userId={id} startISO={startISO} endISO={endISO} />
                </div>
              );
            })}
          </div>
        )}

        {showCal && (
          <div
            onClick={() => setShowCal(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.35)",
              display: "grid",
              placeItems: "center",
              zIndex: 50, // sits above the left nav when open
            }}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <PopupCalendar onChange={handleCalendarChange} onClose={() => setShowCal(false)} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
