import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Dumbbell, Clock } from "lucide-react";

const WorkoutPlan = () => {

  const navigate = useNavigate();
  const [workoutPlan, setWorkoutPlan] = useState([]);

  useEffect(() => {

    const fetchWorkout = async () => {

      try {

        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:5000/api/fitness/plan", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await res.json();

        console.log("WORKOUT API:", data);

        const workout = data.aiPlan?.workout_plan || {};

        const formatted = Object.entries(workout).map(([day, value]) => ({
          day: day.replace("day", "Day "),
          focus: value.exercise,
          exercises: value.exercises?.join(", ") || "",
          time: value.cardio
        }));

        setWorkoutPlan(formatted);

      } catch (error) {
        console.error("Workout fetch error:", error);
      }

    };

    fetchWorkout();

  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10">

      <button
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-8"
      >
        <ArrowLeft size={20}/> Back to Dashboard
      </button>

      <div className="max-w-5xl mx-auto">

        <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/30 p-8 rounded-3xl mb-10">
          <h1 className="text-3xl font-black mb-2">
            AI Generated <span className="text-purple-400">Workout Plan</span>
          </h1>
          <p className="text-gray-300">
            Personalized by AI based on your fitness goal.
          </p>
        </div>

        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Calendar className="text-purple-500"/> Weekly Schedule
        </h2>

        <div className="grid grid-cols-1 gap-4">

          {workoutPlan.map((item,i)=>(
            <div
              key={i}
              className="group bg-gray-900 border border-gray-800 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-gray-800/50 transition-all cursor-pointer"
            >

              <div className="flex items-center gap-6">

                <span className="text-2xl font-black text-gray-700 group-hover:text-purple-500">
                  {item.day}
                </span>

                <div>
                  <h3 className="font-bold text-lg">{item.focus}</h3>

                  <div className="flex gap-4 mt-1">

                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Dumbbell size={12}/> {item.exercises}
                    </span>

                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock size={12}/> {item.time}
                    </span>

                  </div>
                </div>

              </div>

              <button
 onClick={async ()=>{
  const token = localStorage.getItem("token");

  await fetch("http://localhost:5000/api/progress/workout",{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      Authorization:`Bearer ${token}`
    },
    body:JSON.stringify({
      workout:item.focus
    })
  });

  alert("Workout Completed 💪");
 }}
 className="mt-4 md:mt-0 px-6 py-2 bg-gray-800 rounded-xl text-sm font-bold group-hover:bg-purple-600 transition-all"
>
Complete Workout
</button>

            </div>
          ))}

        </div>

      </div>
    </div>
  );
};

export default WorkoutPlan;