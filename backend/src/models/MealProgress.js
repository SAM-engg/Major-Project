const mongoose = require("mongoose");

const MealProgressSchema = new mongoose.Schema(
{
  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  meal:{
    type:String,
    required:true
  },

  calories:{
    type:Number,
    required:true
  }

},
{
  timestamps:true
}
);

module.exports = mongoose.model("MealProgress",MealProgressSchema);