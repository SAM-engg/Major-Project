const express = require("express");

const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  updateUserProfile
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post("/register", registerUser);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post("/login", loginUser);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Generate password reset link
 * @access  Public
 */
router.post("/forgot-password", forgotPassword);

/**
 * @route   POST /api/auth/reset-password/:token
 * @desc    Reset password using token
 * @access  Public
 */
router.post("/reset-password/:token", resetPassword);

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user
 * @access  Private
 */
router.get("/me", authMiddleware, getCurrentUser);

/**
 * @route   PUT /api/auth/update
 * @desc    Update user profile
 * @access  Private
 */
router.put("/update", authMiddleware, updateUserProfile);

module.exports = router;