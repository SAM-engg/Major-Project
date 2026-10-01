const express = require("express");
const router = express.Router();
const { startWorkout } = require("../controllers/workoutController");

router.get("/start", startWorkout);

module.exports = router;
