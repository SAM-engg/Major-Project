

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Save, LogOut, Camera } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // Initialize state from localStorage
  const [userData, setUserData] = useState({
    name: localStorage.getItem("userName") || "",
    goal: localStorage.getItem("userGoal") || "Fat Loss",
    height: localStorage.getItem("userHeight") || "170",
    weight: localStorage.getItem("userWeight") || "70",
    age: localStorage.getItem("userAge") || "",
    gender: localStorage.getItem("userGender") || "Male",
    frequency: localStorage.getItem("userFrequency") || "3-4 days/week",
    profilePic: localStorage.getItem("userAvatar") || null
  });

  // Handle Image Upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserData({ ...userData, profilePic: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!userData.name.trim()) {
      alert("Please enter your name");
      return;
    }

    // Save all fields to localStorage
    localStorage.setItem("userName", userData.name);
    localStorage.setItem("userGoal", userData.goal);
    localStorage.setItem("userHeight", userData.height);
    localStorage.setItem("userWeight", userData.weight);
    localStorage.setItem("userAge", userData.age);
    localStorage.setItem("userGender", userData.gender);
    localStorage.setItem("userFrequency", userData.frequency);
    if (userData.profilePic) {
      localStorage.setItem("userAvatar", userData.profilePic);
    }
    
    alert("Profile Updated Successfully!");
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#E5E7EB] p-6 md:p-10 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        
        {/* Navigation Header */}
        <div className="flex justify-between items-center mb-10">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="flex items-center gap-2 text-[#9CA3AF] hover:text-white transition-colors group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform"/> 
            <span className="font-medium uppercase tracking-widest text-xs">Back to Dashboard</span>
          </button>
          
          <button 
            onClick={() => { localStorage.clear(); navigate('/login'); }}
            className="flex items-center gap-2 text-[#6B7280] hover:text-[#EF4444] transition-colors text-xs font-bold uppercase"
          >
            <LogOut size={18}/> Logout
          </button>
        </div>

        <h1 className="text-4xl font-black mb-10 tracking-tight text-white text-center md:text-left">
          EDIT <span className="text-[#7C3AED]">PROFILE</span>
        </h1>

        <div className="bg-[#121826] border border-[#1F2937] rounded-[2.5rem] p-8 shadow-2xl">
          
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4 mb-10">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#0B0F14] shadow-2xl bg-[#0B0F14] flex items-center justify-center">
                {userData.profilePic ? (
                  <img src={userData.profilePic} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={60} className="text-[#1F2937]"/>
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current.click()}
                className="absolute bottom-1 right-1 bg-[#7C3AED] p-3 rounded-full border-4 border-[#121826] hover:scale-110 transition-transform shadow-lg"
              >
                <Camera size={18} className="text-white" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                accept="image/*"
              />
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black text-[#7C3AED] uppercase tracking-[0.2em]">Profile Picture</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest block mb-2 ml-1">Full Name</label>
                <input 
                  type="text"
                  className="w-full bg-[#0B0F14] border border-[#1F2937] rounded-2xl px-5 py-4 outline-none focus:border-[#7C3AED] transition-all text-white"
                  value={userData.name}
                  onChange={(e) => setUserData({...userData, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest block mb-2 ml-1">Height (cm)</label>
                  <input 
                    type="number"
                    className="w-full bg-[#0B0F14] border border-[#1F2937] rounded-2xl px-5 py-4 outline-none focus:border-[#7C3AED] text-white"
                    value={userData.height}
                    onChange={(e) => setUserData({...userData, height: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest block mb-2 ml-1">Weight (kg)</label>
                  <input 
                    type="number"
                    className="w-full bg-[#0B0F14] border border-[#1F2937] rounded-2xl px-5 py-4 outline-none focus:border-[#7C3AED] text-white"
                    value={userData.weight}
                    onChange={(e) => setUserData({...userData, weight: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest block mb-2 ml-1">Overall Fitness Goal</label>
                <select 
                  className="w-full bg-[#0B0F14] border border-[#1F2937] rounded-2xl px-5 py-4 outline-none focus:border-[#7C3AED] appearance-none text-white font-bold"
                  value={userData.goal}
                  onChange={(e) => setUserData({...userData, goal: e.target.value})}
                >
                  <option value="Fat Loss">🔥 Fat Loss</option>
                  <option value="Muscle Gain">💪 Muscle Gain</option>
                  <option value="Athleticism">⚡ Athleticism</option>
                  <option value="General Fitness">🧘 General Fitness</option>
                </select>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest block mb-2 ml-1">Age</label>
                  <input 
                    type="number"
                    placeholder="Ex: 24"
                    className="w-full bg-[#0B0F14] border border-[#1F2937] rounded-2xl px-5 py-4 outline-none focus:border-[#7C3AED] text-white"
                    value={userData.age}
                    onChange={(e) => setUserData({...userData, age: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest block mb-2 ml-1">Gender</label>
                  <select 
                    className="w-full bg-[#0B0F14] border border-[#1F2937] rounded-2xl px-4 py-4 outline-none focus:border-[#7C3AED] appearance-none text-white"
                    value={userData.gender}
                    onChange={(e) => setUserData({...userData, gender: e.target.value})}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest block mb-2 ml-1">Workout Frequency</label>
                <select 
                  className="w-full bg-[#0B0F14] border border-[#1F2937] rounded-2xl px-5 py-4 outline-none focus:border-[#7C3AED] appearance-none text-white"
                  value={userData.frequency}
                  onChange={(e) => setUserData({...userData, frequency: e.target.value})}
                >
                  <option value="1-2 days/week">1-2 days/week</option>
                  <option value="3-4 days/week">3-4 days/week</option>
                  <option value="5-6 days/week">5-6 days/week</option>
                  <option value="Everyday">Everyday</option>
                </select>
              </div>
            </div>
          </div>

          <button 
            onClick={handleSave}
            className="w-full py-5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-2xl font-black uppercase tracking-widest hover:shadow-[0_0_25px_rgba(124,58,237,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-10"
          >
            <Save size={20}/> Save Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;