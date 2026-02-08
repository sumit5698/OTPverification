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
    <div className='flex items-center justify-center min-h-screen px-6
    sm:px-0 bg-gradient-to-br from-pink-100 via-blue-100 to-purple-100 bg-cover relative'>

      <img 
        onClick={() => navigate('/')}
        src='/auth.jpg'
        alt='Auth Logo'
        className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer'
        onError={(e) => {
          e.target.style.display = 'none';
          console.log('Image failed to load, using fallback');
        }}
      />

      <div className='bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96
        text-indigo-300 text-sm z-10'>

        <h2 className='text-3xl font-semibold text-white text-center mb-3'>
          {state === 'Sign Up' ? 'Create Account' : 'Login to your account!'}
        </h2>

        <p className='text-center text-sm mb-6'>
          {state === 'Sign Up' ? 'Create your account' : 'Login to your account!'}
        </p>

        <form onSubmit={onSubmitHandler}>

          {state === 'Sign Up' && (
            <div className="mb-4 flex items-center gap-3 w-full px-5 py-3
            rounded-full bg-[#333A5C] border border-white/10">
              <input
                onChange={e => setName(e.target.value)}
                value={name}
                type="text"
                placeholder="Full Name"
                required
                className="bg-transparent outline-none text-white w-full placeholder-gray-300"
                autoComplete="name"
              />
            </div>
          )}

          <div className="mb-4 flex items-center gap-3 w-full px-5 py-3
            rounded-full bg-[#333A5C] border border-white/10">
            <input
              onChange={e => setEmail(e.target.value)}
              value={email}
              type="email"
              placeholder="Email"
              required
              className="bg-transparent outline-none text-white w-full placeholder-gray-300"
              autoComplete="email"
            />
          </div>

          <div className="mb-4 flex items-center gap-3 w-full px-5 py-3
            rounded-full bg-[#333A5C] border border-white/10">
            <input
              onChange={e => setPassword(e.target.value)}
              value={password}
              type="password"
              placeholder="Password"
              required
              minLength="6"
              className="bg-transparent outline-none text-white w-full placeholder-gray-300"
              autoComplete={state === 'Sign Up' ? 'new-password' : 'current-password'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded-full bg-gradient-to-r
            from-indigo-500 to-indigo-900 text-white font-medium
            ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'} 
            transition-opacity duration-200`}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : state}
          </button>
        </form>

        <p 
          onClick={() => navigate('/reset-password')}
          className='mb-4 text-indigo-500 cursor-pointer hover:underline text-center mt-4'
        >
          Forgot Password?
        </p>

        {state === 'Sign Up' ? (
          <p className='text-gray-500 text-center text-xs mt-4'>
            Already have an account?{' '}
            <span
              onClick={() => setState('Login')}
              className='text-blue-400 cursor-pointer underline hover:text-blue-300'>
              Login here
            </span>
          </p>
        ) : (
          <p className='text-gray-500 text-center text-xs mt-4'>
            Don't have an account?{' '}
            <span
              onClick={() => setState('Sign Up')}
              className='text-blue-400 cursor-pointer underline hover:text-blue-300'>
              Sign up
            </span>
          </p>
        )}

        {/* Debug Info - Remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-3 bg-gray-800 rounded-lg text-xs">
            <p className="text-gray-400">Debug Info:</p>
            <p className="text-gray-300">Frontend: {window.location.origin}</p>
            <p className="text-gray-300">Backend: https://otpverification-api.onrender.com</p>
            <p className="text-gray-300">Cookies: {document.cookie || 'None'}</p>
          </div>
        )}

      </div>
    </div>
  )
}

export default Login