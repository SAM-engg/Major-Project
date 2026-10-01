import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 🔥 CLEAR EVERYTHING RELATED TO USER & AUTH
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userAvatar");
    localStorage.removeItem("userGoal");
    localStorage.removeItem("userHeight");
    localStorage.removeItem("userWeight");
    localStorage.removeItem("userAge");
    localStorage.removeItem("userGender");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userExtra");

    // 🚀 REDIRECT TO LOGIN
    navigate("/login", { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F14]">
      <p className="text-gray-400 text-sm animate-pulse">
        Logging out securely...
      </p>
    </div>
  );
};

export default Logout;
