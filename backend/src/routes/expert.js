const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { handleVoiceQuery, handleChatQuery } = require("../controllers/expertController");

const router = express.Router();


// ==============================
// Ensure uploads folder exists
// ==============================

const uploadDir = "uploads";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}


// ==============================
// Multer Storage Config
// ==============================

const storage = multer.diskStorage({

  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },

  filename: function (req, file, cb) {

    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(null, uniqueName + path.extname(file.originalname));

  }

});


// ==============================
// File Filter (Audio Only)
// ==============================

const fileFilter = (req, file, cb) => {

  const allowed = [
    "audio/mpeg",
    "audio/wav",
    "audio/webm",
    "audio/ogg",
    "audio/mp3"
  ];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only audio files allowed"), false);
  }

};


// ==============================
// Multer Upload Config
// ==============================

const upload = multer({

  storage: storage,

  limits: {
    fileSize: 10 * 1024 * 1024
  },

  fileFilter: fileFilter

});


// ==============================
// FITAI COACH CHAT ROUTE
// ==============================

const auth = require("../middleware/authMiddleware");

router.post("/chat", auth, handleChatQuery);


// ==============================
// VOICE EXPERT ROUTE
// ==============================

router.post(
  "/voice",
  upload.single("audio"),
  handleVoiceQuery
);


// ==============================
// EXPORT ROUTER
// ==============================

module.exports = router;