const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// ==============================
// ROUTE IMPORTS
// ==============================
const authRoutes = require("./routes/auth");
const fitnessRoutes = require("./routes/fitness");
const progressRoutes = require("./routes/progress");
const expertRoutes = require("./routes/expert");
const workoutRoutes = require("./routes/workout");

// ==============================
// APP INIT
// ==============================
const app = express();

// ==============================
// MIDDLEWARE
// ==============================
app.use(express.json()); // Parse JSON request body
app.use(cors()); // Allow frontend access

// ==============================
// ENV VARIABLES
// ==============================
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// ==============================
// DATABASE CONNECTION
// ==============================
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) =>
    console.error("❌ MongoDB connection error:", err.message)
  );

// ==============================
// HEALTH CHECK
// ==============================
app.get("/", (req, res) => {
  res.send("AI Fitness API is running...");
});

// ==============================
// API ROUTES
// ==============================
app.use("/api/auth", authRoutes);      // Signup / Login
app.use("/api/fitness", fitnessRoutes); // Diet / Workout Plans
app.use("/api/progress", progressRoutes);
app.use("/api/expert", expertRoutes);   // Voice / AI Expert
app.use("/api/workout", workoutRoutes); // Workout + AI tracking

// ==============================
// GLOBAL ERROR HANDLER (SAFE)
// ==============================
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.stack);
  res.status(500).json({ msg: "Internal server error" });
});

// ==============================
// START SERVER
// ==============================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
