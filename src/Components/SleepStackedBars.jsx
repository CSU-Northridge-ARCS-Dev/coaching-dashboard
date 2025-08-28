import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from "recharts";

export default function SleepStackedBars({ nights = [], limit = 10 }) {
  const data = nights.slice(-limit).map(n => ({
    night: n.night,
    Deep: n.deep,
    Core: n.core,
    REM: n.rem,
    Awake: n.awake,
  }));

  const fmtPct = (v) => `${Math.round(v)}%`;

  return (
    <div className="tw-bg-[var(--sidebar-bg)] tw-border tw-border-[var(--border)] tw-rounded-xl tw-shadow-sm tw-p-4">
      <h3 className="tw-text-[var(--text)] tw-text-base tw-font-semibold tw-mb-2">
        Sleep Stages (last {Math.min(limit, nights.length)} nights)
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} stackOffset="expand">
          <XAxis dataKey="night" />
          <YAxis tickFormatter={fmtPct} />
          <Tooltip formatter={(v) => `${Math.round(v)}%`} />
          <Legend />
          <Bar dataKey="Deep"  stackId="1" />
          <Bar dataKey="Core"  stackId="1" />
          <Bar dataKey="REM"   stackId="1" />
          <Bar dataKey="Awake" stackId="1" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
