const mongoose = require("mongoose");

const WorkoutHistorySchema = new mongoose.Schema(
{
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
  },

  workout:{
    type:String,
    required:true
  }

},
{
  timestamps:true
}
);

module.exports = mongoose.model("WorkoutHistory",WorkoutHistorySchema);