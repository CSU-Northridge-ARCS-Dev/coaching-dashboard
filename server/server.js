// server/server.js
const cors = require("cors");
const express = require("express");
const admin = require("firebase-admin");

const app = express();
const port = 3000;

// --- firebase admin init ---
const serviceAccount = require("./firebase-service-account-prototype.json");
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
app.use(express.json());

// ------------------------------
// helpers
// ------------------------------
function toDate(v) {
  // accept Firestore Timestamp, { _seconds }, number ms, ISO string
  if (!v && v !== 0) return null;
  if (v instanceof admin.firestore.Timestamp) return v.toDate();
  if (typeof v === "object" && v._seconds) return new Date(v._seconds * 1000);
  if (typeof v === "number") return new Date(v);
  if (typeof v === "string") {
    const d = new Date(v);
    return isNaN(d) ? null : d;
  }
  return null;
}

function clampAndSort(arr, startISO, endISO, pick) {
  const start = startISO ? new Date(startISO) : null;
  const end = endISO ? new Date(endISO) : null;

  const okStart = start && !isNaN(start);
  const okEnd = end && !isNaN(end);
  const within = (d) => (!okStart || d >= start) && (!okEnd || d <= end);

  return arr
    .map(pick) // shape to { ts: Date, ... }
    .filter(Boolean)
    .filter((r) => r.ts && !isNaN(r.ts) && within(r.ts))
    .sort((a, b) => a.ts - b.ts);
}

// ------------------------------
// auth/roster endpoints (original)
// ------------------------------
app.post("/updateRole", async (req, res) => {
  const { email, newRole } = req.body;
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    const uid = userRecord.uid;
    await db.collection("Users").doc(uid).set({ role: newRole }, { merge: true });
    res.json({ success: true, message: `Role updated for ${email}` });
  } catch (error) {
    console.error("Error updating role:", error);
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
});

// coach’s authorized athletes (original)
app.get("/getUsers", async (req, res) => {
  const coachId = req.query.coachId;
  if (!coachId) return res.status(400).json({ success: false, message: "Missing coachId" });

  try {
    const coachDoc = await db.collection("Users").doc(coachId).get();
    if (!coachDoc.exists) return res.status(404).json({ success: false, message: "Coach not found" });

    const authorizedAthletes = coachDoc.data().authorizedAthletes || [];
    if (!authorizedAthletes.length) return res.json({ success: true, users: [] });

    const users = [];
    for (const athleteRef of authorizedAthletes) {
      try {
        const athleteDoc = await athleteRef.get();
        if (!athleteDoc.exists) continue;

        const athleteData = athleteDoc.data();
        const userRecord = await admin.auth().getUser(athleteDoc.id);
        const [firstName, lastName] = userRecord.displayName ? userRecord.displayName.split(" ") : ["", ""];

        users.push({
          id: athleteDoc.id,
          firstName,
          lastName,
          email: userRecord.email,
          sports: athleteData.sports || "N/A",
          role: athleteData.role || "athlete",
        });
      } catch (e) {
        console.warn("Skipping athlete due to error:", e.message);
      }
    }
    res.json({ success: true, users });
  } catch (error) {
    console.error("Error fetching authorized athletes:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ------------------------------
// NEW: calendar-driven data APIs (canonical)
// ------------------------------

// VO2 max (Hexoskin) — returns: [{ timestamp, vo2max }]
app.get("/api/vo2max", async (req, res) => {
  const { userId, start, end } = req.query;
  if (!userId) return res.status(400).json({ message: "Missing userId" });

  try {
    const snap = await db.collection("Users").doc(userId).collection("VO2MaxDataHX").get();
    if (snap.empty) return res.json([]);

    const rows = clampAndSort(snap.docs, start, end, (doc) => {
      const d = doc.data();
      const ts = toDate(d.timestamp);
      const val = d.value ?? d.vo2max ?? d.y;
      if (ts == null || val == null) return null;
      return { ts, timestamp: ts.toISOString(), vo2max: Number(val) };
    });

    res.json(rows.map(({ timestamp, vo2max }) => ({ timestamp, vo2max })));
  } catch (e) {
    console.error("VO2 error:", e);
    res.status(500).json({ message: e.message });
  }
});

// Heart rate — returns: [{ timestamp, bpm }]
app.get("/api/heart-rate", async (req, res) => {
  const { userId, start, end } = req.query;
  if (!userId) return res.status(400).json({ message: "Missing userId" });

  try {
    const snap = await db.collection("Users").doc(userId).collection("HeartRateDataHC").get();
    if (snap.empty) return res.json([]);

    const rows = clampAndSort(snap.docs, start, end, (doc) => {
      const d = doc.data();
      // possible shapes:
      // { time, beatsPerMinute }  OR  { timestamp, bpm }  OR  { x, y }
      const ts = toDate(d.time ?? d.timestamp ?? d.x);
      const bpm = d.beatsPerMinute ?? d.bpm ?? d.y;
      if (ts == null || bpm == null) return null;
      return { ts, timestamp: ts.toISOString(), bpm: Number(bpm) };
    });

    res.json(rows.map(({ timestamp, bpm }) => ({ timestamp, bpm })));
  } catch (e) {
    console.error("Heart rate error:", e);
    res.status(500).json({ message: e.message });
  }
});

// Sleep — returns raw intervals: [{ start, end, stage }]
app.get("/api/sleep", async (req, res) => {
  const { userId, start, end } = req.query;
  if (!userId) return res.status(400).json({ message: "Missing userId" });

  try {
    const snap = await db.collection("Users").doc(userId).collection("SleepDataHC").get();
    if (snap.empty) return res.json([]);

    const rows = clampAndSort(snap.docs, start, end, (doc) => {
      const d = doc.data();
      const s = toDate(d.startTime ?? d.start);
      const e = toDate(d.endTime ?? d.end);
      if (!s || !e) return null;

      // if start/end given, keep if [s,e] intersects [start,end]
      let keep = true;
      if (start || end) {
        const S = start ? new Date(start) : null;
        const E = end ? new Date(end) : null;
        if (S && E) keep = e >= S && s <= E;
      }
      if (!keep) return null;

      const stage = d.stage ?? d.sleepStage ?? d.phase ?? null;
      return {
        ts: s, // for sorting
        start: s.toISOString(),
        end: e.toISOString(),
        stage: stage == null ? null : Number(stage),
      };
    });

    res.json(rows.map(({ start, end, stage }) => ({ start, end, stage })));
  } catch (e) {
    console.error("Sleep error:", e);
    res.status(500).json({ message: e.message });
  }
});

// ==============================
// COMPAT ENDPOINT ALIASES (to match your frontend calls)
// ==============================

// alias: /api/getHeartRate  -> returns { heartRateData: [{ time, beatsPerMinute }] }
app.get("/api/getHeartRate", async (req, res) => {
  const { userId, start, end } = req.query;
  if (!userId) return res.status(400).json({ message: "Missing userId" });

  try {
    const snap = await db.collection("Users").doc(userId).collection("HeartRateDataHC").get();
    if (snap.empty) return res.json({ heartRateData: [] });

    const rows = clampAndSort(snap.docs, start, end, (doc) => {
      const d = doc.data();
      const ts = toDate(d.time ?? d.timestamp ?? d.x);
      const bpm = d.beatsPerMinute ?? d.bpm ?? d.y;
      if (ts == null || bpm == null) return null;
      return { ts, time: ts.toISOString(), beatsPerMinute: Number(bpm) };
    });

    res.json({ heartRateData: rows.map(({ time, beatsPerMinute }) => ({ time, beatsPerMinute })) });
  } catch (e) {
    console.error("Compat getHeartRate error:", e);
    res.status(500).json({ message: e.message });
  }
});

// alias: /api/getSleepData -> returns { sleepData: [{ startTime, endTime, stage }] }
app.get("/api/getSleepData", async (req, res) => {
  const { userId, start, end } = req.query;
  if (!userId) return res.status(400).json({ message: "Missing userId" });

  try {
    const snap = await db.collection("Users").doc(userId).collection("SleepDataHC").get();
    if (snap.empty) return res.json({ sleepData: [] });

    const rows = clampAndSort(snap.docs, start, end, (doc) => {
      const d = doc.data();
      const s = toDate(d.startTime ?? d.start);
      const e = toDate(d.endTime ?? d.end);
      if (!s || !e) return null;

      let keep = true;
      if (start || end) {
        const S = start ? new Date(start) : null;
        const E = end ? new Date(end) : null;
        if (S && E) keep = e >= S && s <= E;
      }
      if (!keep) return null;

      const stage = d.stage ?? d.sleepStage ?? d.phase ?? null;
      return {
        ts: s,
        startTime: s.toISOString(),
        endTime: e.toISOString(),
        stage: stage == null ? null : Number(stage),
      };
    });

    res.json({ sleepData: rows.map(({ startTime, endTime, stage }) => ({ startTime, endTime, stage })) });
  } catch (e) {
    console.error("Compat getSleepData error:", e);
    res.status(500).json({ message: e.message });
  }
});

// alias: /getVO2MaxData -> returns { data: [{ x, y }] } (for VO2MaxChart)
app.get("/getVO2MaxData", async (req, res) => {
  const { userId, start, end } = req.query;
  if (!userId) return res.status(400).json({ message: "Missing userId" });

  try {
    const snap = await db.collection("Users").doc(userId).collection("VO2MaxDataHX").get();
    if (snap.empty) return res.json({ data: [] });

    const rows = clampAndSort(snap.docs, start, end, (doc) => {
      const d = doc.data();
      const ts = toDate(d.timestamp);
      const val = d.value ?? d.vo2max ?? d.y;
      if (ts == null || val == null) return null;
      return { ts, x: ts.toISOString(), y: Number(val) };
    });

    res.json({ data: rows.map(({ x, y }) => ({ x, y })) });
  } catch (e) {
    console.error("Compat getVO2MaxData error:", e);
    res.status(500).json({ message: e.message });
  }
});

// alias: /api/updateRole -> same as /updateRole
app.post("/api/updateRole", async (req, res) => {
  const { email, newRole } = req.body;
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    const uid = userRecord.uid;
    await db.collection("Users").doc(uid).set({ role: newRole }, { merge: true });
    res.json({ success: true, message: `Role updated for ${email}` });
  } catch (error) {
    console.error("Error updating role:", error);
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
});

// alias: /api/getUsers
// - if coachId provided -> coach’s authorized athletes (same as /getUsers)
// - if coachId missing  -> ALL users (used by Admin panel)
app.get("/api/getUsers", async (req, res) => {
  const coachId = req.query.coachId;

  try {
    if (!coachId) {
      // admin roster: list all users in Users collection
      const usersCol = await db.collection("Users").get();
      const users = [];
      for (const d of usersCol.docs) {
        const udata = d.data();
        try {
          const userRecord = await admin.auth().getUser(d.id);
          const [firstName, lastName] = userRecord.displayName ? userRecord.displayName.split(" ") : ["", ""];
          users.push({
            id: d.id,
            firstName,
            lastName,
            email: userRecord.email,
            role: udata.role || "athlete",
            sports: udata.sports || "N/A",
          });
        } catch (e) {
          console.warn("Skipping user due to auth fetch error:", e.message);
        }
      }
      return res.json({ success: true, users });
    }

    // same logic as original /getUsers
    const coachDoc = await db.collection("Users").doc(coachId).get();
    if (!coachDoc.exists) return res.status(404).json({ success: false, message: "Coach not found" });

    const authorizedAthletes = coachDoc.data().authorizedAthletes || [];
    if (!authorizedAthletes.length) return res.json({ success: true, users: [] });

    const users = [];
    for (const athleteRef of authorizedAthletes) {
      try {
        const athleteDoc = await athleteRef.get();
        if (!athleteDoc.exists) continue;

        const athleteData = athleteDoc.data();
        const userRecord = await admin.auth().getUser(athleteDoc.id);
        const [firstName, lastName] = userRecord.displayName ? userRecord.displayName.split(" ") : ["", ""];

        users.push({
          id: athleteDoc.id,
          firstName,
          lastName,
          email: userRecord.email,
          sports: athleteData.sports || "N/A",
          role: athleteData.role || "athlete",
        });
      } catch (e) {
        console.warn("Skipping athlete due to error:", e.message);
      }
    }
    res.json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});



// ==============================
// TEAM ENDPOINTS
// ==============================

// helper: fetch one athlete's heart-rate rows in canonical shape
async function fetchAthleteHeartRows(db, userId, start, end) {
  const snap = await db.collection("Users").doc(userId).collection("HeartRateDataHC").get();
  if (snap.empty) return [];
  const rows = clampAndSort(snap.docs, start, end, (doc) => {
    const d = doc.data();
    const ts = toDate(d.time ?? d.timestamp ?? d.x);
    const bpm = d.beatsPerMinute ?? d.bpm ?? d.y;
    if (!ts || bpm == null) return null;
    return { ts, timestamp: ts.toISOString(), bpm: Number(bpm) };
  });
  return rows.map(({ timestamp, bpm }) => ({ timestamp, bpm }));
}

// GET /api/team/heart-rate?athleteIds=a,b,c&start=ISO&end=ISO&mode=overlay|grid|avg&label=displayName
// - overlay/grid: returns { series: [{ userId, label, data: [{timestamp,bpm}] }] }
// - avg:          returns { average: [{timestamp,bpm}] }  // naive 60s bin average across athletes present
app.get("/api/team/heart-rate", async (req, res) => {
  try {
    const { athleteIds = "", start, end, mode = "overlay" } = req.query;
    const ids = athleteIds.split(",").map(s => s.trim()).filter(Boolean);
    if (!ids.length) return res.status(400).json({ message: "Missing athleteIds" });

    // fetch display names (labels) from Firebase Auth (best-effort)
    const labels = {};
    await Promise.all(ids.map(async (id) => {
      try {
        const u = await admin.auth().getUser(id);
        labels[id] = u.displayName || u.email || id;
      } catch { labels[id] = id; }
    }));

    // fetch all series
    const perUser = await Promise.all(
      ids.map(async (id) => {
        const data = await fetchAthleteHeartRows(db, id, start, end);
        return { userId: id, label: labels[id], data };
      })
    );

    if (mode === "avg") {
      // very simple 60s bin averaging across all athletes
      const bin = (iso) => Math.floor(new Date(iso).getTime() / 60000) * 60000; // minute
      const buckets = new Map(); // key: ms, val: {sum, n}
      perUser.forEach(({ data }) => {
        data.forEach(({ timestamp, bpm }) => {
          const k = bin(timestamp);
          const v = buckets.get(k) || { sum: 0, n: 0 };
          v.sum += bpm; v.n += 1;
          buckets.set(k, v);
        });
      });
      const average = [...buckets.entries()]
        .sort((a,b)=>a[0]-b[0])
        .map(([ms, {sum, n}]) => ({ timestamp: new Date(ms).toISOString(), bpm: +(sum / n).toFixed(1) }));
      return res.json({ average });
    }

    // overlay or grid both return the same payload; the UI decides how to render
    return res.json({ series: perUser });
  } catch (e) {
    console.error("team/heart-rate error:", e);
    res.status(500).json({ message: e.message });
  }
});

// (pattern you can copy later)
// GET /api/team/vo2max?athleteIds=...&start=...&end=... -> { series: [{userId,label,data:[{timestamp,vo2max}]}] }
// GET /api/team/sleep?athleteIds=...&start=...&end=... -> { series: [{userId,label,data:[{start,end,stage}]}] }






// ------------------------------
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
