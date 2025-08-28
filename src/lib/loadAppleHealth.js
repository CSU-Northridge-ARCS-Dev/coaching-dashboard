import { loadCsv } from "./loadCsv";

//const BASE = "/data/apple-health";
const BASE = `${import.meta.env.BASE_URL}data/apple-health`;
const num = (x) => (x === "" || x == null ? null : Number(x));

export async function loadAppleHealth() {
  const [
    vo2Raw,          // start, vo2
    vo2Weekly,       // week, n_samples, latest_start, vo2_week_value, vo2_week_mean
    rhrDaily,        // date, resting_hr, n
    rhrWeekly,       // week, ...
    sleepNightly,    // night, tst_min, inbed_min, efficiency_pct, deep_pct, core_pct, rem_pct, awake_pct
    sleepWeekly,     // week, nights, sleep_tst_mean_hr, ...
  ] = await Promise.all([
    loadCsv(`${BASE}/vo2_raw.csv`),
    loadCsv(`${BASE}/vo2_weekly.csv`),
    loadCsv(`${BASE}/resting_hr_daily.csv`),
    loadCsv(`${BASE}/resting_hr_weekly.csv`),
    loadCsv(`${BASE}/sleep_nightly.csv`),
    loadCsv(`${BASE}/sleep_weekly.csv`),
  ]);

  // VO₂ weekly = latest sample per ISO week (use for your chart)
  const vo2PointsWeekly = vo2Weekly
    .map(r => ({ x: r.latest_start, y: num(r.vo2_week_value) }))
    .filter(p => p.x && p.y != null);

  // VO₂ raw (keep if you also want every test)
  const vo2PointsRaw = vo2Raw
    .map(r => ({ x: r.start, y: num(r.vo2) }))
    .filter(p => p.x && p.y != null);

  // HeartGraph wants [{ time, beatsPerMinute }]
  // We have daily resting HR; pin each at noon UTC so it plots on a timeline.
  const rhrDailyPoints = rhrDaily
    .map(r => ({ time: `${r.date}T12:00:00Z`, beatsPerMinute: num(r.resting_hr) }))
    .filter(p => p.beatsPerMinute != null);

  // Sleep nightly % breakdown (for a quick stacked bar)
  const sleepNights = sleepNightly.map(r => ({
    night: r.night,
    deep:  num(r.deep_pct)  ?? 0,
    core:  num(r.core_pct)  ?? 0,
    rem:   num(r.rem_pct)   ?? 0,
    awake: num(r.awake_pct) ?? 0,
    efficiency: num(r.efficiency_pct),
    tstMin: num(r.tst_min),
  }));

  return {
    // raw CSVs
    vo2Raw, vo2Weekly, rhrDaily, rhrWeekly, sleepNightly, sleepWeekly,
    // chart-ready
    vo2PointsWeekly,
    vo2PointsRaw,
    rhrDailyPoints,
    sleepNights,
  };
}

