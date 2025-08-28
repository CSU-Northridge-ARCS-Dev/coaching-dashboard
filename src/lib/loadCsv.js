import Papa from "papaparse";

/**
 * Load a CSV (served from /public) and return an array of row objects.
 * No JSX, no fancy quotes, no BOM — keep this file plain JS.
 */
export async function loadCsv(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch " + url + ": " + res.status);
  }
  const text = await res.text();

  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (r) => resolve(r.data),
      error: (err) => reject(err),
    });
  });
}
