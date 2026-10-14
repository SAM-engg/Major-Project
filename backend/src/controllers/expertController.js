const FormData = require("form-data");
const fs = require("fs");
const axios = require("axios");

const User = require("../models/User");
const MealProgress = require("../models/MealProgress");
const FitnessPlan = require("../models/FitnessPlan");

// ============================================================
// CONFIGURATION
// ============================================================

const OPENROUTER_URL =
  "https://openrouter.ai/api/v1/chat/completions";

const AI_MODEL =
  process.env.OPENROUTER_MODEL || "openrouter/free";

const PYTHON_STT_URL =
  (process.env.PYTHON_STT_URL || "").replace(/\/+$/, "");

const FRONTEND_URL =
  process.env.FRONTEND_URL || "http://localhost:5173";

// ============================================================
// OPENROUTER AI REQUEST
// ============================================================

const callAI = async (messages, maxTokens = 400) => {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const response = await axios.post(
    OPENROUTER_URL,
    {
      model: AI_MODEL,
      messages,
      temperature: 0.5,
      max_tokens: maxTokens,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": FRONTEND_URL,
        "X-Title": "FitAI App",
      },
      timeout: 45000,
    }
  );

  const reply =
    response.data?.choices?.[0]?.message?.content?.trim();

  if (!reply) {
    throw new Error("OpenRouter returned an empty AI response");
  }

  return reply;
};

// ============================================================
// BUILD USER CONTEXT
// ============================================================

const buildUserContext = async (userId) => {
  if (!userId) return "";

  try {
    const user = await User.findById(userId);

    if (!user) return "";

    const meals = await MealProgress.find({ user: userId });
    const plan = await FitnessPlan.findOne({ user: userId });

    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const todaysMeals = meals.filter((meal) => {
      const date = new Date(meal.createdAt || meal.date || 0);
      return date >= startOfDay && date <= endOfDay;
    });

    const totalCalories = todaysMeals.reduce(
      (total, meal) => total + (Number(meal.calories) || 0),
      0
    );

    const dayMap = [6, 0, 1, 2, 3, 4, 5];
    const todayKey = `day${dayMap[today.getDay()] + 1}`;

    const todayWorkout =
      plan?.plan?.workout_plan?.[todayKey] || {};

    return `
USER PROFILE:
Name: ${user.name || "Not provided"}
Height: ${user.height || "Not provided"} cm
Weight: ${user.weight || "Not provided"} kg
Age: ${user.age || "Not provided"}
Gender: ${user.gender || "Not provided"}
Goal: ${user.fitnessGoal || "Not provided"}
Calories consumed today: ${totalCalories} kcal
Today's workout: ${todayWorkout.exercise || "Not set"}
Exercises: ${(todayWorkout.exercises || [])
      .slice(0, 3)
      .join(", ")}
`;
  } catch (error) {
    console.error("User context error:", error.message);
    return "";
  }
};

// ============================================================
// FITAI CHAT
// POST /api/expert/chat
// Keep your existing route if it uses a different path.
// ============================================================

exports.handleChatQuery = async (req, res) => {
  try {
    const message = req.body?.message;

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        error: "Please enter a message.",
      });
    }

    if (message.length > 5000) {
      return res.status(400).json({
        error: "Message is too long. Keep it under 5000 characters.",
      });
    }

    const userContext = await buildUserContext(req.user?.id);

    const reply = await callAI(
      [
        {
          role: "system",
          content: `You are FitAI Coach, a helpful fitness assistant.

${userContext}

RESPONSE RULES:
- Use bullet points beginning with •.
- Use no more than 5 bullet points.
- Keep each bullet short and understandable.
- Finish with one motivating sentence without a bullet.
- Use profile numbers when relevant.
- Do not invent user profile information.
- Give safe, practical fitness guidance.`,
        },
        {
          role: "user",
          content: message.trim(),
        },
      ],
      350
    );

    return res.json({ reply });
  } catch (error) {
    console.error("Chat error:", error.message);
    console.error("HTTP status:", error.response?.status);

    if (error.response?.data) {
      console.error(
        "OpenRouter error:",
        JSON.stringify(error.response.data)
      );
    }

    if (error.response?.status === 401) {
      return res.status(502).json({
        error: "AI provider authentication failed. Check the API key.",
      });
    }

    if (error.response?.status === 429) {
      return res.status(503).json({
        error: "AI provider rate limit reached. Please try again later.",
      });
    }

    if (error.response?.status === 404) {
      return res.status(502).json({
        error: "The configured AI model is unavailable. Check OPENROUTER_MODEL.",
      });
    }

    return res.status(502).json({
      error: "The AI assistant is temporarily unavailable. Please try again.",
    });
  }
};

// ============================================================
// VOICE EXPERT
// ============================================================

exports.handleVoiceQuery = async (req, res) => {
  let audioPath = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No audio file provided.",
      });
    }

    audioPath = req.file.path;

    if (!PYTHON_STT_URL) {
      return res.status(503).json({
        error: "Speech-to-text service URL is not configured.",
      });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(503).json({
        error: "AI provider is not configured.",
      });
    }

    // Check the deployed Python STT service.
    const sttBaseUrl = PYTHON_STT_URL.replace(/\/stt\/?$/, "");

    try {
      await axios.get(`${sttBaseUrl}/health`, {
        timeout: 10000,
      });
    } catch (error) {
      console.error("STT health check failed:", error.message);

      return res.status(503).json({
        error: "Speech-to-text service is unavailable.",
      });
    }

    // Send the recorded audio to Whisper.
    const formData = new FormData();

    formData.append("audio", fs.createReadStream(audioPath), {
      filename: req.file.originalname || "recording.webm",
      contentType: req.file.mimetype || "application/octet-stream",
    });

    const sttResponse = await axios.post(
      `${sttBaseUrl}/stt`,
      formData,
      {
        headers: formData.getHeaders(),
        timeout: 120000,
        maxBodyLength: Infinity,
      }
    );

    const transcribedText = sttResponse.data?.text?.trim();

    if (!transcribedText) {
      return res.status(400).json({
        error: "Could not understand the audio. Please speak clearly and try again.",
      });
    }

    console.log("Voice transcription completed.");

    const userContext = await buildUserContext(req.user?.id);

    const expertReply = await callAI(
      [
        {
          role: "system",
          content: `You are FitAI Voice Coach, a helpful fitness expert.

${userContext}

VOICE RESPONSE RULES:
- Answer the specific question asked.
- Use 3 to 5 short sentences at most.
- Use the user's profile data when relevant.
- Do not use bullet points or markdown.
- Speak naturally because the response will be read aloud.
- Give safe, practical fitness guidance.`,
        },
        {
          role: "user",
          content: transcribedText,
        },
      ],
      220
    );

    return res.json({
      transcribedText,
      expertReply,
    });
  } catch (error) {
    console.error("Voice processing error:", error.message);
    console.error("HTTP status:", error.response?.status);

    if (error.response?.data) {
      console.error(
        "Voice provider response:",
        JSON.stringify(error.response.data)
      );
    }

    return res.status(502).json({
      error: "Voice processing failed. Please try again.",
    });
  } finally {
    if (audioPath) {
      fs.unlink(audioPath, (error) => {
        if (error && error.code !== "ENOENT") {
          console.error("Temporary audio cleanup failed:", error.message);
        }
      });
    }
  }
};
