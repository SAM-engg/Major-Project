

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Play, Camera, Mic, 
  Zap, Sparkles, CheckCircle2, 
  ShieldCheck, Cpu, Volume2 
} from 'lucide-react';

// IMPORT THE VIDEO HERE
import demoVideo from "../../assets/AI_Fitness_App_Demo_Animation (1).mp4"; 

const DemoPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Camera className="text-[#7C3AED]" size={24} />,
      title: "Optimal Setup",
      desc: "Place your device at waist height. Ensure you have 2 meters of space so the AI can see you head to toe."
    },
    {
      icon: <Mic className="text-[#22C55E]" size={24} />,
      title: "Voice Commands",
      desc: "FitAI is hands-free. Say 'Start' to begin and 'Pause' if you need a break without touching your screen."
    },
    {
      icon: <Zap className="text-orange-400" size={24} />,
      title: "Real-time Correction",
      desc: "The AI tracks 33 key body points. The skeletal overlay turns red if your form is off."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#E5E7EB] font-sans selection:bg-[#7C3AED]/30 overflow-y-auto">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-[#7C3AED]/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-[#22C55E]/5 rounded-full blur-[120px]"></div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 p-6 md:p-8 bg-[#0B0F14]/80 backdrop-blur-lg border-b border-white/5 flex items-center justify-between">
        <button 
          onClick={() => navigate('/')} 
          className="group flex items-center gap-2 text-[#9CA3AF] hover:text-white transition-all bg-[#121826]/80 px-4 py-2 rounded-xl border border-[#1F2937]"
        >
          <ArrowLeft size={18} /> 
          <span className="text-xs font-bold uppercase tracking-widest">Back</span>
        </button>
        
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#7C3AED] rounded-lg flex items-center justify-center shadow-lg shadow-[#7C3AED]/20">
              <Dumbbell size={18} className="text-white" />
            </div>
            <span className="font-black tracking-tighter text-xl italic">FIT<span className="text-[#7C3AED]">AI</span></span>
        </div>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        {/* Hero Header */}
        <section className="text-center mb-16 animate-[fadeIn_0.8s_ease-out_forwards]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7C3AED]/10 border border-[#7C3AED]/30 text-[#7C3AED] text-[10px] font-bold uppercase tracking-widest mb-6">
            <Sparkles size={12} /> Live Motion Inference
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-tight">
            THE FUTURE OF <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#22C55E]">TRAINING</span>
          </h1>
          <p className="text-[#9CA3AF] max-w-2xl mx-auto text-lg md:text-xl font-medium">
            Experience real-time form correction. Turn up your volume to hear your AI coach.
          </p>
        </section>

        {/* VIDEO PLAYER SECTION */}
        <section className="relative group max-w-5xl mx-auto mb-32 transition-transform duration-500 hover:scale-[1.01]">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#7C3AED] via-[#22C55E] to-[#7C3AED] rounded-[2rem] blur-xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          
          <div className="relative bg-black rounded-[2rem] border border-[#1F2937] overflow-hidden shadow-2xl">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
              <Volume2 size={14} className="text-[#22C55E] animate-pulse" />
              <span className="text-[10px] font-bold text-white uppercase tracking-widest">Audio Enabled</span>
            </div>

            <div className="w-full aspect-video relative">
              <video 
                src={demoVideo}
                className="w-full h-full object-cover"
                autoPlay 
                loop 
                playsInline
                muted={false}
              >
                Your browser does not support the video tag.
              </video>

              {/* HUD OVERLAY */}
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 bg-gradient-to-b from-black/20 via-transparent to-black/60">
                <div className="flex justify-between items-start">
                  <div className="bg-black/70 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-3 mb-1">
                      <Cpu size={18} className="text-[#7C3AED]" />
                      <span className="text-[12px] font-bold uppercase tracking-tighter text-white">Neural Stream</span>
                    </div>
                    <div className="text-[14px] font-mono text-[#22C55E]">Scanning Skeletal Map...</div>
                  </div>
                  <div className="bg-[#7C3AED] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                    Tracking Active
                  </div>
                </div>

                <div className="flex justify-center mb-4">
                  <div className="bg-black/90 backdrop-blur-2xl border border-white/20 px-8 py-6 rounded-[2.5rem] flex items-center gap-12 shadow-2xl">
                    <div className="text-center">
                      <p className="text-[10px] text-[#9CA3AF] uppercase font-bold tracking-widest mb-1">Total Reps</p>
                      <p className="text-4xl font-black text-white">24</p>
                    </div>
                    <div className="h-12 w-[1px] bg-white/10"></div>
                    <div className="text-center">
                      <p className="text-[10px] text-[#9CA3AF] uppercase font-bold tracking-widest mb-1">Form Accuracy</p>
                      <p className="text-4xl font-black text-[#22C55E]">99%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-4 text-center text-[#6B7280] text-sm italic">Note: Browser policies may require a click to start audio.</p>
        </section>

        {/* FEATURES GRID SECTION */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {features.map((feature, idx) => (
            <div 
              key={idx}
              className="p-8 bg-[#121826]/40 border border-[#1F2937] rounded-[2.5rem] hover:bg-[#121826]/60 transition-all duration-300 border-t-white/5"
            >
              <div className="w-12 h-12 bg-[#0B0F14] rounded-2xl flex items-center justify-center border border-[#1F2937] mb-6 shadow-inner">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                {feature.title}
                <CheckCircle2 size={16} className="text-[#22C55E]" />
              </h3>
              <p className="text-[#9CA3AF] text-sm leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </section>

        <section className="bg-gradient-to-b from-[#7C3AED]/10 to-transparent p-12 rounded-[3rem] border border-[#7C3AED]/20 text-center">
          <ShieldCheck className="mx-auto text-[#22C55E] mb-4" size={40} />
          <h2 className="text-4xl font-bold mb-6">Ready for your first session?</h2>
          <button 
            onClick={() => navigate('/signup')}
            className="px-12 py-5 bg-[#7C3AED] hover:bg-[#6D28D9] rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-[#7C3AED]/30"
          >
            Get Started Now
          </button>
        </section>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        html { scroll-behavior: smooth; }
      `}} />
    </div>
  );
};

const Dumbbell = ({ size, className }) => (
  <svg 
    width={size} height={size} viewBox="0 0 24 24" fill="none" 
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" 
    strokeLinejoin="round" className={className}
  >
    <path d="m6.5 6.5 11 11"/><path d="m11.8 5.8 5.2 5.2"/><path d="m5.8 11.8 5.2 5.2"/><path d="M5.8 5.8 3 8.6a2 2 0 0 0 0 2.8l2.4 2.4a2 2 0 0 0 2.8 0l8.8-8.8a2 2 0 0 0 0-2.8l-2.4-2.4a2 2 0 0 0-2.8 0L9 5.8"/><path d="m15.4 15.4 2.8 2.8a2 2 0 0 1 0 2.8l-2.4 2.4a2 2 0 0 1-2.8 0l-8.8-8.8a2 2 0 0 1 0-2.8l2.4-2.4a2 2 0 0 1 2.8 0l2.8 2.8"/>
  </svg>
);

export default DemoPage;