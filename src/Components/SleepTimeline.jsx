// src/Components/SleepTimeline.jsx
import React, { useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import moment from 'moment';

const stageMap = {
  1: { label: 'Deep',  color: '#00008B' },
  2: { label: 'Light', color: '#6495ED' },
  3: { label: 'REM',   color: '#ADD8E6' },
  4: { label: 'Awake', color: '#FF4D4F' }
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div style={{ background: 'black', color: 'white', padding: 8, borderRadius: 4 }}>
        {stageMap[d.stage].label} · {d.displayTime}
      </div>
    );
  }
  return null;
};

export default function SleepTimeline({ events = [] }) {
  // normalize events and add displayTime
  const data = useMemo(() => {
    return events
      .map(e => {
        const t = typeof e.time === 'number' ? e.time : +new Date(e.time);
        return { time: t, displayTime: moment(t).format('h:mm a'), stage: e.stage };
      })
      .sort((a,b) => a.time - b.time);
  }, [events]);

  // compute durations per stage (mins)
  const { stageDurations, totalMins, startTs, endTs } = useMemo(() => {
    const sd = {};
    for (let i = 0; i < data.length - 1; i++) {
      const mins = Math.max(0, Math.round((data[i + 1].time - data[i].time) / 60000));
      sd[data[i].stage] = (sd[data[i].stage] || 0) + mins;
    }
    const tot = Object.values(sd).reduce((a, b) => a + b, 0);
    return {
      stageDurations: sd,
      totalMins: tot,
      startTs: data[0]?.time ?? null,
      endTs: data[data.length - 1]?.time ?? null,
    };
  }, [data]);

  // ✅ Explicit X ticks so the axis always shows the left edge (start time)
  const xTicks = useMemo(() => {
    if (!startTs || !endTs || endTs <= startTs) return [];
    const N = 4; // start, 2 mids, end
    return Array.from({ length: N }, (_, i) =>
      Math.round(startTs + (i / (N - 1)) * (endTs - startTs))
    );
  }, [startTs, endTs]);

  // Console audit
  useEffect(() => {
    if (!data.length) return;
    console.groupCollapsed('%cSleepTimeline · audit', 'color:#4bd0cb;font-weight:bold;');
    console.log('Points:', data.length);
    console.log('Range :', new Date(startTs).toLocaleString(), '→', new Date(endTs).toLocaleString());
    const strictlyIncreasing = data.every((d, i) => i === 0 || d.time > data[i-1].time);
    console.log('Strictly increasing timestamps:', strictlyIncreasing);
    const rows = [1,2,3,4].map(code => {
      const mins = stageDurations[code] || 0;
      return {
        stage: `${code} · ${stageMap[code].label}`,
        minutes: mins,
        percent: totalMins ? Math.round((mins / totalMins) * 100) : 0
      };
    });
    console.table(rows);
    console.log('Total minutes:', totalMins);
    console.log('First stage at start:', stageMap[data[0].stage]?.label);
    console.groupEnd();
  }, [data, stageDurations, totalMins, startTs, endTs]);

  return (
    <div style={{ background: '#0f0f0f', padding: 20, borderRadius: 10, color: 'white' }}>
      <h2 style={{ margin: 0, marginBottom: 8 }}>Sleep Stages</h2>

      {/* header summary */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 10, flexWrap: 'wrap' }}>
        {[1,2,3,4].map(code => {
          const min = stageDurations[code] || 0;
          const pct = totalMins ? Math.round((min / totalMins) * 100) : 0;
          return (
            <div key={code} style={{ color: stageMap[code].color }}>
              <strong>{stageMap[code].label}</strong><br />
              {pct}% · {Math.floor(min / 60)}h {min % 60}m
            </div>
          );
        })}
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="sleepGradient" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%"   stopColor="#00008B" />
              <stop offset="33%"  stopColor="#6495ED" />
              <stop offset="66%"  stopColor="#ADD8E6" />
              <stop offset="100%" stopColor="#FF4D4F" />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="time"
            type="number"
            domain={['dataMin','dataMax']}
            ticks={xTicks}
            tickFormatter={t => moment(t).format('h:mm a')}
            tick={{ fill: 'white' }}
            padding={{ left: 0, right: 0 }}
          />
          <YAxis
            type="number"
            domain={[1,4]}
            ticks={[1,2,3,4]}
            tickFormatter={v => ({1:'Deep',2:'Light',3:'REM',4:'Awake'}[v])}
            tick={{ fill: 'white' }}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Stepped line for discrete stages */}
          <Line
            type="stepAfter"
            dataKey="stage"
            stroke="url(#sleepGradient)"
            strokeWidth={4}
            strokeLinecap="round"
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
