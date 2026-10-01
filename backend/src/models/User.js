const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  password: {
    type: String,
    required: true
  },

  fitnessGoal: {
    type: String,
    default: null
  },

  weight: {
    type: Number,
    default: null
  },

  height: {
    type: Number,
    default: null
  },

  age: {
    type: Number,
    default: null
  },

  gender: {
    type: String,
    default: null
  }

},
{
  timestamps: true
});


// 🔐 Hash password before saving
UserSchema.pre("save", async function (next) {

  // If password not modified, skip hashing
  if (!this.isModified("password")) {
    return next();
  }

  try {

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    next();

  } catch (error) {

    next(error);

  }

});

module.exports = mongoose.model("User", UserSchema);