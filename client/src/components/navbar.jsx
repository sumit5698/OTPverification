import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContent } from '../context/Appcontext';
import { toast } from 'react-toastify';
import axios from 'axios';

const Navbar = () => {
    const navigate = useNavigate()
    const { userData, backendUrl, setUserData, setIsLoggedin } = useContext(AppContent)
    
    const sendVerificationotp = async () => {
        try {
            axios.defaults.withCredentials = true;
            // ✅ Add userId to the request body
            const { data } = await axios.post(backendUrl + '/api/auth/send-verify-otp', {
                userId: userData.id
            })
            if (data.success) {
                navigate('/verify-email')
                toast.success(data.message)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
        }
    }

    const logout = async () => {
        try {
            axios.defaults.withCredentials = true;
            const { data } = await axios.get( // ✅ Changed from POST to GET
                backendUrl + '/api/auth/logout',
                { withCredentials: true }
            );

            if (data.success) {
                setIsLoggedin(false);
                setUserData(null); // ✅ Changed from false to null
                navigate('/');
                toast.success("Logged out successfully");
            }

        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    }

    return (
        <div className='w-full flex justify-between items-center p-4 sm:p-6 sm:px-24 absolute top-0'>
            <img
                src="/auth.jpg"
                alt="Auth Logo"
                className="w-28 sm:w-32"
            />

            {userData ?
                <div className='w-8 h-8 flex justify-center items-center rounded-full bg-black text-white relative group'>
                    {userData.name[0].toUpperCase()}

                    <div className='absolute hidden group-hover:block top-0 right-0 x-10 text-black rounded pt-10'>
                        <ul className='list-none m-0 p-2 bg-gray-100 text-sm'>
                            {!userData.isAccountVerified &&
                                <li onClick={sendVerificationotp} className='px-3 py-2'>
                                    <div className='flex items-center gap-2 px-3 py-2 rounded-lg
      bg-white shadow-sm hover:shadow-md
      hover:bg-indigo-50 cursor-pointer
      transition-all duration-200 transform hover:scale-[1.02]'>

                                        <span className='w-2 h-2 bg-red-500 rounded-full animate-pulse'></span>

                                        <span className='text-sm font-medium text-gray-700'>
                                            Verify email
                                        </span>
                                    </div>
                                </li>
                            }

                            <li onClick={logout} className='px-3 py-2'>
                                <div className='flex items-center gap-2 px-3 py-2 rounded-lg
    bg-white shadow-sm hover:shadow-md
    hover:bg-red-50 cursor-pointer
    transition-all duration-200 transform hover:scale-[1.02]'>
                                    <span className='text-sm font-medium text-red-600'>
                                        Logout
                                    </span>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
                :
                <button
                    onClick={() => navigate('/login')}
                    className='flex items-center gap-2 border border-gray-500 rounded-full px-6 py-2 text-gray-800 hover:bg-gray-100 transition-all'
                >
                    Login
                    <img src="arrow.jpg" alt="logo" className="w-6 h-6 object-contain" />
                </button>
            }
        </div>
    );
};

export default Navbar;