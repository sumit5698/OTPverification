import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContent = createContext();

const AppContextProvider = ({ children }) => {
  const backendUrl = "https://otpverification-api.onrender.com";
  
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // ✅ Global axios configuration (एक बार ही)
  useEffect(() => {
    axios.defaults.baseURL = backendUrl;
    axios.defaults.withCredentials = true; // ✅ With credentials
    axios.defaults.timeout = 10000; // ✅ Increase timeout
  }, []);

  const getAuthState = async () => {
    try {
      console.log("🔄 Checking authentication from:", `${backendUrl}/api/auth/is-auth`);
      
      // ✅ Simple request without extra config
      const { data } = await axios.get('/api/auth/is-auth');

      console.log("✅ Auth response:", data);

      if (data.success && data.authenticated) {
        setIsLoggedin(true);
        await getUserData(); // ✅ Wait for user data
      } else {
        setIsLoggedin(false);
        setUserData(null);
      }

    } catch (error) {
      console.error("❌ Auth check error:", error);
      
      // ✅ Specific error handling
      if (error.response?.status === 401) {
        console.log("User is not logged in");
        setIsLoggedin(false);
        setUserData(null);
      } 
      else if (error.code === 'ECONNABORTED') {
        console.log("Request timeout - server slow");
        toast.warn("Server is taking time to respond");
      }
      else if (error.message.includes("Network Error") || error.message.includes("CORS")) {
        console.log("Network/CORS error - checking local storage");
        // Check if user data exists in localStorage
        const localUser = localStorage.getItem('user');
        if (localUser) {
          setUserData(JSON.parse(localUser));
          setIsLoggedin(true);
        } else {
          setIsLoggedin(false);
        }
      }
      else {
        console.error("Other error:", error.message);
        setIsLoggedin(false);
        setUserData(null);
      }
    } finally {
      setLoading(false);
      setAuthChecked(true);
    }
  };

  useEffect(() => {
    getAuthState();
  }, []);

  const getUserData = async () => {
    try {
      const { data } = await axios.get('/api/user/data');

      if (data.success && data.userData) {
        setUserData(data.userData);
        // ✅ Store in localStorage for offline access
        localStorage.setItem('user', JSON.stringify(data.userData));
      } else {
        setIsLoggedin(false);
        localStorage.removeItem('user');
      }

    } catch (error) {
      console.error("Get user data error:", error);
      setIsLoggedin(false);
      localStorage.removeItem('user');
    }
  };

  // ✅ Logout function (context में add करें)
  const logout = async () => {
    try {
      await axios.get('/api/auth/logout');
      setIsLoggedin(false);
      setUserData(null);
      localStorage.removeItem('user');
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      // Force logout anyway
      setIsLoggedin(false);
      setUserData(null);
      localStorage.removeItem('user');
      toast.success("Logged out");
    }
  };

  const value = {
    backendUrl,
    isLoggedin,
    setIsLoggedin,
    userData,
    setUserData,
    getUserData,
    loading,
    getAuthState,
    authChecked,
    logout, // ✅ Add logout to context
  };

  return (
    <AppContent.Provider value={value}>
      {children}
    </AppContent.Provider>
  );
};

export default AppContextProvider;