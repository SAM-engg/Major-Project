const axios = require("axios");

exports.startWorkout = async (req, res) => {
  try {
    return res.json({
      message: "Workout started successfully",
      aiService: "Pose estimation service ready",
    });
  } catch (error) {
    console.error("Workout start error:", error.message);
    res.status(500).json({ error: "Failed to start workout" });
  }
};
