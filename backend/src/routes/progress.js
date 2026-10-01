const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const MealProgress = require("../models/MealProgress");


// =========================
// LOG MEAL
// =========================
router.post("/meal", auth, async (req,res)=>{
 try{

  const { meal, calories } = req.body;

  const record = await MealProgress.create({
    user:req.user.id,
    meal,
    calories
  });

  res.json(record);

 }
 catch(err){
  console.error(err);
  res.status(500).json({msg:"Error logging meal"});
 }
});


// =========================
// GET TODAY CALORIES
// =========================
router.get("/calories", auth, async (req,res)=>{

 try{

  // start of today
  const today = new Date();
  today.setHours(0,0,0,0);

  const meals = await MealProgress.find({
    user:req.user.id,
    createdAt:{ $gte: today }
  });

  const total = meals.reduce((sum,m)=> sum + m.calories,0);

  res.json({total});

 }
 catch(err){
  console.error(err);
  res.status(500).json({msg:"Error fetching calories"});
 }

});

module.exports = router;