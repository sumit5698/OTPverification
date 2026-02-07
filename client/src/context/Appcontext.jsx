import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContent = createContext();

const AppContextProvider = ({ children }) => {

  // ✅ Fix: Add default backend URL
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ Add loading state

  const getAuthState = async () => {
    try {
      console.log("🔄 Checking auth at:", `${backendUrl}/api/auth/is-auth`);
      
      // ✅ FIX: Added withCredentials: true
      const { data } = await axios.get(
        `${backendUrl}/api/auth/is-auth`,
        {
          withCredentials: true, // ✅ IMPORTANT: Send cookies
          timeout: 5000 // ✅ Timeout after 5 seconds
        }
      );

      console.log("✅ Auth response:", data);

      if (data.success && data.authenticated) {
        setIsLoggedin(true);
        getUserData(); // ✅ auth confirmed, now fetch user
      } else {
        setIsLoggedin(false);
        setUserData(null);
      }

    } catch (error) {
      console.error("❌ Auth check failed:", error.message);
      setIsLoggedin(false);
      setUserData(null);
      
      // Show error toast
      if (error.code === 'ERR_NETWORK') {
        toast.error("Cannot connect to server. Make sure backend is running on port 5000.");
      }
    } finally {
      setLoading(false); // ✅ Stop loading
    }
  };

  useEffect(() => {
    getAuthState();
  }, []);

  const getUserData = async () => {
    try {
      // ✅ FIX: Added withCredentials: true
      const { data } = await axios.get(
        `${backendUrl}/api/user/data`,
        {
          withCredentials: true // ✅ IMPORTANT: Send cookies
        }
      );

      if (data.success) {
        setUserData(data.userData);
      } else {
        toast.error(data.message);
        setIsLoggedin(false);
      }

    } catch (error) {
      console.error("❌ Get user data failed:", error.message);
      setIsLoggedin(false);
      setUserData(null);
    }
  };

  const value = {
    backendUrl,
    isLoggedin,
    setIsLoggedin,
    userData,
    setUserData,
    getUserData,
    loading, // ✅ Export loading state
    getAuthState, // ✅ Export so components can refresh auth
  };

  return (
    <AppContent.Provider value={value}>
      {children}
    </AppContent.Provider>
  );
};

export default AppContextProvider;