import { test } from "vitest";
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { signInWithEmailAndPassword, getAuth } from "firebase/auth";
import Login from "../Pages/Login";

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

const firestore = getFirestore();

test("renders", async () => {
  render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );
});

//  sign in with email and password
test("can login with email and password", async () => {
  const auth = getAuth();
  const email = "matthew@gmail.com";
  const password = "Passant1";

  await signInWithEmailAndPassword(auth, email, password);
  console.log("Login successful!");
});

// Sign in with correct email and incorrect password
test("login with correct email and incorrect password", async () => {
  const auth = getAuth();
  const email = "matthew@gmail.com";
  const password = "Passant";

  try {
    await signInWithEmailAndPassword(auth, email, password);
    console.error("Login unexpectedly succeeded with incorrect password");
  } catch (error) {
    console.log("Login failed with correct email and incorrect password");
  }
});

// Sign in with incorrect email and correct password
test("login with incorrect email and correct password", async () => {
  const auth = getAuth();
  const email = "atthew@gmail.com";
  const password = "Passant1";

  try {
    await signInWithEmailAndPassword(auth, email, password);
    console.error("Login unexpectedly succeeded with incorrect email");
  } catch (error) {
    console.log("Login failed with incorrect email and correct password");
  }
});
