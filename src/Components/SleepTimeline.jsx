import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import moment from 'moment';

const stageMap = {
  1: { label: 'Deep',  color: '#00008B' },
  2: { label: 'Light', color: '#6495ED' },
  3: { label: 'REM',   color: '#ADD8E6' },
  4: { label: 'Awake', color: '#FF4D4F' }
};

const rawData = [
  { time: '2025-05-21T21:34:00.000Z', stage: 4 },
  { time: '2025-05-21T22:00:00.000Z', stage: 2 },
  { time: '2025-05-21T23:00:00.000Z', stage: 3 },
  { time: '2025-05-22T00:30:00.000Z', stage: 2 },
  { time: '2025-05-22T02:00:00.000Z', stage: 1 },
  { time: '2025-05-22T03:30:00.000Z', stage: 2 },
  { time: '2025-05-22T04:30:00.000Z', stage: 3 },
  { time: '2025-05-22T05:00:00.000Z', stage: 4 },
  { time: '2025-05-22T06:45:00.000Z', stage: 4 },
];

const data = rawData.map(e => ({
  time: moment(e.time).valueOf(),
  displayTime: moment(e.time).format('h:mm a'),
  stage: e.stage,
}));

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

export default function SleepTimeline() {
  // header summary (unchanged)
  const stageDurations = {};
  for (let i = 0; i < rawData.length - 1; i++) {
    const mins = moment(rawData[i + 1].time).diff(moment(rawData[i].time), 'minutes');
    stageDurations[rawData[i].stage] = (stageDurations[rawData[i].stage] || 0) + mins;
  }
  const total = Object.values(stageDurations).reduce((a, b) => a + b, 0);

  return (
    <div
      style={{
        background: '#0f0f0f',
        padding: 20,
        borderRadius: 10,
        color: 'white',
        height: '100%',
        boxSizing: 'border-box',
        display: 'flex',            // ✅ make vertical layout
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <h2 style={{ margin: 0, marginBottom: 8 }}>Sleep Stages</h2>

      <div style={{ display: 'flex', gap: 20, marginBottom: 10, flexWrap: 'wrap' }}>
        {/* ...summary blocks... */}
      </div>

      {/* ✅ chart gets the remaining space */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 30, left: 10, bottom: 28 }}  // ✅ space for X-axis
          >
            <defs>
              <linearGradient id="sleepGradient" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%"   stopColor={stageMap[1].color} />
                <stop offset="33%"  stopColor={stageMap[2].color} />
                <stop offset="66%"  stopColor={stageMap[3].color} />
                <stop offset="100%" stopColor={stageMap[4].color} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="time"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={t => moment(t).format('h:mm a')}
              tick={{ fill: 'white' }}
            />
            <YAxis
              type="number"
              domain={[1, 4]}
              ticks={[1, 2, 3, 4]}
              tickFormatter={(v) => stageMap[v]?.label ?? v}
              tick={{ fill: 'white' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
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
    </div>
  );
}
