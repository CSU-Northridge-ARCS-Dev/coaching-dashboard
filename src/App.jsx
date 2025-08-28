import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PermissionProvider } from "react-permission-role";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ProtectedRoute from "./Components/ProtectedRoute";
import Login from "./Pages/Login";
import Admin from "./Pages/Admin";
import AthleteDashboard from "./Pages/AthleteDashboard";
import CoachDashboard from "./Pages/CoachDashboard";
import AthleteInfo from "./Pages/AthleteInfo";
import HeartPage from "./Pages/HeartPage";
import SleepPage from "./Pages/SleepPage";
import Invitation from "./Pages/Invitation";
import PlayerInsights from "./Pages/PlayerInsights";
import "./style.css";


const App = () => {
  return (
    <BrowserRouter>
      <PermissionProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/athlete"
            element={
              <ProtectedRoute requiredRole="athlete">
                <AthleteDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coach"
            element={
              <ProtectedRoute requiredRole="coach">
                <CoachDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/heart"
            element={
              <ProtectedRoute requiredRole="athlete">
                <HeartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sleep"
            element={
              <ProtectedRoute requiredRole="athlete">
                <SleepPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/info"
            element={
              <ProtectedRoute requiredRole="coach">
                <AthleteInfo />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invitation"
            element={
              <ProtectedRoute requiredRole="coach">
                <Invitation />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/insights" 
            element={
            <PlayerInsights />} />
          </Routes>
      </PermissionProvider>
    </BrowserRouter>
  );
};

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);
root.render(<App />);
