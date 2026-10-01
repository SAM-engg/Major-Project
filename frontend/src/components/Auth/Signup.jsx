import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Eye, EyeOff } from "lucide-react";

const Signup = () => {
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showRePass, setShowRePass] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    rePassword: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.rePassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.msg || "Registration failed");
        return;
      }

      // Save JWT
      navigate("/login");
    } catch (err) {
      setError("Server error. Try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#121826] border border-gray-800 p-8 rounded-[2.5rem] shadow-2xl relative">

        {/* Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-600/10 rounded-full blur-[80px]" />

        <h2 className="text-3xl font-bold text-white text-center mb-2">
          Create Account
        </h2>

        <p className="text-gray-400 text-center mb-6">
          Join the FitAI revolution
        </p>

        {error && (
          <div className="mb-4 flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-xl">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* NAME */}
          <input
            type="text"
            placeholder="Full Name"
            required
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-white
                       focus:border-purple-500 outline-none transition-all"
          />

          {/* EMAIL */}
          <input
            type="email"
            placeholder="Email Address"
            required
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-white
                       focus:border-purple-500 outline-none transition-all"
          />

          {/* PASSWORD */}
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              placeholder="Password"
              required
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-white
                         focus:border-purple-500 outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="relative">
            <input
              type={showRePass ? "text" : "password"}
              placeholder="Re-enter Password"
              required
              onChange={(e) =>
                setFormData({ ...formData, rePassword: e.target.value })
              }
              className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-white
                         focus:border-purple-500 outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowRePass(!showRePass)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              {showRePass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600
                       text-white font-bold py-3 rounded-xl hover:scale-[1.02]
                       transition-all shadow-lg shadow-purple-500/20"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center text-gray-500 mt-6 text-sm">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-purple-400 cursor-pointer font-bold"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Signup;
