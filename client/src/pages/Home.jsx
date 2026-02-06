import React from 'react'
import Navbar from '../components/navbar'
import Header from '../components/Header'

const Home = () => {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen
    bg-gradient-to-br from-pink-100 via-blue-100 to-purple-100 bg-cover bg.center'>
      <Navbar/>
      <Header/>
    </div>
  )
}

export default Home
