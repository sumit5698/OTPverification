import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContent } from '../context/Appcontext';
import { toast } from 'react-toastify';
import axios from 'axios';

const Navbar = () => {
    const navigate = useNavigate();
    const { userData, setUserData, setIsLoggedin, getFrontendOrigin } = useContext(AppContent);
    
    const sendVerificationotp = async () => {
        try {
            const frontendOrigin = getFrontendOrigin();
            
            const { data } = await axios.post('/api/auth/send-verify-otp', {
                userId: userData.id
            }, {
                headers: {
                    'Origin': frontendOrigin
                },
                withCredentials: true
            });
            
            if (data.success) {
                navigate('/verify-email');
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    };

    const handleLogout = async () => {
        try {
            const frontendOrigin = getFrontendOrigin();
            
            const { data } = await axios.get('/api/auth/logout', {
                headers: {
                    'Origin': frontendOrigin
                },
                withCredentials: true
            });
            
            if (data.success) {
                setIsLoggedin(false);
                setUserData(null);
                localStorage.removeItem('user');
                localStorage.removeItem('auth_token');
                navigate('/');
                toast.success("Logged out successfully");
            }
        } catch (error) {
            console.error("Logout error:", error);
            // Force logout
            setIsLoggedin(false);
            setUserData(null);
            localStorage.removeItem('user');
            localStorage.removeItem('auth_token');
            navigate('/');
            toast.success("Logged out");
        }
    };

    return (
        <div className='w-full flex justify-between items-center p-4 sm:p-6 sm:px-24 absolute top-0 z-40'>
            <img
                src="/auth.jpg"
                alt="Auth Logo"
                className="w-28 sm:w-32 cursor-pointer"
                onClick={() => navigate('/')}
            />

            {userData ? (
                <div className='relative group'>
                    <div className='w-10 h-10 flex justify-center items-center rounded-full 
                    bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold 
                    text-lg cursor-pointer hover:scale-105 transition-transform'>
                        {userData.name[0].toUpperCase()}
                    </div>

                    {/* Dropdown Menu */}
                    <div className='absolute right-0 top-12 w-48 bg-white rounded-lg shadow-xl 
                    border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 
                    group-hover:visible transition-all duration-200'>
                        
                        {!userData.isAccountVerified && (
                            <div onClick={sendVerificationotp} 
                                className='flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 
                                cursor-pointer transition-colors'>
                                <span className='w-2 h-2 bg-red-500 rounded-full animate-pulse'></span>
                                <span className='text-sm font-medium text-gray-700'>
                                    Verify Email
                                </span>
                            </div>
                        )}

                        {!userData.isAccountVerified && (
                            <div className='border-t border-gray-100 my-1'></div>
                        )}

                        <div onClick={handleLogout} 
                            className='flex items-center gap-3 px-4 py-3 hover:bg-red-50 
                            cursor-pointer transition-colors'>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" 
                                viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" 
                                clipRule="evenodd" />
                            </svg>
                            <span className='text-sm font-medium text-red-600'>
                                Logout
                            </span>
                        </div>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => navigate('/login')}
                    className='flex items-center gap-3 border border-gray-300 rounded-full 
                    px-6 py-2.5 text-gray-800 hover:bg-gray-50 hover:border-gray-400 
                    transition-all shadow-sm hover:shadow-md'
                >
                    <span className='font-medium'>Login</span>
                    <img src="arrow.jpg" alt="arrow" className="w-5 h-5" />
                </button>
            )}
        </div>
    );
};

export default Navbar;