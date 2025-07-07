// src/__tests__/routes.test.jsx
import { test } from "vitest";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

test("can login with email and print user role and redirect", async () => {
  const auth = getAuth(app);
  const email = "dustin@gmail.com"; // Ensure this email is registered in your Firebase Auth
  const password = "Passant1"; // Make sure this password is correct for the email

  try {
    // Sign in the user
    await signInWithEmailAndPassword(auth, email, password);
    console.log("Login successful!");

    // Get the current user
    const user = auth.currentUser;

    // Check if the user is logged in
    if (user) {
      // Fetch user role from Firestore Users collection
      const userDoc = await getDoc(doc(db, "Users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userRole = userData.role; // Get the user's role
        console.log("User Role:", userRole); // Print user's role

        // Determine redirect page based on user role
        let redirectPage;
        switch (userRole) {
          case "admin":
            redirectPage = "/admin";
            break;
          case "athlete":
            redirectPage = "/athlete";
            break;
          case "coach":
            redirectPage = "/coach";
            break;
          default:
            redirectPage = "/";
            break;
        }

        console.log("Redirecting to:", redirectPage); // Print redirect destination
      } else {
        console.log("No user document found!");
      }
    } else {
      console.log("No user is logged in.");
    }
  } catch (error) {
    console.error("Login failed: ", error.message);
  }
});
