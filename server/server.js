const cors = require("cors");
const express = require("express");
const admin = require("firebase-admin");
const app = express();
const port = 3000;

// Firebase Admin account key
//const serviceAccount = require("./firebas.json");
const serviceAccount = require("./firebase-service-account-prototype.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

// Update user role
app.post("/updateRole", async (req, res) => {
  const { email, newRole } = req.body;
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    const uid = userRecord.uid;
    const db = admin.firestore();
    const userRef = db.collection("Users").doc(uid);

    await userRef.set({ role: newRole }, { merge: true });

    res.json({ success: true, message: `Role updated for ${email}` });
  } catch (error) {
    console.error("Error updating role:", error);
    res
      .status(500)
      .json({ success: false, message: `Server error: ${error.message}` });
  }
});

// Fetch authorized athletes for a coach
app.get("/getUsers", async (req, res) => {
  const coachId = req.query.coachId; // e.g., passed as ?coachId=123abc

  if (!coachId) {
    return res.status(400).json({ success: false, message: "Missing coachId" });
  }

  try {
    const db = admin.firestore();
    const coachRef = db.collection("Users").doc(coachId);
    const coachDoc = await coachRef.get();

    if (!coachDoc.exists) {
      return res.status(404).json({ success: false, message: "Coach not found" });
    }

    const coachData = coachDoc.data();
    const authorizedAthletes = coachData.authorizedAthletes || [];

    if (!authorizedAthletes.length) {
      return res.json({ success: true, users: [] }); // No athletes authorized
    }

    const users = [];

    for (const athleteRef of authorizedAthletes) {
      try {
        const athleteDoc = await athleteRef.get();
        if (!athleteDoc.exists) continue;

        const athleteData = athleteDoc.data();
        const userRecord = await admin.auth().getUser(athleteDoc.id);

        const [firstName, lastName] = userRecord.displayName
          ? userRecord.displayName.split(" ")
          : ["", ""];

        users.push({
          id: athleteDoc.id,
          firstName,
          lastName,
          email: userRecord.email,
          sports: athleteData.sports || "N/A",
          role: athleteData.role || "athlete", // fallback
        });
      } catch (err) {
        console.warn("Skipping athlete due to error:", err.message);
        continue;
      }
    }

    return res.json({ success: true, users });
  } catch (error) {
    console.error("Error fetching authorized athletes:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});
// Fetch all users
// app.get("/getUsers", async (req, res) => {
//   try {
//     const db = admin.firestore();
//     const usersRef = db.collection("Users");
//     const snapshot = await usersRef.get();

//     let users = [];
//     for (const doc of snapshot.docs) {
//       let userData = doc.data();
//       if (userData.role) {
//         userData.id = doc.id;

//         try {
//           const userRecord = await admin.auth().getUser(doc.id);
//           const [firstName, lastName] = userRecord.displayName
//             ? userRecord.displayName.split(" ")
//             : ["", ""];
//           userData.firstName = firstName || "";
//           userData.lastName = lastName || "";
//           userData.email = userRecord.email;
//           userData.sports = userData.sports || "N/A";
//         } catch (authError) {
//           console.error(
//             `Error fetching auth details for user ${doc.id}:`,
//             authError
//           );
//           continue;
//         }

//         users.push(userData);
//       }
//     }

//     res.json({ success: true, users });
//   } catch (error) {
//     console.error("Error fetching users:", error);
//     res
//       .status(500)
//       .json({ success: false, message: `Server error: ${error.message}` });
//   }
// });

// Player's Heart Rate Graph
app.get("/getHeartRate", async (req, res) => {
  const { userId } = req.query; 

  try {
    const db = admin.firestore();

    // Fetch HeartRateDataHC subcollection info
    const heartRateRef = db
      .collection("Users")
      .doc(userId)
      .collection("HeartRateDataHC");

    const snapshot = await heartRateRef.get();

    // Check if any heart data exists 
    if (snapshot.empty) {
      return res
        .status(404)
        .json({ success: false, message: "No heart rate data found" });
    }

    // heart rate data 
    let heartRateData = [];
    snapshot.forEach((doc) => {
      heartRateData.push(doc.data()); 
    });

    // Send the data back as a JSON response
    res.json({ success: true, heartRateData });
  } catch (error) {
    console.error("Error fetching heart rate data:", error);
    res
      .status(500)
      .json({ success: false, message: `Server error: ${error.message}` });
  }
});

// Player's Sleep Rate Graph
app.get("/getSleepData", async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ success: false, message: "Missing userId" });
  }

  try {
    const db = admin.firestore();

    const sleepDataRef = db
      .collection("Users")
      .doc(userId)
      .collection("SleepDataHC");

    const snapshot = await sleepDataRef.get();

    if (snapshot.empty) {
      return res.status(404).json({ success: false, message: "No sleep data found" });
    }

    // Gather all valid sleep entries
    const allSleepData = snapshot.docs
      .map(doc => doc.data())
      .filter(entry => entry.startTime && entry.endTime);

    if (allSleepData.length === 0) {
      return res.status(404).json({ success: false, message: "No valid sleep entries" });
    }

    // Sort by latest endTime
    allSleepData.sort((a, b) => new Date(b.endTime) - new Date(a.endTime));
    const latestEnd = new Date(allSleepData[0].endTime);
    const targetDate = latestEnd.toISOString().split("T")[0]; // YYYY-MM-DD

    // Get all entries from that same night
    const latestSleepData = allSleepData.filter(entry => {
      const entryEndDate = new Date(entry.endTime).toISOString().split("T")[0];
      return entryEndDate === targetDate;
    });

    if (latestSleepData.length === 0) {
      return res.status(404).json({ success: false, message: "No recent sleep session found" });
    }

    return res.json({ success: true, sleepData: latestSleepData });
  } catch (error) {
    console.error("Error fetching sleep data:", error);
    return res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
});

// app.get("/getSleepData", async (req, res) => {
//   const { userId } = req.query; 
//   //const targetDate = "2024-07-03";
//   //const targetDate = req.query.date;

//   try {
//     const db = admin.firestore();

//     //  SleepDataHC subcollection info
//     const sleepDataRef = db
//       .collection("Users")
//       .doc(userId)
//       .collection("SleepDataHC");

//     const snapshot = await sleepDataRef.get();

//     // Check if any sleep data exists 
//     if (snapshot.empty) {
//       return res
//         .status(404)
//         .json({ success: false, message: "No sleep data found" });
//     }

//     // Sleep Data Collection
//     let allSleepData = [];
//     snapshot.forEach((doc) => {
//       const data = doc.data();
//       if (data.startTime && data.endTime) {
//         allSleepData.push(data);
//       }
//     });

//     // Sort by endTime descending to get the most recent session
//     allSleepData.sort((a, b) => new Date(b.endTime) - new Date(a.endTime));

//     if (allSleepData.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "No valid sleep data found",
//       });
//     }

//     // Get the latest sleep session’s end date
//     const latestEndDate = new Date(allSleepData[0].endTime).toISOString().split("T")[0];

//     // Filter entries from the same night
//     const latestSleepData = allSleepData.filter((entry) => {
//       const entryDate = new Date(entry.endTime).toISOString().split("T")[0];
//       return entryDate === latestEndDate;
//     });

//     if (latestSleepData.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "No recent sleep session found",
//       });
//     }

//     // ✅ Send back the most recent full sleep session
//     res.json({ success: true, sleepData: latestSleepData });

//     // let sleepData = [];
//     // snapshot.forEach((doc) => {
//     //   const data = doc.data();
//     //   const startDate = new Date(data.startTime).toISOString().split("T")[0];

//     //   // Only include entries from the target date
//     //   // if (startDate === targetDate) {
//     //   //   sleepData.push(data);
//     //   // }
//     // });

//     // If no sleep data found 
//     if (sleepData.length === 0) {
//       return res
//         .status(404)
//         .json({
//           success: false,
//           message: "No sleep data found for the target date",
//         });
//     }

//     // Send the data back as a JSON response
//     res.json({ success: true, sleepData });
//   } catch (error) {
//     console.error("Error fetching sleep data:", error);
//     res
//       .status(500)
//       .json({ success: false, message: `Server error: ${error.message}` });
//   }
// });

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
