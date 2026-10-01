const User        = require("../models/User");
const FitnessPlan = require("../models/FitnessPlan");
const axios       = require("axios");

// ============================================================
// ✅ CHANGE MODEL HERE ONLY — affects entire file
// ============================================================
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const AI_MODEL       = "meta-llama/llama-3-8b-instruct";
// Other options: "meta-llama/llama-3-8b-instruct" | "mistralai/mistral-7b-instruct"

const callAI = async (prompt) => {
  const res = await axios.post(
    OPENROUTER_URL,
    {
      model:           AI_MODEL,
      messages:        [{ role: "user", content: prompt }],
      temperature:     0.4,
      response_format: { type: "json_object" }
    },
    {
      headers: {
        Authorization:  `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173",
        "X-Title":      "FitAI App"
      },
      timeout: 30000
    }
  );
  let content = res.data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty AI response");
  content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(content);
};

// ============================================================
// MUSCLE GROUP DESCRIPTIONS
// ============================================================
const MUSCLE_GROUPS = {
  "Full Body":        "full body compound movements",
  "Chest & Triceps":  "chest press, flyes, tricep dips, pushdowns",
  "Back & Biceps":    "pull-ups, rows, lat pulldowns, curls",
  "Shoulders & Arms": "shoulder press, lateral raises, bicep curls, triceps",
  "Legs & Glutes":    "squats, lunges, leg press, deadlifts, glute bridges",
  "Upper Body":       "upper body push and pull movements",
  "Lower Body":       "lower body compound and isolation movements",
  "Cardio & Core":    "HIIT cardio, abs, planks, mountain climbers",
  "Active Recovery":  "light stretching, yoga, mobility work"
};

// ============================================================
// GET / GENERATE FULL 7-DAY PLAN
// ============================================================
exports.getFitnessPlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const user   = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Return cached plan if valid
    const existingPlan = await FitnessPlan.findOne({ user: userId });
    if (
      existingPlan &&
      existingPlan.goal === user.fitnessGoal &&
      existingPlan.plan?.diet_plan &&
      existingPlan.plan?.workout_plan
    ) {
      console.log("✅ Returning saved plan from DB");
      return res.json({ aiPlan: existingPlan.plan });
    }

    // Delete stale plan
    if (existingPlan) {
      await FitnessPlan.findOneAndDelete({ user: userId });
      console.log("🗑️ Stale plan removed — regenerating");
    }

    console.log("🤖 Generating new AI plan...");

    const prompt = `
You are a professional certified fitness coach and nutritionist.

User Profile:
- Name: ${user.name}
- Height: ${user.height}cm
- Weight: ${user.weight}kg
- Age: ${user.age}
- Gender: ${user.gender}
- Fitness Goal: ${user.fitnessGoal}

Create a complete personalized 7-day workout and nutrition plan.
CRITICAL: Return ONLY valid JSON. No markdown, no backticks, no explanation.

{
  "workout_plan": {
    "day1": { "exercise": "Chest & Triceps", "focus": "Push Day", "exercises": ["Barbell Bench Press - 4 sets of 8-10 reps","Incline Dumbbell Press - 3 sets of 10-12 reps","Cable Flyes - 3 sets of 12-15 reps","Tricep Pushdowns - 3 sets of 12-15 reps"], "cardio": "10 min warm-up walk", "duration": "45-60 min", "calories_burn": "320" },
    "day2": { "exercise": "Back & Biceps",    "focus": "Pull Day",     "exercises": ["Exercise - sets x reps","Exercise - sets x reps","Exercise - sets x reps","Exercise - sets x reps"], "cardio": "...", "duration": "...", "calories_burn": "..." },
    "day3": { "exercise": "Legs & Glutes",    "focus": "Leg Day",      "exercises": ["Exercise - sets x reps","Exercise - sets x reps","Exercise - sets x reps","Exercise - sets x reps"], "cardio": "...", "duration": "...", "calories_burn": "..." },
    "day4": { "exercise": "Shoulders & Arms", "focus": "Shoulder Day", "exercises": ["Exercise - sets x reps","Exercise - sets x reps","Exercise - sets x reps","Exercise - sets x reps"], "cardio": "...", "duration": "...", "calories_burn": "..." },
    "day5": { "exercise": "Full Body HIIT",   "focus": "Cardio Day",   "exercises": ["Exercise - sets x reps","Exercise - sets x reps","Exercise - sets x reps","Exercise - sets x reps"], "cardio": "...", "duration": "...", "calories_burn": "..." },
    "day6": { "exercise": "Upper Body",       "focus": "Strength Day", "exercises": ["Exercise - sets x reps","Exercise - sets x reps","Exercise - sets x reps","Exercise - sets x reps"], "cardio": "...", "duration": "...", "calories_burn": "..." },
    "day7": { "exercise": "Active Recovery",  "focus": "Rest Day",     "exercises": ["Cat-Cow Stretch - 2 sets of 10 reps","Hip Flexor Stretch - 2 sets of 30s hold","Child Pose - 2 sets of 45s hold","Shoulder Rolls - 2 sets of 15 reps"], "cardio": "Light 20 min walk", "duration": "30 min", "calories_burn": "120" }
  },
  "diet_plan": {
    "breakfast": { "veg": "Specific veg meal with quantities", "nonveg": "Specific nonveg meal with quantities", "calories": "420", "protein": "28", "time": "7:00 AM" },
    "lunch":     { "veg": "Specific veg meal with quantities", "nonveg": "Specific nonveg meal with quantities", "calories": "650", "protein": "42", "time": "12:30 PM" },
    "dinner":    { "veg": "Specific veg meal with quantities", "nonveg": "Specific nonveg meal with quantities", "calories": "550", "protein": "38", "time": "7:00 PM" },
    "snacks":    { "veg": "Specific veg snack with quantities", "nonveg": "Specific nonveg snack with quantities", "calories": "220", "protein": "18", "time": "4:00 PM" }
  }
}

Rules:
- Make all exercises specific to goal: ${user.fitnessGoal} and weight: ${user.weight}kg
- Each exercise string: "Exercise Name - X sets of Y reps"
- All 7 days must have UNIQUE different exercises — no repetition
- Diet meals must have exact food names and gram quantities
`;

    let parsedPlan;
    try {
      parsedPlan = await callAI(prompt);
      if (!parsedPlan.workout_plan || !parsedPlan.diet_plan) {
        throw new Error("Missing workout_plan or diet_plan");
      }
      console.log("✅ AI plan generated successfully");
    } catch (aiErr) {
      console.error("❌ AI error:", aiErr.message);
      console.log("⚠️ Using fallback plan");
      parsedPlan = getFallbackPlan(user);
    }

    await FitnessPlan.findOneAndUpdate(
      { user: userId },
      { user: userId, goal: user.fitnessGoal, plan: parsedPlan, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    console.log("✅ Plan saved to DB");

    return res.json({ aiPlan: parsedPlan });

  } catch (err) {
    console.error("getFitnessPlan error:", err);
    return res.status(500).json({ msg: "Plan generation failed" });
  }
};

// ============================================================
// GET WORKOUT FOR SPECIFIC DAY + OPTIONAL MUSCLE GROUP
// ============================================================
exports.getDayWorkout = async (req, res) => {
  try {
    const userId = req.user.id;
    const { dayKey, muscleGroup } = req.body;

    const user = await User.findById(userId);
    const plan = await FitnessPlan.findOne({ user: userId });

    // Muscle group override — generate fresh workout
    if (muscleGroup && MUSCLE_GROUPS[muscleGroup]) {
      console.log(`🤖 Generating custom workout for: ${muscleGroup}`);

      const prompt = `
You are a certified fitness trainer.
User: ${user.weight}kg, ${user.height}cm, Goal: ${user.fitnessGoal}
Focus: ${muscleGroup} (${MUSCLE_GROUPS[muscleGroup]})

Return ONLY valid JSON. No markdown.
{
  "exercise": "${muscleGroup}",
  "focus": "3-4 word description",
  "exercises": [
    "Exercise 1 - 4 sets of 8-10 reps",
    "Exercise 2 - 3 sets of 10-12 reps",
    "Exercise 3 - 3 sets of 12-15 reps",
    "Exercise 4 - 3 sets of 10-12 reps",
    "Exercise 5 - 3 sets of 12 reps"
  ],
  "cardio": "Specific warm-up or finisher",
  "duration": "45-55 min",
  "calories_burn": "300",
  "tips": "One specific tip for this muscle group"
}
`;

      try {
        const workout = await callAI(prompt);
        return res.json({ workout });
      } catch (aiErr) {
        console.error("Custom workout AI error:", aiErr.message);
        // Return from saved plan as fallback
        const fallbackWorkout = plan?.plan?.workout_plan?.day1 || getFallbackPlan(user).workout_plan.day1;
        return res.json({ workout: fallbackWorkout });
      }
    }

    // No override — return day from saved plan
    if (!plan?.plan?.workout_plan) {
      return res.status(404).json({ msg: "No plan found. Reload dashboard." });
    }

    const workout = plan.plan.workout_plan[dayKey] || plan.plan.workout_plan["day1"];
    return res.json({ workout });

  } catch (err) {
    console.error("getDayWorkout error:", err);
    return res.status(500).json({ msg: "Failed to get day workout" });
  }
};

// ============================================================
// DIET PLAN — dedicated endpoint
// ============================================================
exports.getDietPlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const user   = await User.findById(userId);

    const existingPlan = await FitnessPlan.findOne({ user: userId });

    // Return cached if valid
    if (existingPlan?.plan?.diet_plan) {
      const diet       = existingPlan.plan.diet_plan;
      const hasContent = Object.values(diet).some(
        v => typeof v === "object" && (v.veg || v.nonveg)
      );
      if (hasContent) {
        console.log("✅ Returning cached diet plan");
        return res.json({ diet_plan: diet });
      }
    }

    console.log("🤖 Generating diet plan...");

    const calTarget = user.fitnessGoal?.toLowerCase().includes("fat")    ? "1800"
                    : user.fitnessGoal?.toLowerCase().includes("muscle") ? "2800" : "2200";

    const prompt = `
You are a certified sports nutritionist.
User: Weight ${user.weight}kg, Height ${user.height}cm, Age ${user.age}, Gender ${user.gender}
Goal: ${user.fitnessGoal}, Daily Calorie Target: ${calTarget} kcal

Return ONLY valid JSON. No markdown. No backticks.
{
  "breakfast": { "veg": "Exact meal with gram quantities", "nonveg": "Exact meal with gram quantities", "calories": "420", "protein": "28", "time": "7:00 AM" },
  "lunch":     { "veg": "Exact meal with gram quantities", "nonveg": "Exact meal with gram quantities", "calories": "650", "protein": "42", "time": "12:30 PM" },
  "dinner":    { "veg": "Exact meal with gram quantities", "nonveg": "Exact meal with gram quantities", "calories": "550", "protein": "38", "time": "7:00 PM" },
  "snacks":    { "veg": "Exact snack with gram quantities", "nonveg": "Exact snack with gram quantities", "calories": "220", "protein": "18", "time": "4:00 PM" }
}
`;

    let dietPlan;
    try {
      dietPlan = await callAI(prompt);
    } catch (aiErr) {
      console.error("Diet AI error:", aiErr.message);
      dietPlan = getFallbackPlan(user).diet_plan;
    }

    await FitnessPlan.findOneAndUpdate(
      { user: userId },
      { $set: { "plan.diet_plan": dietPlan } },
      { upsert: true }
    );

    return res.json({ diet_plan: dietPlan });

  } catch (err) {
    console.error("getDietPlan error:", err);
    return res.status(500).json({ msg: "Diet plan generation failed" });
  }
};

// ============================================================
// CLEAR PLAN (on goal change)
// ============================================================
exports.regeneratePlan = async (req, res) => {
  try {
    await FitnessPlan.findOneAndDelete({ user: req.user.id });
    return res.json({ msg: "Plan cleared. Reload dashboard." });
  } catch (err) {
    return res.status(500).json({ msg: "Failed to clear plan" });
  }
};

// ============================================================
// FALLBACK PLAN (when AI fails)
// ============================================================
const getFallbackPlan = (user) => ({
  workout_plan: {
    day1: { exercise: "Chest & Triceps", focus: "Push Day",     exercises: ["Barbell Bench Press - 4 sets of 8-10 reps","Incline Dumbbell Press - 3 sets of 10-12 reps","Cable Flyes - 3 sets of 12-15 reps","Tricep Pushdowns - 3 sets of 12-15 reps"],    cardio: "10 min warm-up",    duration: "50 min", calories_burn: "320" },
    day2: { exercise: "Back & Biceps",   focus: "Pull Day",     exercises: ["Pull-ups - 4 sets of 6-8 reps","Barbell Rows - 4 sets of 8-10 reps","Lat Pulldowns - 3 sets of 10-12 reps","Hammer Curls - 3 sets of 12-15 reps"],                             cardio: "10 min warm-up",    duration: "50 min", calories_burn: "300" },
    day3: { exercise: "Legs & Glutes",   focus: "Leg Day",      exercises: ["Barbell Squats - 4 sets of 8-10 reps","Romanian Deadlift - 3 sets of 10-12 reps","Leg Press - 3 sets of 12-15 reps","Calf Raises - 4 sets of 15-20 reps"],                     cardio: "10 min cycling",    duration: "55 min", calories_burn: "400" },
    day4: { exercise: "Shoulders & Arms",focus: "Shoulder Day", exercises: ["Overhead Press - 4 sets of 8-10 reps","Lateral Raises - 3 sets of 12-15 reps","Front Raises - 3 sets of 12 reps","Skull Crushers - 3 sets of 10-12 reps"],                    cardio: "10 min walk",       duration: "45 min", calories_burn: "280" },
    day5: { exercise: "Full Body HIIT",  focus: "Cardio Day",   exercises: ["Burpees - 3 sets of 10 reps","Mountain Climbers - 3 sets of 30s","Box Jumps - 3 sets of 10 reps","Battle Ropes - 3 sets of 30s"],                                              cardio: "20 min HIIT",       duration: "40 min", calories_burn: "450" },
    day6: { exercise: "Upper Body",      focus: "Strength Day", exercises: ["Push-ups - 4 sets of 15-20 reps","Dumbbell Rows - 4 sets of 10-12 reps","Arnold Press - 3 sets of 10-12 reps","Tricep Dips - 3 sets of 12-15 reps"],                           cardio: "15 min jog",        duration: "50 min", calories_burn: "350" },
    day7: { exercise: "Active Recovery", focus: "Rest Day",     exercises: ["Cat-Cow Stretch - 2 sets of 10 reps","Hip Flexor Stretch - 2 sets of 30s hold","Child Pose - 2 sets of 45s hold","Shoulder Rolls - 2 sets of 15 reps"],                        cardio: "20 min light walk", duration: "30 min", calories_burn: "120" }
  },
  diet_plan: {
    breakfast: { veg: "Oatmeal (80g) with banana (1 medium), 10 almonds and honey (1 tsp)",          nonveg: "3 scrambled eggs with 2 whole wheat toast and 1 glass orange juice",    calories: "420", protein: "28", time: "7:00 AM"  },
    lunch:     { veg: "Quinoa (100g) with black bean salad (150g) and avocado dressing",              nonveg: "Grilled chicken breast (150g) with brown rice (100g) and mixed vegetables", calories: "650", protein: "42", time: "12:30 PM" },
    dinner:    { veg: "Baked sweet potato (200g) with black beans (100g), salsa and avocado (50g)",  nonveg: "Grilled salmon (150g) with roasted asparagus (100g) and quinoa (80g)",  calories: "550", protein: "38", time: "7:00 PM"  },
    snacks:    { veg: "Greek yogurt (150g) with mixed berries (100g) and granola (30g)",              nonveg: "2 hard-boiled eggs with 6 whole wheat crackers",                          calories: "220", protein: "18", time: "4:00 PM"  }
  }
});