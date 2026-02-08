import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContent } from '../context/Appcontext'
import { toast } from 'react-toastify'
import axios from 'axios'

const Login = () => {
  const navigate = useNavigate()
  const { setIsLoggedin, getUserData } = useContext(AppContent)

  const [state, setState] = useState('Sign Up')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (state === 'Sign Up') {
        const { data } = await axios.post('/api/auth/register', {
          name,
          email,
          password
        });

        if (data.success) {
          setIsLoggedin(true)
          await getUserData()
          navigate('/')
          toast.success("Registration successful!")
        } else {
          toast.error(data.message)
        }

      } else {
        const { data } = await axios.post('/api/auth/login', {
          email,
          password
        });

        if (data.success) {
          setIsLoggedin(true)
          await getUserData()
          navigate('/')
          toast.success("Login successful!")
        } else {
          toast.error(data.message)
        }
      }

    } catch (error) {
      console.error("Login error:", error)
      
      if (error.response?.status === 401) {
        toast.error("Invalid email or password")
      } 
      else if (error.code === 'ECONNABORTED') {
        toast.error("Request timeout - server is slow")
      }
      else if (error.message.includes("Network Error")) {
        toast.error("Cannot connect to server. Check internet connection.")
      }
      else {
        toast.error(error.response?.data?.message || "Something went wrong")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex items-center justify-center min-h-screen px-6
    sm:px-0 bg-gradient-to-br from-pink-100 via-blue-100 to-purple-100 bg-cover'>

      <img onClick={() => navigate('/')}
        src='/auth.jpg'
        alt=''
        className='absolute left-5 sm:left-20
        top-5 w-28 sm:w-32 cursor-pointer'
      />

      <div className='bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96
        text-indigo-300 text-sm'>

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
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded-full bg-gradient-to-r
            from-indigo-500 to-indigo-900 text-white font-medium
            ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}>
            {loading ? 'Processing...' : state}
          </button>
        </form>

        <p onClick={() => navigate('/reset-password')}
          className='mb-4 text-indigo-500 cursor-pointer hover:underline text-center'>
          Forgot Password?
        </p>

        {state === 'Sign Up' ? (
          <p className='text-gray-500 text-center text-xs mt-4'>
            Already have an account?{' '}
            <span
              onClick={() => setState('Login')}
              className='text-blue-400 cursor-pointer underline'>
              Login here
            </span>
          </p>
        ) : (
          <p className='text-gray-500 text-center text-xs mt-4'>
            Don't have an account?{' '}
            <span
              onClick={() => setState('Sign Up')}
              className='text-blue-400 cursor-pointer underline'>
              Sign up
            </span>
          </p>
        )}

      </div>
    </div>
  )
}

export default Login