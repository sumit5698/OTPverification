import { createContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContent = createContext();

const AppContextProvider = ({ children }) => {
  const backendUrl = "https://otpverification-api.onrender.com";
  
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // ✅ FIXED: createAxiosInstance WITHOUT Origin header
  const createAxiosInstance = useCallback(() => {
    console.log("🔧 Creating axios instance for:", backendUrl);
    
    return axios.create({
      baseURL: backendUrl,
      withCredentials: true, // ✅ IMPORTANT: This sends cookies
      timeout: 30000, // ✅ 30 seconds timeout
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
        // ❌ REMOVED: 'Origin' header - browser automatically sets it
      }
    });
  }, [backendUrl]);

  // ✅ Global axios configuration
  useEffect(() => {
    console.log("🌐 Initializing axios configuration");
    
    // Set default configuration
    axios.defaults.baseURL = backendUrl;
    axios.defaults.withCredentials = true;
    axios.defaults.timeout = 30000;
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    axios.defaults.headers.common['Accept'] = 'application/json';
    
  }, [backendUrl]);

  // ✅ getUserData function
  const getUserData = useCallback(async () => {
    try {
      console.log("📡 Fetching user data...");
      const axiosInstance = createAxiosInstance();
      
      const { data } = await axiosInstance.get('/api/user/data');
      console.log("👤 User data response:", data);

      if (data.success && data.userData) {
        setUserData(data.userData);
        localStorage.setItem('user', JSON.stringify(data.userData));
        console.log("✅ User data loaded:", data.userData.email);
        return data.userData;
      } else {
        console.log("❌ No user data in response");
        setIsLoggedin(false);
        localStorage.removeItem('user');
        return null;
      }

    } catch (error) {
      console.error("❌ Get user data error:", error);
      
      if (error.response?.status === 401) {
        console.log("🔒 User not authenticated");
        setIsLoggedin(false);
        setUserData(null);
        localStorage.removeItem('user');
      }
      
      return null;
    }
  }, [createAxiosInstance]);

  const getAuthState = async () => {
    try {
      console.log("🔄 Checking authentication...");
      
      const axiosInstance = createAxiosInstance();
      const { data } = await axiosInstance.get('/api/auth/is-auth');
      
      console.log("✅ Auth response:", data);

      if (data.success && data.authenticated) {
        console.log("🎯 User is authenticated");
        setIsLoggedin(true);
        await getUserData();
      } else {
        console.log("🔒 User is NOT authenticated:", data.message);
        setIsLoggedin(false);
        setUserData(null);
        localStorage.removeItem('user');
        localStorage.removeItem('auth_token');
      }

    } catch (error) {
      console.error("❌ Auth check error:", error);
      
      // Special handling for timeout
      if (error.code === 'ECONNABORTED') {
        console.log("⏰ Request timeout - server might be slow");
        toast.warning("Server is taking longer than usual to respond");
      }
      
      if (error.message.includes("Network Error") || error.code === "ERR_NETWORK") {
        console.log("🔒 Trying localStorage fallback...");
        const localUser = localStorage.getItem('user');
        
        if (localUser) {
          console.log("📦 Found user data in localStorage");
          setUserData(JSON.parse(localUser));
          setIsLoggedin(true);
          return;
        }
      }
      
      setIsLoggedin(false);
      setUserData(null);
    } finally {
      setLoading(false);
      setAuthChecked(true);
    }
  };

  useEffect(() => {
    getAuthState();
  }, []);

  // ✅ Enhanced logout
  const logout = async () => {
    try {
      const axiosInstance = createAxiosInstance();
      await axiosInstance.get('/api/auth/logout');
      
      setIsLoggedin(false);
      setUserData(null);
      localStorage.removeItem('user');
      localStorage.removeItem('auth_token');
      
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggedin(false);
      setUserData(null);
      localStorage.removeItem('user');
      localStorage.removeItem('auth_token');
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
    logout,
    createAxiosInstance
  };

  return (
    <AppContent.Provider value={value}>
      {children}
    </AppContent.Provider>
  );
};

export default AppContextProvider;