const cors = require("cors");
const express = require("express");
const admin = require("firebase-admin");
const app = express();
const port = 3000;

// Initialize Firebase Admin with the service account key
const serviceAccount = require("./firebas.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

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

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
