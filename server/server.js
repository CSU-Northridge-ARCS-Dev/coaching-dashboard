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

// Fetch all users
app.get("/getUsers", async (req, res) => {
  try {
    const db = admin.firestore();
    const usersRef = db.collection("Users");
    const snapshot = await usersRef.get();

    let users = [];
    for (const doc of snapshot.docs) {
      let userData = doc.data();
      if (userData.role) {
        userData.id = doc.id;

        try {
          const userRecord = await admin.auth().getUser(doc.id);
          const [firstName, lastName] = userRecord.displayName
            ? userRecord.displayName.split(" ")
            : ["", ""];
          userData.firstName = firstName || "";
          userData.lastName = lastName || "";
          userData.email = userRecord.email;
          userData.sports = userData.sports || "N/A";
        } catch (authError) {
          console.error(
            `Error fetching auth details for user ${doc.id}:`,
            authError
          );
          continue;
        }

        users.push(userData);
      }
    }

    res.json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res
      .status(500)
      .json({ success: false, message: `Server error: ${error.message}` });
  }
});

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
  //const targetDate = "2024-07-03";
  const targetDate = req.query.date;

  try {
    const db = admin.firestore();

    //  SleepDataHC subcollection info
    const sleepDataRef = db
      .collection("Users")
      .doc(userId)
      .collection("SleepDataHC");

    const snapshot = await sleepDataRef.get();

    // Check if any sleep data exists 
    if (snapshot.empty) {
      return res
        .status(404)
        .json({ success: false, message: "No sleep data found" });
    }

    // Sleep Data Collection
    let sleepData = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      const startDate = new Date(data.startTime).toISOString().split("T")[0];

      // Only include entries from the target date
      if (startDate === targetDate) {
        sleepData.push(data);
      }
    });

    // If no sleep data found 
    if (sleepData.length === 0) {
      return res
        .status(404)
        .json({
          success: false,
          message: "No sleep data found for the target date",
        });
    }

    // Send the data back as a JSON response
    res.json({ success: true, sleepData });
  } catch (error) {
    console.error("Error fetching sleep data:", error);
    res
      .status(500)
      .json({ success: false, message: `Server error: ${error.message}` });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
