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

  // ✅ getFrontendOrigin function
  const getFrontendOrigin = useCallback(() => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return "https://otpverification-nfgo.onrender.com";
  }, []);

  // ✅ Function to create axios instance with proper headers
  const createAxiosInstance = useCallback(() => {
    const frontendOrigin = getFrontendOrigin();
    
    return axios.create({
      baseURL: backendUrl,
      withCredentials: true,
      headers: {
        'Origin': frontendOrigin,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 10000
    });
  }, [getFrontendOrigin]);

  // ✅ Global axios configuration
  useEffect(() => {
    const axiosInstance = createAxiosInstance();
    
    // Set as default
    axios.defaults = axiosInstance.defaults;
    
    console.log("🌐 Frontend Origin:", getFrontendOrigin());
    console.log("🔗 Backend URL:", backendUrl);
    
  }, [createAxiosInstance, getFrontendOrigin]);

  // ✅ getUserData function - FIXED
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
        return data.userData; // Return user data
      } else {
        console.log("❌ No user data in response");
        setIsLoggedin(false);
        localStorage.removeItem('user');
        return null;
      }

    } catch (error) {
      console.error("❌ Get user data error:", error);
      
      // Check if it's a 401 error (unauthorized)
      if (error.response?.status === 401) {
        console.log("🔒 User not authenticated, clearing session");
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
      console.log("🍪 Current cookies:", document.cookie);
      
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
        
        // Clear localStorage if not authenticated
        localStorage.removeItem('user');
        localStorage.removeItem('auth_token');
      }

    } catch (error) {
      console.error("❌ Auth check error:", error);
      
      // Special handling for cookie issues
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
      
      // Clear all cookies
      document.cookie.split(";").forEach(cookie => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
      
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      // Force logout anyway
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
    getUserData, // ✅ Export the fixed function
    loading,
    getAuthState,
    authChecked,
    logout,
    getFrontendOrigin,
    createAxiosInstance // Export for other components
  };

  return (
    <AppContent.Provider value={value}>
      {children}
    </AppContent.Provider>
  );
};

export default AppContextProvider;