import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // ---------------- LOGIN ----------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.msg || "Invalid credentials");
        return;
      }

      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (err) {
      setError("Server error. Try again later.");
    }
  };

  // ------------- FORGOT PASSWORD -------------
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const res = await fetch(
        "http://localhost:5000/api/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.msg || "Failed to send reset link");
        return;
      }

      setMessage("Reset link generated. Check backend console.");
      setIsForgot(false);
    } catch (err) {
      setError("Server error. Try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#121826] border border-gray-800 p-8 rounded-[2.5rem] shadow-2xl relative">

        {/* Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-600/10 rounded-full blur-[80px]" />

        <h2 className="text-3xl font-bold text-white text-center mb-2">
          {isForgot ? "Reset Password" : "Welcome Back"}
        </h2>

        <p className="text-gray-400 text-center mb-6">
          {isForgot
            ? "Enter your email to receive reset link"
            : "Login to your FitAI coach"}
        </p>

        {error && (
          <div className="mb-4 flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-xl">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {message && (
          <div className="mb-4 text-green-400 bg-green-400/10 p-3 rounded-xl">
            {message}
          </div>
        )}

        <form
          onSubmit={isForgot ? handleForgotPassword : handleLogin}
          className="space-y-4"
        >
          {/* EMAIL */}
          <input
            type="email"
            placeholder="Email Address"
            required
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-white
                       focus:border-purple-500 outline-none transition-all"
          />

          {/* PASSWORD */}
          {!isForgot && (
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                required
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-white
                           focus:border-purple-500 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          )}

          {/* BUTTON */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600
                       text-white font-bold py-3 rounded-xl hover:scale-[1.02]
                       transition-all shadow-lg shadow-purple-500/20"
          >
            {isForgot ? "Send Reset Link" : "Login"}
          </button>
        </form>

        {/* FOOTER LINKS */}
        <div className="text-center text-gray-500 mt-6 text-sm">
          {isForgot ? (
            <span
              onClick={() => setIsForgot(false)}
              className="text-purple-400 cursor-pointer font-bold"
            >
              Back to Login
            </span>
          ) : (
            <>
              <span
                onClick={() => setIsForgot(true)}
                className="text-purple-400 cursor-pointer font-bold block mb-2"
              >
                Forgot password?
              </span>

              Don’t have an account?{" "}
              <span
                onClick={() => navigate("/signup")}
                className="text-purple-400 cursor-pointer font-bold"
              >
                Sign up
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
