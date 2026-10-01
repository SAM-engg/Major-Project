import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Cpu, Zap, Target, Award, ArrowLeft, BarChart3 } from 'lucide-react';

const WhyChooseUs = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: <Cpu className="text-[#7C3AED]" size={32} />,
      title: "Advanced AI Skeletal Tracking",
      desc: "Unlike standard fitness apps, we use real-time computer vision to track 33 points on your body, ensuring 99% accuracy in form detection."
    },
    {
      icon: <ShieldCheck className="text-[#22C55E]" size={32} />,
      title: "Injury Prevention",
      desc: "Our system flags dangerous movements—like back rounding during deadlifts—before they lead to chronic pain or injury."
    },
    {
      icon: <Target className="text-blue-400" size={32} />,
      title: "Precision Guidance",
      desc: "Get audio and visual cues on exactly how to adjust your joints to hit the target muscle groups effectively."
    },
    {
      icon: <BarChart3 className="text-orange-400" size={32} />,
      title: "Data-Driven Progress",
      desc: "Every rep is analyzed for range of motion, tempo, and consistency, giving you professional athlete-level analytics."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B0F14] text-white p-6 md:p-12 font-sans">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-[#9CA3AF] hover:text-[#7C3AED] transition-all mb-12"
      >
        <ArrowLeft size={20} /> Back to Home
      </button>

      <div className="max-w-6xl mx-auto">
        <header className="mb-20 text-center lg:text-left">
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter">
            THE <span className="text-[#7C3AED]">FITAI</span> ADVANTAGE
          </h1>
          <p className="text-[#9CA3AF] text-xl max-w-2xl leading-relaxed">
            Standard apps just show you videos. FitAI watches you back. We bridge the gap between a human personal trainer and digital convenience.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {benefits.map((item, idx) => (
            <div key={idx} className="bg-[#121826] border border-[#1F2937] p-8 rounded-[2rem] hover:border-[#7C3AED]/50 transition-all group">
              <div className="mb-6 p-4 bg-[#0B0F14] w-fit rounded-2xl border border-[#1F2937] group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
              <p className="text-[#9CA3AF] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#7C3AED] p-12 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-10">
          <div>
            <h2 className="text-3xl font-bold mb-2">Ready to see it in action?</h2>
            <p className="text-purple-100">Experience the future of fitness technology today.</p>
          </div>
          <button 
            onClick={() => navigate('/demo')}
            className="px-10 py-4 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-black hover:text-white transition-all"
          >
            Watch Demo
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhyChooseUs;