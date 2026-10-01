const mongoose = require("mongoose");

const FitnessPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true  // one plan per user
  },

  goal: {
    type: String,
    default: ""  // used to detect goal change → regenerate
  },

  plan: {
    type: Object,
    default: {}  // stores full { workout_plan:{}, diet_plan:{} }
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("FitnessPlan", FitnessPlanSchema);