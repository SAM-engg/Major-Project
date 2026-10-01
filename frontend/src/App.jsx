import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import Logout from "./components/Auth/Logout";

import Dashboard from "./components/Dashboard/Dashboard";
import Workout from "./components/Workout/Workout";
import DietPlan from "./components/Dashboard/DietPlan";
import VoiceExpert from "./components/Dashboard/VoiceExpert";
import WorkoutPlan from "./components/Dashboard/WorkoutPlan";
import Chatbot from "./components/Dashboard/Chatbot";
import History from "./components/Dashboard/History";
import Profile from "./components/Dashboard/Profile";
import WhyChooseUs from "./components/Dashboard/WhyChooseUs";
import DemoPage from "./components/Dashboard/DemoPage";

import ProtectedRoute from "./components/Common/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* =======================
          PUBLIC ROUTES
      ======================= */}

      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/logout" element={<Logout />} />

      {/* =======================
          PROTECTED ROUTES
      ======================= */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/workout"
        element={
          <ProtectedRoute>
            <Workout />
          </ProtectedRoute>
        }
      />

      <Route
        path="/diet"
        element={
          <ProtectedRoute>
            <DietPlan />
          </ProtectedRoute>
        }
      />

      <Route
        path="/voice"
        element={
          <ProtectedRoute>
            <VoiceExpert />
          </ProtectedRoute>
        }
      />

      <Route
        path="/workout-plan"
        element={
          <ProtectedRoute>
            <WorkoutPlan />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

     <Route path="/why-fitai" element={<WhyChooseUs />} />
     <Route path="/demo" element={<DemoPage />} />

      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chatbot />
          </ProtectedRoute>
        }
      />

      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        }
      />

      {/* =======================
          FALLBACK
      ======================= */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
