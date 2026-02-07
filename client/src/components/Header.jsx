// components/Header.js
import React, { useState } from 'react';

const Header = () => {
  const [showSurprise, setShowSurprise] = useState(false);

  const handleClick = () => {
    setShowSurprise(true);
    // 3 seconds बाद automatic hide हो जाए
    setTimeout(() => {
      setShowSurprise(false);
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center text-center gap-8 px-6">
      <h1 className="text-5xl sm:text-7xl font-bold text-gray-800">
        Discover Amazing Features
      </h1>
      
      <p className="text-lg sm:text-xl text-gray-600 max-w-2xl">
        Join thousands of users who trust our platform for their needs.
      </p>
      
      {/* Fixed button with click handler */}
      <button 
        className='border border-gray-500 rounded-full px-8 py-2.5 hover:bg-gray-100 transition-all'
        onClick={handleClick}
      >
        Get Started
      </button>

      {/* Middle finger surprise popup */}
      {showSurprise && (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
          <img 
            src="./fin.jpg"
            alt="Middle Finger"
            className="max-w-[90%] max-h-[80%] object-contain rounded-lg shadow-2xl"
          />
          <p className="text-white text-2xl mt-6 font-bold animate-pulse">तुम्हारे लिए! 😂</p>
          <button 
            onClick={() => setShowSurprise(false)}
            className="mt-4 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default Header;