import React, { useContext } from 'react'
import { AppContent } from '../context/Appcontext'

const Header = () => {
    const {userData} = useContext(AppContent)

  return (
    <div className='flex flex-col items-center mt-20 px-4 text-center text-gray-800'>
      
      <div className="rounded-full p-2 mb-6 bg-white/20 backdrop-blur-sm">
        <img src="/auth.jpg" className='w-36 h-36 rounded-full' alt='' />
      </div>

      <h1 className='flex items-center gap-2 text-xl sm:text-3xl font-medium mb-2'>
        Hey  {userData ? userData.name : 'developer'}!
        <span className="bg-white/20 backdrop-blur-sm rounded-full p-1">
          <img className='w-8 aspect-square rounded-full' src="/hand.jpg" alt='' />
        </span>
      </h1>

      <h2 className='text-3xl sm:text-5xl font-semibold mb-4'>
        Welcome to our app
      </h2>

      <p className='mb-8 max-w-md'>
        let's start with a quick product tour and we will have 
        you up and running in no time!
      </p>

      <button className='border border-gray-500 rounded-full px-8 py-2.5
        hover:bg-gray-100 transition-all'>
        Get Started
      </button>
    </div>
  )
}

export default Header
