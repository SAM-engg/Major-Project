


import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Dumbbell, Activity, ArrowRight, Menu, X, 
  CheckCircle2, ShieldAlert, Wallet, Video, Zap, Sparkles,
  Users, HelpCircle, Heart, Globe, Settings, PlayCircle,
  BarChart3, Eye, Timer
} from "lucide-react";

const FeatureBlock = ({ title, text, imageUrl, isLeft }) => (
  <div className={`flex flex-col ${isLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-10 lg:gap-16 py-16 lg:py-24 border-b border-[#1F2937]/50 last:border-0`}>
    <div className="flex-1 space-y-6 text-center lg:text-left">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7C3AED]/10 border border-[#7C3AED]/30 text-[#7C3AED] text-[10px] font-bold uppercase tracking-widest">
        <Sparkles size={12} /> AI Intelligence
      </div>
      <h3 className="text-3xl md:text-4xl font-bold text-[#E5E7EB] leading-tight tracking-tight">
        {title}
      </h3>
      <p className="text-[#9CA3AF] text-base md:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
        {text}
      </p>
      <ul className="flex flex-wrap justify-center lg:justify-start gap-4">
        {['Real-time', 'Zero latency', 'Precision'].map((item, idx) => (
          <li key={idx} className="flex items-center gap-2 text-[#22C55E] font-semibold text-xs uppercase tracking-wider">
            <CheckCircle2 size={14} /> {item}
          </li>
        ))}
      </ul>
    </div>
    
    <div className="flex-1 w-full max-w-md lg:max-w-none flex justify-center relative group">
      <div className="absolute -inset-2 bg-gradient-to-r from-[#7C3AED]/20 to-[#22C55E]/20 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-700"></div>
      <div className="w-full aspect-video lg:aspect-square bg-[#121826] rounded-2xl md:rounded-[2rem] border border-[#1F2937] flex items-center justify-center shadow-xl relative overflow-hidden">
        <img src={imageUrl} alt={title} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(124,58,237,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(124,58,237,0.1)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,black,transparent)]"></div>
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#7C3AED] to-transparent animate-scan opacity-50"></div>
        <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#7C3AED]/50"></div>
        <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#22C55E]/50"></div>
        <div className="relative z-10 bg-[#0B0F14]/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2 shadow-2xl">
          <Activity size={16} className="text-[#22C55E] animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest">System Active</span>
        </div>
      </div>
    </div>
  </div>
);

const LandingPage = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#0B0F14] font-sans text-[#E5E7EB] selection:bg-[#7C3AED]/50 overflow-x-hidden">
      
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-72 md:w-[500px] h-72 md:h-[500px] bg-[#7C3AED]/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/4 w-64 md:w-[400px] h-64 md:h-[400px] bg-[#22C55E]/5 rounded-full blur-[100px]"></div>
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 ${isScrolled ? 'py-3 bg-[#0B0F14]/90 backdrop-blur-md border-b border-[#1F2937]' : 'py-6 bg-transparent'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 md:px-10">
          <div className="flex items-center gap-2 text-xl md:text-2xl font-bold tracking-tight cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-[#7C3AED] rounded-lg flex items-center justify-center shadow-lg shadow-[#7C3AED]/20">
              <Dumbbell size={20} className="text-white" />
            </div>
            <span>FIT<span className="text-[#7C3AED]">AI</span></span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => navigate("/login")} className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] hover:text-white transition-all">Login</button>
            <button 
              onClick={() => navigate("/demo")}
              className="px-6 py-2.5 bg-[#7C3AED] text-white hover:bg-[#6D28D9] rounded-full font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2"
            >
              <PlayCircle size={16} /> Demo Session
            </button>
          </div>

          <button className="md:hidden p-2 text-[#9CA3AF]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={28}/> : <Menu size={28}/>}
          </button>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="relative pt-40 md:pt-56 pb-20 md:pb-32 px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-[#121826] border border-[#1F2937] px-4 py-1.5 rounded-full mb-8">
               <span className="flex h-2 w-2 rounded-full bg-[#22C55E] animate-pulse"></span>
               <span className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">AI Engine V2.0 Live</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 tracking-tight">
              Perfect your form. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#22C55E]">Elevate your results.</span>
            </h1>
            <p className="text-base md:text-xl text-[#9CA3AF] mb-10 max-w-2xl mx-auto">
              The AI fitness coach that lives in your browser. Real-time skeletal tracking, instant feedback, and professional-grade training from home.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button onClick={() => navigate("/signup")} className="w-full sm:w-auto px-10 py-4 bg-[#7C3AED] hover:bg-[#6D28D9] rounded-xl font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                Get Started <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </section>

        {/* Feature Blocks */}
        <section className="py-20 max-w-7xl mx-auto px-6">
          <FeatureBlock 
            isLeft={true}
            title="Skeletal Vision Technology"
            text="High-precision mapping of your joints to detect incorrect posture immediately. Our AI helps you avoid injury and maximize every rep."
            imageUrl="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1200"
          />

          <FeatureBlock 
            isLeft={false}
            title="Personalized Training & Fitness Guidance"
            text="No more guessing. Workouts adapt based on your unique height, weight, and fitness goals—whether it's muscle gain or fat loss. Your plan evolves with your progress."
            imageUrl="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=1200"
          />

          <FeatureBlock 
            isLeft={true}
            title="Hands-Free Voice Control"
            text="Focus on your workout, not your mouse. Use simple voice commands to pause, start, or switch exercises effortlessly while staying in the zone."
            imageUrl="https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&q=80&w=1200"
          />
        </section>

        {/* Why Choose FitAI */}
        <section className="py-20 px-6 bg-[#0E131C]">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 p-10 md:p-20 bg-gradient-to-br from-[#121826] to-[#0B0F14] rounded-[3rem] border border-[#1F2937]">
            <div className="md:w-1/2 space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Why Choose <span className="text-[#7C3AED]">FitAI</span>?</h2>
              <p className="text-[#9CA3AF] text-lg leading-relaxed">
                We combine professional sports science with cutting-edge computer vision to provide an experience that was once only available to elite athletes.
              </p>
              <button onClick={() => navigate("/why-fitai")} className="flex items-center gap-2 text-[#7C3AED] font-bold uppercase tracking-widest text-xs hover:gap-4 transition-all">
                Learn the Science <ArrowRight size={16}/>
              </button>
            </div>
            <div className="md:w-1/2 grid grid-cols-2 gap-4">
              <div className="p-6 bg-[#0B0F14] rounded-2xl border border-[#1F2937] text-center">
                <h3 className="text-2xl font-bold text-white mb-2">98%</h3>
                <p className="text-[#9CA3AF] text-[10px] uppercase font-bold tracking-widest">Accuracy Rate</p>
              </div>
              <div className="p-6 bg-[#0B0F14] rounded-2xl border border-[#1F2937] text-center">
                <h3 className="text-2xl font-bold text-white mb-2">24/7</h3>
                <p className="text-[#9CA3AF] text-[10px] uppercase font-bold tracking-widest">AI Coaching</p>
              </div>
            </div>
          </div>
        </section>

        {/* The FitAI Difference */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto bg-[#121826] border border-[#1F2937] rounded-3xl p-8 md:p-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-10 tracking-tight text-center">The <span className="text-[#22C55E]">FitAI</span> Difference</h2>
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              {[
                { icon: <ShieldAlert className="text-[#EF4444]" />, title: "Safety First", desc: "Detects rounding backs and locked knees instantly to prevent long-term injury." },
                { icon: <Zap className="text-[#7C3AED]" />, title: "Adaptive Growth", desc: "Our AI adjusts rep counts and difficulty based on your real-time fatigue levels." },
                { icon: <Wallet className="text-[#22C55E]" />, title: "Cost Effective", desc: "Get world-class personal training quality without the expensive hourly rates." },
                { icon: <Video className="text-blue-500" />, title: "Privacy Focused", desc: "All video processing happens on your local device. We never store your camera feed." },
                { icon: <Activity className="text-orange-400" />, title: "Real-time Analytics", desc: "Get a detailed breakdown of your range of motion after every single set." },
                { icon: <Globe className="text-emerald-400" />, title: "Global Access", desc: "Join workouts and challenges with a global community from anywhere in the world." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="shrink-0 bg-[#0B0F14] p-3 rounded-xl border border-[#1F2937] group-hover:border-[#7C3AED]/50 transition-colors">{item.icon}</div>
                  <div>
                    <h4 className="font-bold text-base mb-1">{item.title}</h4>
                    <p className="text-[#9CA3AF] text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* NEW SECTION: LIVE MOTION DASHBOARD (REPLACING FINAL CTA) */}
        <section className="py-24 px-6 border-t border-[#1F2937]/30">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-16">
               <div className="flex-1 space-y-6">
                  <div className="w-12 h-12 bg-[#7C3AED]/20 rounded-2xl flex items-center justify-center">
                    <Eye className="text-[#7C3AED]" size={24} />
                  </div>
                  <h2 className="text-4xl font-bold tracking-tight">Full Body <span className="text-[#7C3AED]">Motion Analysis</span></h2>
                  <p className="text-[#9CA3AF] text-lg leading-relaxed">
                    Our interface transforms your workout into a data-driven experience. View real-time joint angles, center of mass tracking, and velocity measurements in one unified dashboard.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm font-semibold text-white/80">
                      <CheckCircle2 size={18} className="text-[#22C55E]" /> 3D Skeleton Reconstruction
                    </div>
                    <div className="flex items-center gap-3 text-sm font-semibold text-white/80">
                      <CheckCircle2 size={18} className="text-[#22C55E]" /> Range of Motion (ROM) Heatmaps
                    </div>
                  </div>
               </div>

               <div className="flex-1 w-full bg-[#121826] border border-[#1F2937] rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl">
                  <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">Live Stream Tracking</span>
                    </div>
                    <div className="flex gap-2">
                       <div className="px-3 py-1 bg-[#0B0F14] border border-[#1F2937] rounded-lg text-[10px] font-bold text-[#7C3AED]">FPS: 60</div>
                    </div>
                  </div>

                  <div className="space-y-8">
                     <div className="h-2 bg-[#1F2937] rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#7C3AED] to-[#22C55E] w-3/4 animate-pulse"></div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-[#0B0F14] rounded-2xl border border-[#1F2937]">
                           <p className="text-[10px] font-bold text-[#9CA3AF] uppercase mb-1">Shoulder Extension</p>
                           <p className="text-2xl font-bold text-white">162°</p>
                        </div>
                        <div className="p-4 bg-[#0B0F14] rounded-2xl border border-[#1F2937]">
                           <p className="text-[10px] font-bold text-[#9CA3AF] uppercase mb-1">Spine Alignment</p>
                           <p className="text-2xl font-bold text-[#22C55E]">Optimal</p>
                        </div>
                     </div>
                     <div className="flex justify-center py-4">
                        <BarChart3 size={48} className="text-[#7C3AED]/30" />
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </section>
      </main>

      {/* Enhanced Footer */}
      <footer className="pt-20 pb-10 px-6 border-t border-[#1F2937] bg-[#0B0F14]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-2 text-xl font-bold mb-6">
                <div className="w-8 h-8 bg-[#7C3AED] rounded-lg flex items-center justify-center"><Dumbbell size={18} className="text-white" /></div>
                <span>FITAI</span>
              </div>
              <p className="text-[#9CA3AF] text-sm max-w-xs mb-6">The future of personal training. High-precision AI coaching accessible to everyone, everywhere.</p>
            </div>
            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-6">Product</h4>
              <ul className="space-y-4 text-sm text-[#6B7280]">
                <li><a href="#" className="hover:text-[#7C3AED] transition-colors">AI Form Correction</a></li>
                <li><a href="#" className="hover:text-[#7C3AED] transition-colors">Diet Planner</a></li>
                <li><a href="#" className="hover:text-[#7C3AED] transition-colors">Voice Expert</a></li>
                <li><a href="#" className="hover:text-[#7C3AED] transition-colors">Demo Workout</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-6">Community</h4>
              <ul className="space-y-4 text-sm text-[#6B7280]">
                <li><a href="#" className="hover:text-[#7C3AED] transition-colors">Discord Group</a></li>
                <li><a href="#" className="hover:text-[#7C3AED] transition-colors">Success Stories</a></li>
                <li><a href="#" className="hover:text-[#7C3AED] transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-[#7C3AED] transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-6">Legal</h4>
              <ul className="space-y-4 text-sm text-[#6B7280]">
                <li><a href="#" className="hover:text-[#7C3AED] transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-[#7C3AED] transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-[#7C3AED] transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-10 border-t border-[#1F2937] text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">
              <p>© {new Date().getFullYear()} FITAI LABS • ALL RIGHTS RESERVED</p>
              <div className="flex gap-6">
                <a href="#" className="hover:text-white transition-colors">Instagram</a>
                <a href="#" className="hover:text-white transition-colors">Twitter</a>
                <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
              </div>
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0% { top: 0%; }
          100% { top: 100%; }
        }
        .animate-scan {
          animation: scan 3s linear infinite;
        }
      `}} />
    </div>
  );
};

export default LandingPage;