// import React from 'react';
// import { useNavigate } from 'react-router-dom';

// const Navbar = () => {
//   const navigate = useNavigate();

//   return (
//     <nav className="flex items-center justify-between px-6 py-4 bg-black/50 backdrop-blur-md sticky top-0 z-50 border-b border-gray-800">
//       {/* Logo */}
//       <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
//         <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg">
//           <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
//           </svg>
//         </div>
//         <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
//           FitAI
//         </span>
//       </div>

//       {/* Navigation Links (Hidden on mobile) */}
//       <div className="hidden md:flex items-center gap-8">
//         <a href="#features" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Features</a>
//         <a href="#pricing" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Pricing</a>
//       </div>

//       {/* CTA Button */}
//       <div className="flex items-center gap-4">
//         <button 
//           onClick={() => navigate('/login')}
//           className="text-white font-medium hover:text-purple-400 transition-colors"
//         >
//           Login
//         </button>
//         <button 
//           onClick={() => navigate('/login')} // Assuming Get Started goes to Login/Signup
//           className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-5 py-2 rounded-full font-bold transition-all transform hover:scale-105 shadow-lg shadow-purple-900/20"
//         >
//           Get Started
//         </button>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;