import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Info, Play } from "lucide-react";

const Workout = () => {
  const navigate = useNavigate();

  const [reps, setReps] = useState(0);
  const [postureScore, setPostureScore] = useState(85);
  const [started, setStarted] = useState(false);
  const [aiFeedback, setAiFeedback] = useState("Press Start to begin workout");


 useEffect(() => {
  if (!started) return;

  const interval = setInterval(async () => {
    const res = await fetch("http://127.0.0.1:5002/ai_status");
    const data = await res.json();

    setReps(data.reps);
    setAiFeedback(data.feedback);
  }, 700);

  return () => clearInterval(interval);
}, [started]);

const startWorkout = async () => {
  try {
    await fetch("http://127.0.0.1:5002/start_counter", {
      method: "POST",
    });
    setStarted(true);
  } catch (err) {
    console.error("Failed to start workout", err);
  }
};

const stopWorkout = async () => {
  try {
    await fetch("http://127.0.0.1:5002/stop_counter", {
      method: "POST",
    });
    setStarted(false);
  } catch (err) {
    console.error("Failed to stop workout", err);
  }
};




  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} /> Back to Dashboard
        </button>

        <div className="flex items-center gap-2 bg-gray-900 px-4 py-2 rounded-full border border-gray-800">
          <div
            className={`w-2 h-2 ${
              started ? "bg-green-500 animate-pulse" : "bg-gray-600"
            } rounded-full`}
          />
          <span className="text-sm font-medium">
            {started ? "AI Detection Active" : "Camera Ready"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Camera + Feedback */}
        <div className="lg:col-span-2 space-y-6">
          {/* Camera Card */}
          <div className="relative aspect-video bg-gray-900 rounded-3xl border border-gray-800 overflow-hidden flex items-center justify-center shadow-2xl">
            {!started ? (
              <div className="text-center p-8">
                <Camera size={64} className="text-gray-700 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">
                  Stand 1–2 meters away. Ensure full body is visible.
                </p>
                <button
                  onClick={startWorkout}
                  className="px-8 py-3 bg-purple-600 rounded-xl font-bold hover:bg-purple-500 transition-all flex items-center gap-2 mx-auto"
                >
                 <Play size={18} fill="white" /> Start Workout
                </button>

              </div>
            ) : (
              <>
                {/* AI VIDEO STREAM */}
                <img
                  src="http://localhost:5002/video_feed"
                  crossOrigin="anonymous"
                  alt="AI Pose Detection"
                  className="w-full h-full object-cover"
                />

                {/* Rep Counter */}
                <div className="absolute bottom-6 right-6 bg-black/80 backdrop-blur-md p-6 rounded-2xl border border-gray-700 text-center min-w-[120px]">
                  <h4 className="text-4xl font-black text-purple-500">
                    {reps}
                  </h4>
                  <p className="text-xs text-gray-400 uppercase tracking-widest">
                    of 15 Reps
                  </p>
                </div>

                {/* Posture Score */}
                <div className="absolute top-6 right-6 bg-green-500/10 border border-green-500/50 px-4 py-2 rounded-xl backdrop-blur-md">
                  <span className="text-green-500 font-bold text-sm">
                    Posture: {postureScore}%
                  </span>
                </div>
              </>
            )}
          </div>

          {/* AI Feedback */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700 flex items-center gap-4">
            {started && (
  <button
    onClick={stopWorkout}
    className="ml-auto px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-bold transition-all"
  >
    Stop Workout
  </button>
)}

            <div className="bg-purple-500/20 p-3 rounded-xl">
              <Info className="text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-purple-400 font-bold uppercase tracking-wider">
                AI Feedback
              </p>
              <p className="text-lg text-gray-200">{aiFeedback}</p>

            </div>
          </div>
        </div>

        {/* Right: Exercise Info */}
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800">
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4">
              Current Exercise
            </h3>
            <h2 className="text-2xl font-bold mb-4">Bicep Curls</h2>
            <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-purple-500 h-full transition-all duration-500"
                style={{ width: `${(reps / 15) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800">
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4">
              Guidelines
            </h3>
            <ul className="space-y-4">
              {[
  "Keep elbow close to body",
  "Fully extend arm at bottom",
  "Curl until biceps contract"
]
.map((step, i) => (
                <li key={i} className="flex gap-4 text-sm text-gray-300">
                  <span className="w-6 h-6 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Workout;
