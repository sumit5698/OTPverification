import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContent } from '../context/Appcontext'
import { toast } from 'react-toastify'

const Login = () => {
  const navigate = useNavigate()
  const { setIsLoggedin, setUserData, getUserData, createAxiosInstance } = useContext(AppContent)

  const [state, setState] = useState('Sign Up')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log("🔐 Attempting", state, "...");
      console.log("📧 Email:", email);
      
      // Create axios instance for this request
      const axiosInstance = createAxiosInstance();
      
      const endpoint = state === 'Sign Up' ? '/api/auth/register' : '/api/auth/login';
      const requestData = state === 'Sign Up' 
        ? { name, email, password }
        : { email, password };

      console.log("📨 Sending request to:", endpoint);
      console.log("🔗 Full URL:", axiosInstance.defaults.baseURL + endpoint);

      // Make the request
      const response = await axiosInstance.post(endpoint, requestData);
      
      console.log("✅ Response received");
      console.log("📊 Status:", response.status);
      console.log("📦 Data:", response.data);

      if (response.data.success) {
        console.log("🎯", state, "successful!");
        
        // Handle user data from response
        if (response.data.user) {
          console.log("👤 User data in response:", response.data.user);
          setUserData(response.data.user);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        } else {
          // If no user data in response, fetch it
          console.log("🔄 No user data in response, fetching...");
          try {
            const userData = await getUserData();
            if (userData) {
              console.log("✅ Fetched user data:", userData);
            }
          } catch (userError) {
            console.log("⚠️ Could not fetch user data:", userError.message);
          }
        }

        // Store token if available
        if (response.data.token) {
          console.log("🔑 Token received, storing in localStorage");
          localStorage.setItem('auth_token', response.data.token);
        }

        setIsLoggedin(true);
        
        // Navigate to home
        navigate('/');
        toast.success(`${state === 'Sign Up' ? 'Registration' : 'Login'} successful!`);
        
      } else {
        console.log("❌", state, "failed:", response.data.message);
        toast.error(response.data.message || `${state} failed`);
      }

    } catch (error) {
      console.error("❌", state, "error details:");
      console.error("Error name:", error.name);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      
      // Detailed error handling
      if (error.response) {
        console.error("📊 Response status:", error.response.status);
        console.error("📦 Response data:", error.response.data);
        
        if (error.response.status === 401) {
          toast.error("Invalid email or password");
        } else if (error.response.status === 400) {
          toast.error(error.response.data?.message || "Please check your input");
        } else if (error.response.status === 409) {
          toast.error("User already exists with this email");
        } else if (error.response.status === 500) {
          toast.error("Server error. Please try again later.");
        } else {
          toast.error(error.response.data?.message || `Error ${error.response.status}`);
        }
      } 
      else if (error.code === 'ECONNABORTED') {
        console.log("⏰ Request timeout after", error.config?.timeout, "ms");
        toast.error("Request timeout. Server might be slow or unresponsive.");
      }
      else if (error.message.includes("Network Error")) {
        toast.error("Cannot connect to server. Check your internet connection.");
      }
      else if (error.message.includes("CORS")) {
        toast.error("Cross-origin request blocked. Please try again.");
      }
      else {
        toast.error("Something went wrong. Please try again.");
      }
      
      // Log additional info for debugging
      if (error.config) {
        console.log("🔧 Request config:", {
          url: error.config.url,
          method: error.config.method,
          timeout: error.config.timeout,
          withCredentials: error.config.withCredentials
        });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='flex items-center justify-center min-h-screen px-6
    sm:px-0 bg-gradient-to-br from-pink-100 via-blue-100 to-purple-100 bg-cover relative'>

      {/* Logo */}
      <div 
        onClick={() => navigate('/')}
        className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 h-28 sm:h-32 
        bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg 
        flex items-center justify-center cursor-pointer shadow-lg'
      >
        <span className="text-white text-xl font-bold">Auth</span>
      </div>

      <div className='bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96
        text-indigo-300 text-sm z-10 mt-32 sm:mt-0'>

        <h2 className='text-3xl font-semibold text-white text-center mb-3'>
          {state === 'Sign Up' ? 'Create Account' : 'Login'}
        </h2>

        <p className='text-center text-sm mb-6 text-gray-400'>
          {state === 'Sign Up' ? 'Join our platform today!' : 'Welcome back!'}
        </p>

        <form onSubmit={onSubmitHandler}>

          {state === 'Sign Up' && (
            <div className="mb-4">
              <input
                onChange={e => setName(e.target.value)}
                value={name}
                type="text"
                placeholder="Full Name"
                required
                className="w-full px-5 py-3 rounded-full bg-[#333A5C] border border-white/10
                  bg-transparent outline-none text-white placeholder-gray-300"
                autoComplete="name"
              />
            </div>
          )}

          <div className="mb-4">
            <input
              onChange={e => setEmail(e.target.value)}
              value={email}
              type="email"
              placeholder="Email"
              required
              className="w-full px-5 py-3 rounded-full bg-[#333A5C] border border-white/10
                bg-transparent outline-none text-white placeholder-gray-300"
              autoComplete="email"
            />
          </div>

          <div className="mb-6">
            <input
              onChange={e => setPassword(e.target.value)}
              value={password}
              type="password"
              placeholder="Password"
              required
              minLength="6"
              className="w-full px-5 py-3 rounded-full bg-[#333A5C] border border-white/10
                bg-transparent outline-none text-white placeholder-gray-300"
              autoComplete={state === 'Sign Up' ? 'new-password' : 'current-password'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-full bg-gradient-to-r
            from-indigo-500 to-indigo-900 text-white font-medium text-lg
            ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 hover:scale-[1.02]'} 
            transition-all duration-200 flex items-center justify-center gap-2`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {state === 'Sign Up' ? 'Creating Account...' : 'Logging in...'}
              </>
            ) : (
              state
            )}
          </button>
        </form>

        <div className="mt-8 space-y-4">
          <p 
            onClick={() => navigate('/reset-password')}
            className='text-indigo-400 cursor-pointer hover:text-indigo-300 
            hover:underline text-center text-sm transition-colors'
          >
            Forgot Password?
          </p>

          <div className="border-t border-gray-700 pt-4">
            {state === 'Sign Up' ? (
              <p className='text-gray-400 text-center text-sm'>
                Already have an account?{' '}
                <span
                  onClick={() => setState('Login')}
                  className='text-blue-400 cursor-pointer font-medium 
                  hover:text-blue-300 hover:underline transition-colors'>
                  Login here
                </span>
              </p>
            ) : (
              <p className='text-gray-400 text-center text-sm'>
                Don't have an account?{' '}
                <span
                  onClick={() => setState('Sign Up')}
                  className='text-blue-400 cursor-pointer font-medium 
                  hover:text-blue-300 hover:underline transition-colors'>
                  Sign up
                </span>
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

export default Login