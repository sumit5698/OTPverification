import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContent } from '../context/Appcontext'
import { toast } from 'react-toastify'
import axios from 'axios'

// ✅ BUG FIX 3: global (ek baar)
axios.defaults.withCredentials = true

const Login = () => {

  const navigate = useNavigate()
  const { backendUrl, setIsLoggedin, getUserData } = useContext(AppContent)

  const [state, setState] = useState('Sign Up')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  // ✅ BUG FIX 1: typo fixed
  const [password, setPassword] = useState('')

  const onSubmitHandler = async (e) => {
    e.preventDefault()

    try {
      if (state === 'Sign Up') {
        const { data } = await axios.post(
          `${backendUrl}/api/auth/register`,
          { name, email, password },
          { withCredentials: true }   // ✅ VERY IMPORTANT
        );

        if (data.success) {
          setIsLoggedin(true)
          await getUserData()
          navigate('/')
        } else {
          toast.error(data.message)
        }

      } else {
        const { data } = await axios.post(
          `${backendUrl}/api/auth/login`,
          { email, password },
          { withCredentials: true }   // ✅ VERY IMPORTANT
        );

        if (data.success) {
          setIsLoggedin(true)
          await getUserData()
          navigate('/')
        } else {
          toast.error(data.message)
        }
      }

    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
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
          {state === 'Sign Up' ? 'create  account' : 'Login to your accournt!'}
        </h2>

        <p className='text-center text-sm mb-6'>
          {state === 'Sign Up' ? 'create your account' : 'Login to your accournt!'}
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
              className="bg-transparent outline-none text-white w-full placeholder-gray-300"
            />
          </div>

          {/* ✅ BUG FIX 2: button sirf submit */}
          <button
            type="submit"
            className='w-full py-2.5 rounded-full bg-gradient-to-r
            from-indigo-500 to-indigo-900 text-white font-medium'>
            {state}
          </button>
        </form>

        <p onClick={() => navigate('/reset-password')}
          className='mb-4 text-indigo-500 cursor-pointer'>
          Forgot Password
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
            Dont' have an account?{' '}
            <span
              onClick={() => setState('Sign Up')}
              className='text-blue-400 cursor-pointer underline'>
              sign up
            </span>
          </p>
        )}

      </div>
    </div>
  )
}

export default Login
