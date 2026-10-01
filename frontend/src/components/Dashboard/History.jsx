import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';

const History = () => {
  const navigate = useNavigate();
  const historyData = [
    { date: "Oct 24, 2023", exercise: "Full Body HIIT", duration: "45 min", status: "Completed" },
    { date: "Oct 22, 2023", exercise: "Chest & Triceps", duration: "50 min", status: "Completed" },
    { date: "Oct 21, 2023", exercise: "Leg Day", duration: "60 min", status: "Completed" }
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 mb-8"><ArrowLeft size={20}/> Back</button>
      <h1 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Workout History</h1>
      
      <div className="space-y-4">
        {historyData.map((h, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">{h.date}</p>
              <h3 className="text-lg font-bold">{h.exercise}</h3>
              <p className="text-xs text-purple-400">{h.duration}</p>
            </div>
            <div className="flex items-center gap-2 text-green-500 font-bold">
              <CheckCircle size={18}/> {h.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;