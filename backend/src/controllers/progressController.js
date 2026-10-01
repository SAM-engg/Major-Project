const MealProgress   = require("../models/MealProgress");
const WorkoutHistory = require("../models/WorkoutHistory");

// =============================
// COMPLETE MEAL
// =============================
exports.completeMeal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { meal, calories } = req.body;

    const record = await MealProgress.create({ user: userId, meal, calories });
    res.json(record);

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Meal tracking failed" });
  }
};

// =============================
// COMPLETE WORKOUT
// =============================
exports.completeWorkout = async (req, res) => {
  try {
    const userId = req.user.id;
    const { workout } = req.body;

    const record = await WorkoutHistory.create({ user: userId, workout });
    res.json(record);

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Workout tracking failed" });
  }
};

// =============================
// GET TODAY CALORIES
// =============================
exports.getCalories = async (req, res) => {
  try {
    const userId = req.user.id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const meals = await MealProgress.find({
      user:      userId,
      createdAt: { $gte: today }
    });

    const total = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
    res.json({ total });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Calories fetch failed" });
  }
};

// =============================
// RESET TODAY'S PROGRESS
// Called when user changes goal, weight, or height
// =============================
exports.resetTodayProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Delete today's meal logs
    const deletedMeals = await MealProgress.deleteMany({
      user:      userId,
      createdAt: { $gte: today }
    });

    // Delete today's workout logs
    const deletedWorkouts = await WorkoutHistory.deleteMany({
      user:      userId,
      createdAt: { $gte: today }
    });

    console.log(`🔄 Progress reset — meals: ${deletedMeals.deletedCount}, workouts: ${deletedWorkouts.deletedCount}`);

    return res.json({
      msg:      "Today's progress reset successfully",
      meals:    deletedMeals.deletedCount,
      workouts: deletedWorkouts.deletedCount
    });

  } catch (err) {
    console.error("Reset progress error:", err);
    res.status(500).json({ msg: "Failed to reset progress" });
  }
};

// =============================
// GET WORKOUT HISTORY (last 10)
// =============================
exports.getWorkoutHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const history = await WorkoutHistory.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ history });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "History fetch failed" });
  }
};