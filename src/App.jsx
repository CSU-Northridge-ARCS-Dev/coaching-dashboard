import React from "react";
import { createRoot } from "react-dom/client";
import Login from "./Pages/Login";
import Admin from "./Pages/Admin";
import AthleteDashboard from "./Pages/AthleteDashboard";
import CoachDashboard from "./Pages/CoachDashboard";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PermissionProvider } from "react-permission-role";
import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import "./style.css";
import ProtectedRoute from "./Components/ProtectedRoute"; 

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
const auth = getAuth(app);
const db = getFirestore(app);

const App = () => {
  return (
    <BrowserRouter>
      <PermissionProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin" redirectPath="/home">
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/athlete"
            element={
              <ProtectedRoute requiredRole="athlete" redirectPath="/home">
                <AthleteDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coach"
            element={
              <ProtectedRoute requiredRole="coach" redirectPath="/home">
                <CoachDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </PermissionProvider>
    </BrowserRouter>
  );
};

const rootElement = document.getElementById("root");
const root = createRoot(rootElement); 
root.render(<App />);
