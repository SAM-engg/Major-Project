const express = require("express");
const {
  getFitnessPlan,
  getDayWorkout,
  getDietPlan,
  regeneratePlan
} = require("../controllers/fitnessController");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/plan",         auth, getFitnessPlan);   // full 7-day plan
router.post("/day-workout", auth, getDayWorkout);    // specific day + muscle group
router.get("/diet",         auth, getDietPlan);      // diet plan (dedicated)
router.delete("/regenerate",auth, regeneratePlan);   // clear on goal change

module.exports = router;