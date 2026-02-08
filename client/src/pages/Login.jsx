import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContent } from '../context/Appcontext'
import { toast } from 'react-toastify'
import axios from 'axios'

const Login = () => {
  const navigate = useNavigate()
  const { setIsLoggedin, getUserData, getFrontendOrigin } = useContext(AppContent)

  const [state, setState] = useState('Sign Up')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const frontendOrigin = getFrontendOrigin();
      console.log("🔐 Attempting", state, "...");
      console.log("🌐 Frontend Origin:", frontendOrigin);
      
      // Create custom axios instance for this request
      const axiosInstance = axios.create({
        baseURL: "https://otpverification-api.onrender.com",
        withCredentials: true,
        headers: {
          'Origin': frontendOrigin,
          'Content-Type': 'application/json'
        }
      });

      let response;
      
      if (state === 'Sign Up') {
        response = await axiosInstance.post('/api/auth/register', {
          name,
          email,
          password
        });
      } else {
        response = await axiosInstance.post('/api/auth/login', {
          email,
          password
        });
      }

      console.log("✅ Response:", response.data);
      
      // Check if token is in response (backend might send it)
      if (response.data.token) {
        console.log("🔑 Token received in response");
        localStorage.setItem('auth_token', response.data.token);
        
        // Also set cookie manually
        document.cookie = `token=${response.data.token}; path=/; max-age=${7*24*60*60}; secure; samesite=none; domain=.onrender.com`;
      }
      
      // Check cookies after request
      console.log("🍪 Cookies after request:", document.cookie);

      if (response.data.success) {
        setIsLoggedin(true);
        
        // Small delay to ensure cookies are set
        setTimeout(async () => {
          await getUserData();
          navigate('/');
          toast.success(`${state === 'Sign Up' ? 'Registration' : 'Login'} successful!`);
        }, 500);
        
      } else {
        toast.error(response.data.message);
      }

    } catch (error) {
      console.error("❌", state, "error:", error);
      
      // Special handling for cookie issues
      if (error.response?.data?.token) {
        console.log("🔑 Token in error response (fallback)");
        localStorage.setItem('auth_token', error.response.data.token);
        setIsLoggedin(true);
        await getUserData();
        navigate('/');
        toast.success("Login successful (fallback)!");
        return;
      }
      
      if (error.response?.status === 401) {
        toast.error("Invalid email or password");
      } 
      else if (error.code === 'ECONNABORTED') {
        toast.error("Request timeout - server is slow");
      }
      else if (error.message.includes("Network Error")) {
        toast.error("Cannot connect to server. Check internet connection.");
      }
      else {
        toast.error(error.response?.data?.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    // ... (keep your existing JSX, it's fine)
    <div className='flex items-center justify-center min-h-screen px-6
    sm:px-0 bg-gradient-to-br from-pink-100 via-blue-100 to-purple-100 bg-cover'>
      {/* Your existing JSX remains same */}
    </div>
  )
}

export default Login