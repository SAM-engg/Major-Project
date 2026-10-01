const FormData     = require("form-data");
const fs           = require("fs");
const axios        = require("axios");
const User         = require("../models/User");
const MealProgress = require("../models/MealProgress");
const FitnessPlan  = require("../models/FitnessPlan");

// ============================================================
// ✅ CHANGE MODEL HERE ONLY — affects entire file
// ============================================================
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const AI_MODEL       = "meta-llama/llama-3-8b-instruct";
// Other options: "meta-llama/llama-3-8b-instruct" | "mistralai/mistral-7b-instruct"

const PYTHON_STT_URL = "http://localhost:5001/stt";

const callAI = async (messages, maxTokens = 400) => {
  const res = await axios.post(
    OPENROUTER_URL,
    {
      model:      AI_MODEL,
      messages,
      temperature: 0.5,
      max_tokens:  maxTokens
    },
    {
      headers: {
        Authorization:  `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173",
        "X-Title":      "FitAI App"
      },
      timeout: 20000
    }
  );
  return res.data.choices?.[0]?.message?.content?.trim() || "";
};

// ============================================================
// BUILD USER CONTEXT
// ============================================================
const buildUserContext = async (userId) => {
  if (!userId) return "";
  try {
    const user  = await User.findById(userId);
    const meals = await MealProgress.find({ user: userId });
    const plan  = await FitnessPlan.findOne({ user: userId });
    const totalCalories = meals.reduce((s, m) => s + (m.calories || 0), 0);
    const dayMap    = [6,0,1,2,3,4,5];
    const todayKey  = `day${dayMap[new Date().getDay()] + 1}`;
    const todayWorkout = plan?.plan?.workout_plan?.[todayKey] || {};
    return `
USER PROFILE:
Name: ${user?.name}, Height: ${user?.height}cm, Weight: ${user?.weight}kg
Age: ${user?.age}, Gender: ${user?.gender}, Goal: ${user?.fitnessGoal}
Calories today: ${totalCalories} kcal
Today's workout: ${todayWorkout.exercise || "Not set"}
Exercises: ${(todayWorkout.exercises || []).slice(0, 3).join(", ")}
`;
  } catch { return ""; }
};

// ============================================================
// FITAI CHAT — bullet point replies
// ============================================================
exports.handleChatQuery = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message required" });

    const userContext = await buildUserContext(req.user?.id);

    const reply = await callAI([
      {
        role: "system",
        content: `You are FitAI Coach — a smart fitness assistant.

${userContext}

STRICT REPLY FORMAT:
• Always reply using bullet points with "•" character
• Maximum 5 bullets per reply
• Each bullet: ONE short sentence under 15 words
• End with ONE motivating sentence (no bullet)
• Use user's actual profile numbers when relevant
• Never write paragraphs or walls of text`
      },
      { role: "user", content: message }
    ], 300);

    return res.json({ reply });

  } catch (err) {
    console.error("Chat error:", err.message);
    return res.status(500).json({ error: "Chat error. Please try again." });
  }
};

// ============================================================
// VOICE EXPERT — transcribe + AI response
// ============================================================
exports.handleVoiceQuery = async (req, res) => {
  let audioPath = null;
  try {
    if (!req.file) return res.status(400).json({ error: "No audio file provided" });

    audioPath = req.file.path;

    // Health check Python STT service
    try {
      await axios.get("http://localhost:5001/health", { timeout: 3000 });
    } catch {
      return res.status(503).json({
        error: "Voice service offline. Please start the Python STT server."
      });
    }

    // Transcribe audio
    const formData = new FormData();
    formData.append("audio", fs.createReadStream(audioPath));

    const sttRes = await axios.post(PYTHON_STT_URL, formData, {
      headers:  formData.getHeaders(),
      timeout:  20000
    });

    const transcribedText = sttRes.data?.text?.trim();
    if (!transcribedText) {
      return res.status(400).json({ error: "Could not understand audio. Speak clearly and try again." });
    }

    console.log("✅ Transcribed:", transcribedText);

    // AI response
    const userContext = await buildUserContext(req.user?.id);

    const expertReply = await callAI([
      {
        role: "system",
        content: `You are FitAI Voice Coach — a fitness expert answering spoken questions.

${userContext}

VOICE REPLY RULES:
- Answer ONLY the specific question asked
- 3-5 plain sentences maximum
- Use user's profile data (weight, goal) when relevant
- NO bullet points, NO markdown — plain sentences only
- Conversational tone — this will be read aloud
- Be specific, confident and motivating`
      },
      { role: "user", content: transcribedText }
    ], 200);

    return res.json({ transcribedText, expertReply });

  } catch (err) {
    console.error("Voice error:", err.message);
    return res.status(500).json({ error: err.message || "Voice processing failed" });
  } finally {
    if (audioPath && fs.existsSync(audioPath)) fs.unlink(audioPath, () => {});
  }
};