import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContent } from '../context/Appcontext'
import { toast } from 'react-toastify'
import axios from 'axios'

const Login = () => {

  const navigate = useNavigate()
  const { backendUrl, setIsLoggedin, getUserData } = useContext(AppContent)

  const [state, setState] = useState('Sign Up')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassowrd] = useState('')

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault()
      axios.defaults.withCredentials = true

      if (state === 'Sign Up') {
        const { data } = await axios.post(
          `${backendUrl}/api/auth/register`,
          { name, email, password }
        )

        if (data.success) {
          setIsLoggedin(true)
          getUserData();
          navigate('/')
        } else {
          toast.error(data.message)
        }

      } else {
        const { data } = await axios.post(
          `${backendUrl}/api/auth/login`,
          { email, password }
        )

        if (data.success) {
          setIsLoggedin(true)
          getUserData();
          navigate('/')
        } else {
          toast.error(data.message)
        }
      }

    } catch (error) {
      toast.error(error.message)
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
            rounded-full bg-[#333A5C] border border-white/10
            focus-within:border-indigo-400 focus-within:bg-[#3b4270]
            transition-all duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" strokeWidth={1.5}
                stroke="currentColor" className="w-5 h-5 text-gray-300">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M4.5 20.25a7.5 7.5 0 0115 0" />
              </svg>

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
            rounded-full bg-[#333A5C] border border-white/10
            focus-within:border-indigo-400 focus-within:bg-[#3b4270]
            transition-all duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none"
              viewBox="0 0 24 24" strokeWidth={1.5}
              stroke="currentColor" className="w-5 h-5 text-gray-300">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M21.75 6.75v10.5A2.25 2.25 0 0119.5 19.5h-15A2.25 2.25 0 012.25 17.25V6.75m19.5 0L12 13.5 2.25 6.75" />
            </svg>

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
            rounded-full bg-[#333A5C] border border-white/10
            focus-within:border-indigo-400 focus-within:bg-[#3b4270]
            transition-all duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none"
              viewBox="0 0 24 24" strokeWidth={1.5}
              stroke="currentColor" className="w-5 h-5 text-gray-300">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M16.5 10.5V7.875a4.5 4.5 0 10-9 0V10.5m-.75 0h10.5A1.5 1.5 0 0118.25 12v6.75A1.5 1.5 0 0116.75 20.25H7.25A1.5 1.5 0 015.75 18.75V12A1.5 1.5 0 017.25 10.5z" />
            </svg>

            <input
              onChange={e => setPassowrd(e.target.value)}
              value={password}
              type="password"
              placeholder="Password"
              required
              className="bg-transparent outline-none text-white w-full placeholder-gray-300"
            />
          </div>
        </form>

        <p onClick={() => navigate('/reset-password')}
          className='mb-4 text-indigo-500 cursor-pointer'>
          Forgot Password
        </p>

        <button
          type="submit"
          onClick={onSubmitHandler}
          className='w-full py-2.5 rounded-full bg-gradient-to-r
          from-indigo-500 to-indigo-900 text-white font-medium'>
          {state}
        </button>

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
