import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Utensils, Flame, Loader2, RefreshCw, CheckCircle, Clock } from "lucide-react";

const MEAL_CALORIES = { Breakfast: 420, Lunch: 650, Dinner: 550, Snacks: 220 };

const DietPlan = () => {
  const navigate = useNavigate();
  const [dietPlan,    setDietPlan]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [loggedMeals, setLoggedMeals] = useState({});
  const [pref,        setPref]        = useState("nonveg"); // veg / nonveg toggle

  const fetchDiet = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch("http://localhost:5000/api/fitness/diet", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error(`Server ${res.status}`);
      const data = await res.json();
      const diet = data.diet_plan;

      if (!diet) throw new Error("No diet plan in response");

      const meals = Object.entries(diet).map(([key, val]) => ({
        id:       key,
        time:     key.charAt(0).toUpperCase() + key.slice(1),
        veg:      typeof val === "string" ? val : val.veg   || "",
        nonveg:   typeof val === "string" ? val : val.nonveg|| "",
        calories: val.calories || MEAL_CALORIES[key.charAt(0).toUpperCase() + key.slice(1)] || 400,
        protein:  val.protein  || "—",
        mealTime: val.time     || ""
      }));

      setDietPlan(meals);
    } catch (err) {
      setError("Could not load AI diet plan. Showing defaults.");
      setDietPlan([
        { id:"breakfast", time:"Breakfast", veg:"Oatmeal (80g) with banana and 10 almonds", nonveg:"3 scrambled eggs with 2 whole wheat toast", calories:420, protein:"28", mealTime:"7:00 AM" },
        { id:"lunch",     time:"Lunch",     veg:"Quinoa salad with black beans and avocado", nonveg:"Grilled chicken (150g) with brown rice", calories:650, protein:"42", mealTime:"12:30 PM" },
        { id:"dinner",    time:"Dinner",    veg:"Baked sweet potato with black beans", nonveg:"Grilled salmon (150g) with asparagus", calories:550, protein:"38", mealTime:"7:00 PM" },
        { id:"snacks",    time:"Snacks",    veg:"Greek yogurt with mixed berries", nonveg:"2 hard-boiled eggs with crackers", calories:220, protein:"18", mealTime:"4:00 PM" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDiet(); }, []);

  const logMeal = async (item, index) => {
    try {
      const token = localStorage.getItem("token");
      await fetch("http://localhost:5000/api/progress/meal", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ meal: item.time, calories: Number(item.calories) })
      });
      setLoggedMeals(p => ({ ...p, [index]: true }));
    } catch (err) { console.error(err); }
  };

  const totalCals = dietPlan.reduce((s, m) => s + Number(m.calories || 0), 0);

  return (
    <div className="min-h-screen bg-[#0B0F14] text-white p-6 md:p-10">
      <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8">
        <ArrowLeft size={20}/> Back to Dashboard
      </button>

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-black">AI <span className="text-green-400">Nutrition Plan</span></h1>
          <button onClick={fetchDiet} className="flex items-center gap-2 text-xs text-gray-400 hover:text-white border border-[#1F2937] px-3 py-2 rounded-xl transition-colors">
            <RefreshCw size={14}/> Refresh
          </button>
        </div>

        {/* Veg / Non-veg toggle */}
        <div className="flex gap-2 mb-6">
          {["veg","nonveg"].map(p => (
            <button
              key={p}
              onClick={() => setPref(p)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all
                ${pref === p
                  ? "bg-green-500 text-black"
                  : "bg-[#121826] border border-[#1F2937] text-gray-400 hover:border-green-500"
                }`}
            >
              {p === "veg" ? "🥗 Vegetarian" : "🍗 Non-Veg"}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2 text-xs text-gray-500">
            <Flame size={14} className="text-orange-400"/>
            Total: <span className="text-white font-bold">{totalCals} kcal</span>
          </div>
        </div>

        {error && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs p-3 rounded-xl mb-4">
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <Loader2 size={40} className="text-green-400 animate-spin"/>
            <p className="text-gray-400 text-sm">Generating your personalized nutrition plan...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {dietPlan.map((item, i) => (
              <div
                key={i}
                className={`border p-6 rounded-2xl transition-all
                  ${loggedMeals[i]
                    ? "bg-green-500/10 border-green-500/40"
                    : "bg-[#121826] border-[#1F2937] hover:border-green-500/40"
                  }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-4 items-start flex-1">
                    <div className="p-2 bg-green-500/10 rounded-xl mt-1">
                      <Utensils size={18} className="text-green-400"/>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-black text-white">{item.time}</h3>
                        {item.mealTime && (
                          <span className="flex items-center gap-1 text-[10px] text-gray-500">
                            <Clock size={10}/> {item.mealTime}
                          </span>
                        )}
                        <span className="text-[10px] text-orange-400 font-bold">
                          {item.calories} kcal
                        </span>
                        {item.protein !== "—" && (
                          <span className="text-[10px] text-green-400 font-bold">
                            {item.protein}g protein
                          </span>
                        )}
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {pref === "veg" ? item.veg : item.nonveg}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => logMeal(item, i)}
                    disabled={loggedMeals[i]}
                    className={`ml-4 p-2 rounded-xl transition-all shrink-0
                      ${loggedMeals[i]
                        ? "text-green-400 cursor-default"
                        : "text-gray-500 hover:text-green-400 hover:bg-green-500/10"
                      }`}
                    title={loggedMeals[i] ? "Logged!" : "Log this meal"}
                  >
                    {loggedMeals[i]
                      ? <CheckCircle size={22}/>
                      : <Flame size={22}/>
                    }
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-gray-600 text-xs mt-8">
          🔥 Tap the flame icon to log a meal to your daily tracker
        </p>
      </div>
    </div>
  );
};

export default DietPlan;