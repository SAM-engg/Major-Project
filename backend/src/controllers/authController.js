const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ================================
// REGISTER USER
// ================================
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // 1️⃣ Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        msg: "Please fill all required fields",
      });
    }

    // 2️⃣ Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        msg: "User already exists",
      });
    }

    // 3️⃣ Create new user (password hashing happens in model)
    const user = new User({
      name,
      email,
      password
    });

    await user.save();

    // 4️⃣ Create JWT payload
    const payload = {
      user: {
        id: user._id,
      },
    };

    // 5️⃣ Sign JWT
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;

        // 6️⃣ Send token + user (WITHOUT password)
        res.status(201).json({
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            fitnessGoal: user.fitnessGoal,
            weight: user.weight,
            height: user.height,
          },
        });
      }
    );
  } catch (err) {
    console.error("Register Error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// ================================
// LOGIN USER
// ================================
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1️⃣ Validation
    if (!email || !password) {
      return res.status(400).json({
        msg: "Please enter email and password",
      });
    }

    // 2️⃣ Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        msg: "Invalid credentials",
      });
    }

    // 3️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        msg: "Invalid credentials",
      });
    }

    // 4️⃣ Create JWT payload
    const payload = {
      user: {
        id: user._id,
      },
    };

    // 5️⃣ Sign JWT
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;

        // 6️⃣ Send token + user data
        res.json({
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            fitnessGoal: user.fitnessGoal,
            weight: user.weight,
            height: user.height,
          },
        });
      }
    );
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// ================================
// FORGOT PASSWORD
// ================================
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    const resetToken = jwt.sign(
      { user: { id: user._id } },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

    console.log("🔑 Password Reset Link:", resetLink);

    res.json({
      msg: "Password reset link generated (check server console)",
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// ================================
// RESET PASSWORD
// ================================
exports.resetPassword = async (req, res) => {
  const { password } = req.body;

  try {
    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.user.id);

    if (!user) {
      return res.status(400).json({ msg: "Invalid token" });
    }

    user.password = password; // Will be hashed by pre-save hook
    await user.save();

    res.json({ msg: "Password reset successful" });
  } catch (err) {
    res.status(400).json({ msg: "Token expired or invalid" });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.updateUserProfile = async (req, res) => {
  try {

    const { name, email, height, weight, fitnessGoal, age, gender } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        email,
        height,
        weight,
        fitnessGoal,
        age,
        gender
      },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json(updatedUser);

  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ msg: "Server error updating profile" });
  }
};

