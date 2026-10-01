import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Dumbbell, TrendingUp, LogOut, Edit3, Play, 
  Camera, X, User, Target, Ruler, Scale, Utensils, 
  Mic, MessageSquare, Flame, CheckCircle, ChevronRight, 
  Droplets, Zap, Info, History, Save, Mail, Calendar
} from 'lucide-react';

const Dashboard = () => {
  
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const isFetchingRef = useRef(false);0
  
  const [userName, setUserName] = useState("");
  const [userAvatar, setUserAvatar] = useState(null); 
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [showEditForm, setShowEditForm] = useState(false); 
  const [showGoalModal, setShowGoalModal] = useState(false); // Separate Goal Modal
  const [showHeightModal, setShowHeightModal] = useState(false); // New Height Modal
  const [showWeightModal, setShowWeightModal] = useState(false); // New Weight Modal
  const [showHistoryModal, setShowHistoryModal] = useState(false); 
  const [completedExercises,setCompletedExercises] = useState([]);
  const [selectedDayKey,    setSelectedDayKey]    = useState(null);
  const [selectedMuscle,    setSelectedMuscle]    = useState(null);
  const [loadingWorkout,    setLoadingWorkout]     = useState(false);
  const [fullPlan,          setFullPlan]           = useState(null);

const DAYS = [
  { label: "Mon", key: "day1" },
  { label: "Tue", key: "day2" },
  { label: "Wed", key: "day3" },
  { label: "Thu", key: "day4" },
  { label: "Fri", key: "day5" },
  { label: "Sat", key: "day6" },
  { label: "Sun", key: "day7" },
];

const MUSCLE_GROUPS = [
  "Full Body","Chest & Triceps","Back & Biceps",
  "Shoulders & Arms","Legs & Glutes","Upper Body",
  "Lower Body","Cardio & Core","Active Recovery"
];
  
  const [profile, setProfile] = useState({
  goal: "",
  height: "",
  weight: "",
  age: "",
  gender: "",
  email: ""
  });

  const [calories,setCalories] = useState(0)
  const [aiPlan, setAiPlan] = useState(null);
  const [todayWorkout, setTodayWorkout] = useState(null);

  const [historyData] = useState([
    { id: 1, date: "Today", activity: "Fat Blast HIIT", status: "Completed" },
    { id: 2, date: "Yesterday", activity: "Strength Training", status: "Completed" },
    { id: 3, date: "22 Jan", activity: "Morning Yoga", status: "Completed" }
  ]);

  useEffect(() => {
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

    const res = await fetch("http://localhost:5000/api/auth/me", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const data = await res.json();

setUserName(data.name);

      setProfile((prev) => ({
        ...prev,
        height: data.height,
        weight: data.weight,
        goal: data.fitnessGoal,
        age: data.age || prev.age,
        gender: data.gender || prev.gender,
        email: data.email || prev.email
      }));

      const storedAvatar = localStorage.getItem("userAvatar");
      setUserAvatar(storedAvatar);

    } catch (error) {
      console.error("Failed to fetch user:", error);
    }
  };

  fetchUser();
}, [navigate]);

// FETCH CALORIES
useEffect(()=>{

 const fetchCalories = async()=>{

  try{

    const token = localStorage.getItem("token")

    const res = await fetch("http://localhost:5000/api/progress/calories",{
      headers:{Authorization:`Bearer ${token}`}
    })

    const data = await res.json()

    setCalories(data.total || 0)

  }
  catch(err){
    console.error("Calories fetch error:",err)
  }

 }

 fetchCalories()

},[])

useEffect(() => {
  if (!profile.goal) return;           // wait for profile to load
  if (isFetchingRef.current) return;   // ✅ prevent concurrent fetches

  const fetchPlan = async () => {
    isFetchingRef.current = true;       // lock

    try {
      const cached     = localStorage.getItem("todayWorkout");
      const cachedDate = localStorage.getItem("workoutDate");
      const cachedGoal = localStorage.getItem("workoutGoal");
      const today      = new Date().toDateString();

      // ✅ Return cache if same day + same goal
      if (cached && cachedDate === today && cachedGoal === profile.goal) {
        const parsed = JSON.parse(cached);
        setTodayWorkout(parsed);

        // Set today's day key
        const dayMap   = [6,0,1,2,3,4,5];
        const todayKey = `day${dayMap[new Date().getDay()] + 1}`;
        setSelectedDayKey(todayKey);
        return;
      }

      const token = localStorage.getItem("token");
      const res   = await fetch("http://localhost:5000/api/fitness/plan", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Plan fetch failed");

      const data = await res.json();
      setFullPlan(data.aiPlan);
      setAiPlan(data.aiPlan);

      if (data.aiPlan?.workout_plan) {
        const dayMap   = [6,0,1,2,3,4,5];
        const todayIdx = new Date().getDay();
        const todayKey = `day${dayMap[todayIdx] + 1}`;
        setSelectedDayKey(todayKey);

        const day = data.aiPlan.workout_plan[todayKey]
                 || Object.values(data.aiPlan.workout_plan)[0];

        applyWorkoutDay(day, today);
      }
    } catch (err) {
      console.error("fetchPlan error:", err);
    } finally {
      isFetchingRef.current = false;    // unlock
    }
  };

  fetchPlan();
}, [profile.goal]);

const applyWorkoutDay = (day, today) => {
  const workout = {
    title:     day.exercise   || "Today's Workout",
    burn:      day.calories_burn ? `${day.calories_burn} kcal` : "AI Generated",
    duration:  day.duration   || "",
    focus:     day.focus      || "",
    exercises: (day.exercises || []).slice(0,5).map(e => ({
      name: typeof e === "string" ? e.split(" - ")[0] : e,
      dur:  typeof e === "string" && e.includes(" - ") ? e.split(" - ")[1] : "3 sets",
      img:  "💪"
    }))
  };
  localStorage.setItem("todayWorkout", JSON.stringify(workout));
  localStorage.setItem("workoutDate",  today || new Date().toDateString());
  localStorage.setItem("workoutGoal",  profile.goal);
  setTodayWorkout(workout);
};


  const handleLogout = () => {
  navigate("/logout");
};


  const handleImageClick = () => fileInputRef.current.click();
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserAvatar(reader.result);
        localStorage.setItem("userAvatar", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
const handleProfileSave = async (e) => {
  e.preventDefault();

  try {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5000/api/auth/update", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: userName,
        email: profile.email,
        height: Number(profile.height),
        weight: Number(profile.weight),
        fitnessGoal: profile.goal,
        age: Number(profile.age),
        gender: profile.gender
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to update profile");
    }

    const data = await res.json();

    // Update UI with latest data from DB
    setUserName(data.name);

    setProfile((prev) => ({
      ...prev,
      goal: data.fitnessGoal,
      height: data.height,
      weight: data.weight,
      email: data.email,
      age: data.age,
      gender: data.gender
    }));

    setShowEditForm(false);

  } catch (error) {
    console.error("Profile update failed:", error);
  }
};

const handleGoalSave = async (newGoal) => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5000/api/auth/update", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ fitnessGoal: newGoal }),
    });

    if (!res.ok) throw new Error("Failed to update goal");
    const data = await res.json();

    // ✅ FIX: Clear cached workout so new goal triggers fresh AI plan
    localStorage.removeItem("todayWorkout");
    localStorage.removeItem("workoutDate");
    localStorage.removeItem("workoutGoal");

    // Also tell backend to clear old DB plan
    await fetch("http://localhost:5000/api/fitness/regenerate", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    setProfile((prev) => ({ ...prev, goal: data.fitnessGoal }));
    setShowGoalModal(false);

  } catch (err) {
    console.error("Goal update failed:", err);
  }
};

const handleDaySelect = async (dayKey) => {
  setSelectedDayKey(dayKey);
  setSelectedMuscle(null);
  if (fullPlan?.workout_plan?.[dayKey]) {
    applyWorkoutDay(fullPlan.workout_plan[dayKey]);
  }
};

const handleMuscleSelect = async (muscle) => {
  setSelectedMuscle(muscle);
  setLoadingWorkout(true);
  try {
    const token = localStorage.getItem("token");
    const res   = await fetch("http://localhost:5000/api/fitness/day-workout", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ dayKey: selectedDayKey || "day1", muscleGroup: muscle })
    });
    const data = await res.json();
    if (data.workout) applyWorkoutDay(data.workout);
  } catch (err) {
    console.error("Muscle group fetch failed:", err);
  } finally {
    setLoadingWorkout(false);
  }
};

  // Generic updater for height/weight modals
  const updateQuickStat = (key, val) => {
    setProfile({...profile, [key]: val});
    localStorage.setItem(`user${key.charAt(0).toUpperCase() + key.slice(1)}`, val);
  };

 const getDailyRequirements = () => {

  // 🔥 ALWAYS use AI plan if available
  if(todayWorkout){
    return {
      protein: Math.round(profile.weight * 1.6),
      water: 3,
      calTarget: profile.goal?.toLowerCase().includes("fat") ? 1800 :
                 profile.goal?.toLowerCase().includes("muscle") ? 2800 : 2200,
      plan:{
  title: todayWorkout.title,
  burn:"AI Generated",
  exercises: todayWorkout.exercises
}
    };

  }
    
const weight = parseFloat(profile.weight);
const goal = (profile.goal || "").toLowerCase();
    let protein, water, calTarget, plan;

    if (goal.includes("fat")) {
      protein = Math.round(weight * 1.8); water = 3.5; calTarget = 1800;
      plan = { title: "Fat Blast HIIT", burn: "450 kcal", exercises: [{ name: "Jumping Jacks", dur: "60s", img: "🏃" }, { name: "Burpees", dur: "12 reps", img: "💥" }, { name: "Mountain Climbers", dur: "45s", img: "⛰️" }, { name: "Plank To Pushup", dur: "10 reps", img: "🤸" }] };
    } else if (goal.includes("muscle") || goal.includes("gain")) {
      protein = Math.round(weight * 2.2); water = 4.5; calTarget = 2800;
      plan = { title: "Home Strength Builder", burn: "350 kcal", exercises: [{ name: "Decline Pushups", dur: "15 reps", img: "💪" }, { name: "Bulgarian Split Squats", dur: "12/side", img: "🦵" }, { name: "Pike Pushups", dur: "10 reps", img: "📐" }, { name: "Dips (Chair)", dur: "15 reps", img: "🪑" }] };
    } else {
      protein = Math.round(weight * 1.6); water = 3.0; calTarget = 2200;
      plan = { title: "Functional Longevity", burn: "300 kcal", exercises: [{ name: "Bodyweight Squats", dur: "20 reps", img: "🏋️" }, { name: "Standard Pushups", dur: "15 reps", img: "✨" }, { name: "Bird Dog", dur: "12 reps", img: "🐕" }, { name: "Superman", dur: "30s", img: "🦸" }] };
    }
    return { protein, water, calTarget, plan };
  };

  const { protein, water, calTarget, plan } = getDailyRequirements();
  const percent = calTarget ? Math.round((calories / calTarget) * 100) : 0;
  let difficulty = "Beginner";

if(percent > 60) difficulty = "Intermediate";
if(percent > 90) difficulty = "Advanced";


const toggleExercise = (index)=>{
  setCompletedExercises(prev=>{
    if(prev.includes(index)){
      return prev.filter(i=>i!==index)
    }
    return [...prev,index]
  })
}
  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#E5E7EB] p-4 md:p-10 font-sans relative pb-20">
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex items-center gap-5">
          <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-[#7C3AED] p-1 bg-[#121826] cursor-pointer group" onClick={handleImageClick}>
            <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-[#0B0F14]">
              {userAvatar ? <img src={userAvatar} className="w-full h-full object-cover" alt="avatar" /> : <User size={28} className="text-[#6B7280]" />}
            </div>
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={16} className="text-white" />
            </div>
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageChange} accept="image/*" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold">Hey, <span className="text-[#7C3AED]">{userName}</span></h1>
              <button onClick={() => setShowEditForm(true)}><Edit3 size={16} className="text-gray-500 hover:text-white"/></button>
            </div>
            <p className="text-[#9CA3AF] text-xs">{profile.gender} • {profile.age} yrs • {profile.goal}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="bg-[#121826] border border-[#1F2937] px-4 py-2 rounded-xl text-[#EF4444] text-sm font-bold flex items-center gap-2">
          <LogOut size={16} /> Logout
        </button>
      </header>

      {/* STATS STRIP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="bg-[#121826] border border-[#1F2937] p-5 rounded-3xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-[#0B0F14] p-3 rounded-2xl"><Target className="text-[#22C55E]"/></div>
              <div>
                <p className="text-[10px] text-[#6B7280] uppercase font-black">Current Objective</p>
                <h3 className="text-xl font-bold">{profile.goal}</h3>
              </div>
            </div>
            <button onClick={() => setShowGoalModal(true)} className="p-2 hover:bg-[#1F2937] rounded-xl transition-colors">
              <Edit3 size={16} className="text-[#7C3AED]" />
            </button>
        </div>

        <div className="bg-[#121826] border border-[#1F2937] p-5 rounded-3xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-[#0B0F14] p-3 rounded-2xl"><Ruler className="text-[#7C3AED]"/></div>
              <div>
                <p className="text-[10px] text-[#6B7280] uppercase font-black">Height (cm)</p>
                <h3 className="text-xl font-bold">{profile.height}</h3>
              </div>
            </div>
            <button onClick={() => setShowHeightModal(true)} className="p-2 hover:bg-[#1F2937] rounded-xl transition-colors">
              <Edit3 size={16} className="text-[#7C3AED]" />
            </button>
        </div>

        <div className="bg-[#121826] border border-[#1F2937] p-5 rounded-3xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-[#0B0F14] p-3 rounded-2xl"><Scale className="text-[#7C3AED]"/></div>
              <div>
                <p className="text-[10px] text-[#6B7280] uppercase font-black">Weight (kg)</p>
                <h3 className="text-xl font-bold">{profile.weight}</h3>
              </div>
            </div>
            <button onClick={() => setShowWeightModal(true)} className="p-2 hover:bg-[#1F2937] rounded-xl transition-colors">
              <Edit3 size={16} className="text-[#7C3AED]" />
            </button>
        </div>
      </div>

      {/* DAY SELECTOR */}
<div className="mb-6">
  <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mb-3">
    {DAYS.map((d) => {
      const todayIdx = new Date().getDay();
      const dayMap   = [6,0,1,2,3,4,5];
      const isToday  = d.key === `day${dayMap[todayIdx]+1}`;
      return (
        <button
          key={d.key}
          onClick={() => handleDaySelect(d.key)}
          className={`shrink-0 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all
            ${selectedDayKey === d.key
              ? "bg-[#7C3AED] text-white"
              : "bg-[#121826] border border-[#1F2937] text-gray-400 hover:border-[#7C3AED]"
            }`}
        >
          {d.label}
          {isToday && <span className="block text-[8px] text-green-400">Today</span>}
        </button>
      );
    })}
  </div>

  {/* MUSCLE GROUP PILLS */}
  <div className="flex gap-2 flex-wrap">
    {MUSCLE_GROUPS.map((m) => (
      <button
        key={m}
        onClick={() => handleMuscleSelect(m)}
        disabled={loadingWorkout}
        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all
          ${selectedMuscle === m
            ? "bg-[#7C3AED] text-white"
            : "bg-[#121826] border border-[#1F2937] text-gray-400 hover:border-[#7C3AED] hover:text-white"
          } ${loadingWorkout ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {loadingWorkout && selectedMuscle === m ? "⏳" : ""} {m}
      </button>
    ))}
  </div>
</div>

      {/* WORKOUT & CALORIES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <div onClick={() => { setShowModal(true); setModalStep(1); }} className="lg:col-span-2 bg-gradient-to-br from-[#7C3AED] to-[#4338CA] p-8 rounded-[2.5rem] cursor-pointer hover:shadow-2xl transition-all relative overflow-hidden group">
          <div className="z-10 relative">
            <div className="bg-white/20 w-fit px-3 py-1 rounded-full text-[10px] font-bold mb-4">TODAY'S MISSION</div>
            <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-white">{plan.title}</h2>
            <p className="text-green-400 text-xs font-bold mt-1">
AI Personalized Workout
</p>

<p className="text-xs text-gray-300">
Optimized for {profile.goal} • Weight {profile.weight}kg • Protein target {protein}g
</p>
            <p className="text-green-400 text-xs font-bold mt-1">
AI Personalized Workout
</p>

<p className="text-yellow-400 text-xs">
Difficulty: {difficulty}
</p>
            <p className="mt-4 flex items-center gap-2 font-bold text-indigo-100"><Zap size={18} fill="currentColor"/> Begin Session • {plan.burn}</p>
          </div>
          <Dumbbell size={200} className="absolute -bottom-10 -right-10 text-white/5 -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
        </div>

        <div className="bg-[#121826] border border-[#1F2937] p-8 rounded-[2.5rem]">
          <h2 className="text-xs font-black uppercase text-gray-500 mb-6 tracking-widest">Energy Intake</h2>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-2xl font-black text-white">{calories}  <span className="text-sm text-gray-500">/ {calTarget} kcal</span></p>
              <p className="text-[10px] font-bold text-[#7C3AED]">DAILY GOAL</p>
            </div>
          <div className="w-16 h-16 rounded-full border-4 border-gray-800 flex items-center justify-center text-[10px] font-bold">
{percent}%
</div>
          </div>
        </div>
      </div>
{/* EXERCISES & NUTRITION */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">

{/* EXERCISE SEQUENCE */}
<div>
  <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#6B7280] mb-4">
    Exercise Sequence
  </h2>

  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2 no-scrollbar">

   {(todayWorkout ? todayWorkout.exercises : []).map((ex, idx) => (

      <div
  key={idx}
  onClick={() => toggleExercise(idx)}
  className={`border p-4 rounded-2xl flex items-center gap-4 cursor-pointer transition-all
  ${
    completedExercises.includes(idx)
      ? "bg-green-500/10 border-green-500"
      : "bg-[#121826]/60 border-[#1F2937] hover:border-[#7C3AED]"
  }`}
>

        <span className="text-2xl">{ex.img}</span>

        <div className="flex-grow">
          <h4 className="font-bold text-sm text-white">{ex.name}</h4>
          <p className="text-[10px] text-gray-500">{ex.dur}</p>
        </div>

        <div className="bg-[#0B0F14] p-2 rounded-lg text-[#7C3AED]">
          {completedExercises.includes(idx)
 ? <CheckCircle size={16} className="text-green-400"/>
 : <ChevronRight size={14}/>
}
        </div>

      </div>

    ))}

  </div>
</div>


  {/* CALCULATED NUTRITION */}
  <div className="flex flex-col gap-4">

    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#6B7280] mb-0.5">
      Calculated Nutrition
    </h2>

    <div className="bg-[#121826] border border-[#1F2937] p-6 rounded-[2rem] flex items-center gap-6">
      <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-400">
        <Droplets size={24}/>
      </div>

      <div className="flex-grow">
        <h4 className="font-bold text-sm">Hydration</h4>
        <p className="text-xl font-black">{water}L</p>
      </div>
    </div>

    <div className="bg-[#121826] border border-[#1F2937] p-6 rounded-[2rem] flex items-center gap-6">
      <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-400">
        <Utensils size={24}/>
      </div>

      <div className="flex-grow">
        <h4 className="font-bold text-sm">Protein</h4>
        <p className="text-xl font-black">{protein}g</p>
      </div>
    </div>

  </div>

</div>

      {/* ACTION BOXES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { name: "Diet AI", icon: <Utensils size={28}/>, path: '/diet' }, 
          { name: "Chat", icon: <MessageSquare size={28}/>, path: '/chat' }, 
          { name: "Voice", icon: <Mic size={28}/>, path: '/voice' }, 
          { name: "View History", icon: <History size={28}/>, action: () => setShowHistoryModal(true) }
        ].map((t, i) => (
          <div key={i} onClick={t.action || (() => navigate(t.path))} className="bg-[#121826] p-6 rounded-2xl border-2 border-[#1F2937] flex flex-col items-center gap-3 cursor-pointer hover:border-[#7C3AED] transition-all">
            <div className="text-[#7C3AED]">{t.icon}</div>
            <span className="text-[11px] font-black uppercase tracking-wider">{t.name}</span>
          </div>
        ))}
      </div>

      {/* INDIVIDUAL GOAL EDIT MODAL */}
      {showGoalModal && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#121826] border border-[#1F2937] w-full max-w-sm rounded-[2.5rem] p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black italic">UPDATE GOAL</h3>
              <button onClick={() => setShowGoalModal(false)}><X/></button>
            </div>
            <div className="space-y-3">
              {["Fat Loss", "Muscle Gain", "Maintenance"].map((g) => (
                <button 
                  key={g}
                  onClick={() => handleGoalSave(g)}
                  className={`w-full p-4 rounded-2xl font-bold border ${profile.goal === g ? 'bg-[#7C3AED] border-[#7C3AED]' : 'bg-[#0B0F14] border-[#1F2937] hover:border-[#7C3AED]'}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* NEW: HEIGHT EDIT MODAL */}
      {showHeightModal && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#121826] border border-[#1F2937] w-full max-w-sm rounded-[2.5rem] p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black italic">UPDATE HEIGHT</h3>
              <button onClick={() => setShowHeightModal(false)}><X/></button>
            </div>
            <input 
              type="number" 
              className="w-full bg-[#0B0F14] border border-[#1F2937] p-4 rounded-2xl text-center text-3xl font-bold outline-none focus:border-[#7C3AED]"
              value={profile.height}
              onChange={(e) => updateQuickStat("height", e.target.value)}
            />
            <button onClick={() => setShowHeightModal(false)} className="w-full py-4 bg-[#7C3AED] rounded-xl font-black mt-4">DONE</button>
          </div>
        </div>
      )}

      {/* NEW: WEIGHT EDIT MODAL */}
      {showWeightModal && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#121826] border border-[#1F2937] w-full max-w-sm rounded-[2.5rem] p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black italic">UPDATE WEIGHT</h3>
              <button onClick={() => setShowWeightModal(false)}><X/></button>
            </div>
            <input 
              type="number" 
              className="w-full bg-[#0B0F14] border border-[#1F2937] p-4 rounded-2xl text-center text-3xl font-bold outline-none focus:border-[#7C3AED]"
              value={profile.weight}
              onChange={(e) => updateQuickStat("weight", e.target.value)}
            />
            <button onClick={() => setShowWeightModal(false)} className="w-full py-4 bg-[#7C3AED] rounded-xl font-black mt-4">DONE</button>
          </div>
        </div>
      )}

      {/* PROFILE EDIT MODAL */}
      {showEditForm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#121826] border border-[#1F2937] w-full max-w-md rounded-[2.5rem] p-8 my-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black italic">EDIT PROFILE</h3>
              <button onClick={() => setShowEditForm(false)}><X/></button>
            </div>
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase ml-2">Full Name</label>
                <input className="w-full bg-[#0B0F14] border border-[#1F2937] p-3 rounded-xl mt-1 outline-none focus:border-[#7C3AED]" value={userName} onChange={(e) => setUserName(e.target.value)} />
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase ml-2">Email Address</label>
                <input className="w-full bg-[#0B0F14] border border-[#1F2937] p-3 rounded-xl mt-1 outline-none focus:border-[#7C3AED]" type="email" value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase ml-2">Age</label>
                  <input type="number" className="w-full bg-[#0B0F14] border border-[#1F2937] p-3 rounded-xl mt-1 outline-none" value={profile.age} onChange={(e) => setProfile({...profile, age: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase ml-2">Gender</label>
                  <select
                  className="w-full bg-[#0B0F14] border border-[#1F2937] p-3 rounded-xl mt-1 outline-none text-white appearance-none"
                  value={profile.gender || ""}
                  onChange={(e) => setProfile({...profile, gender: e.target.value})}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase ml-2">Height (cm)</label>
                  <input className="w-full bg-[#0B0F14] border border-[#1F2937] p-3 rounded-xl mt-1 outline-none" value={profile.height} onChange={(e) => setProfile({...profile, height: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase ml-2">Weight (kg)</label>
                  <input className="w-full bg-[#0B0F14] border border-[#1F2937] p-3 rounded-xl mt-1 outline-none" value={profile.weight} onChange={(e) => setProfile({...profile, weight: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase ml-2">Extra Info / Bio</label>
                <input className="w-full bg-[#0B0F14] border border-[#1F2937] p-3 rounded-xl mt-1 outline-none" value={profile.extraInfo} onChange={(e) => setProfile({...profile, extraInfo: e.target.value})} />
              </div>
              <button type="submit" className="w-full py-4 bg-[#7C3AED] rounded-xl font-black mt-4 uppercase">Save Profile</button>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#121826] border border-[#1F2937] w-full max-w-md rounded-[2.5rem] p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black italic">WORKOUT HISTORY</h3>
              <button onClick={() => setShowHistoryModal(false)}><X/></button>
            </div>
            <div className="space-y-3">
              {historyData.map(h => (
                <div key={h.id} className="bg-[#0B0F14] p-4 rounded-2xl border border-[#1F2937] flex justify-between">
                  <div>
                    <p className="font-bold text-sm">{h.activity}</p>
                    <p className="text-[10px] text-gray-500">{h.date}</p>
                  </div>
                  <span className="text-[10px] text-green-500 font-bold uppercase">{h.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Camera/Setup Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
          <div className="bg-[#121826] border border-[#1F2937] w-full max-w-md rounded-[3rem] p-8 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-gray-500"><X size={24}/></button>
            {modalStep === 1 ? (
              <div className="animate-in fade-in zoom-in duration-300">
                <div className="bg-indigo-500/10 w-20 h-20 rounded-3xl flex items-center justify-center mb-6 mx-auto text-[#7C3AED]"><Info size={40} /></div>
                <h3 className="text-2xl font-black text-center mb-2 uppercase italic">Camera Setup</h3>
                <p className="text-[#9CA3AF] text-center text-sm mb-6">Track your form accurately:</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex gap-3 text-xs bg-[#0B0F14] p-3 rounded-xl border border-[#1F2937]"><div className="text-[#22C55E]">01</div><span>Place phone vertically against a wall.</span></li>
                  <li className="flex gap-3 text-xs bg-[#0B0F14] p-3 rounded-xl border border-[#1F2937]"><div className="text-[#22C55E]">02</div><span>Stand 6-8 feet back.</span></li>
                </ul>
                <button onClick={() => setModalStep(2)} className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase transition-all active:scale-95">I'm Ready</button>
              </div>
            ) : (
              <div className="animate-in slide-in-from-bottom-4 duration-300 text-center">
                <div className="bg-[#7C3AED] w-20 h-20 rounded-full flex items-center justify-center mb-6 mx-auto shadow-[0_0_30px_rgba(124,58,237,0.5)]"><Camera size={40} className="text-white" /></div>
                <h3 className="text-2xl font-black mb-4 italic uppercase">Ready To Go?</h3>
                <button onClick={() => navigate('/workout')} className="w-full py-5 bg-[#7C3AED] text-white rounded-2xl font-black uppercase tracking-widest">Start AI Camera</button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  );
};

export default Dashboard;