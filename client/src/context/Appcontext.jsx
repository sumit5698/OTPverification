import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContent = createContext();

const AppContextProvider = ({ children }) => {

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState(false);

  const getAuthstate = async ()=>{
    try {
        const {data}= await axios.get(backendUrl + '/api/auth/is-auth',{withCredentials:true})
        if(data.success){
            setIsLoggedin(true)
            getUserData()
        }
    } catch (error) {
        toast.error(error.message)
    }
  }

  useEffect(()=>{
    getAuthstate();
  },[])

  const getUserData = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/user/data`,
        { withCredentials: true }
      );

      data.success
        ? setUserData(data.userData)
        : toast.error(data.message);

    } catch (error) {
        setIsLoggedin(false)
      toast.error(error.message);
    }
  };

  const value = {
    backendUrl,
    isLoggedin,
    setIsLoggedin,
    userData,
    setUserData,
    getUserData   // ✅ VERY IMPORTANT
  };

  return (
    <AppContent.Provider value={value}>
      {children}
    </AppContent.Provider>
  );
};

export default AppContextProvider;
