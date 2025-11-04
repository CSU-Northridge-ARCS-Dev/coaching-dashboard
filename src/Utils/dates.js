// src/Utils/dates.js

// simple trailing-edge debounce
export function debounce(fn, wait = 500) {
  let t;
  return function debounced(...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

// YYYY-MM-DD → ISO UTC 00:00:00.000
export function toISOAtStartOfDay(yyyy_mm_dd) {
  if (!yyyy_mm_dd) return "";
  const d = new Date(`${yyyy_mm_dd}T00:00:00.000Z`);
  return isNaN(d) ? "" : d.toISOString();
}

// YYYY-MM-DD → ISO UTC 23:59:59.999
export function toISOAtEndOfDay(yyyy_mm_dd) {
  if (!yyyy_mm_dd) return "";
  const d = new Date(`${yyyy_mm_dd}T23:59:59.999Z`);
  return isNaN(d) ? "" : d.toISOString();
}

// validate start/end are present, valid, and start ≤ end
export function isValidDateOrder(start, end) {
  if (!start || !end) return false;
  const s = new Date(start);
  const e = new Date(end);
  return !isNaN(s) && !isNaN(e) && s <= e;
}

// helper for single-day queries used by Sleep
export function windowFromSingleDay(yyyy_mm_dd) {
  if (!yyyy_mm_dd) return ["", ""];
  return [toISOAtStartOfDay(yyyy_mm_dd), toISOAtEndOfDay(yyyy_mm_dd)];
}
