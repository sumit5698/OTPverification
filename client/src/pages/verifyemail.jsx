import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContent } from '../context/Appcontext'
import { toast } from 'react-toastify'
import axios from 'axios'

const Verifyemail = () => {
    const { backendUrl, isLoggedin, userData, getUserData } = useContext(AppContent)
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const inputRefs = React.useRef([])

    const handleInput = (e, index) => {
        if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
            inputRefs.current[index + 1].focus();
        }
    }

    const handlekeyDown = (e, index) => {
        if (e.key === 'Backspace' && e.target.value === '' && index > 0)
            inputRefs.current[index - 1].focus();
    }

    const handlePaste = (e) => {
        const paste = e.clipboardData.getData('text');
        const pasteArray = paste.split('');

        pasteArray.forEach((char, index) => {
            if (inputRefs.current[index]) {
                inputRefs.current[index].value = char;
            }
        });
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const otpArray = inputRefs.current.map(input => input.value);
            const otp = otpArray.join('');
            
            console.log("🔐 Verifying email with OTP:", otp);
            console.log("👤 User ID:", userData?.id);

            if (!otp || otp.length !== 6) {
                toast.error("Please enter a valid 6-digit OTP");
                setLoading(false);
                return;
            }

            if (!userData?.id) {
                toast.error("User data not found. Please login again.");
                navigate('/login');
                return;
            }

            // Use axios with proper configuration
            const response = await axios.post(
                `${backendUrl}/api/auth/verify-email`,
                {
                    userId: userData.id,
                    otp: otp
                },
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log("✅ Verification response:", response.data);

            if (response.data.success) {
                toast.success(response.data.message);
                
                // Refresh user data
                await getUserData();
                
                // Navigate to home
                navigate('/');
            } else {
                toast.error(response.data.message);
            }

        } catch (error) {
            console.error("❌ Verification error:", error);
            
            if (error.response) {
                toast.error(error.response.data?.message || "Verification failed");
            } else if (error.code === 'ECONNABORTED') {
                toast.error("Request timeout. Please try again.");
            } else if (error.message.includes("Network Error")) {
                toast.error("Cannot connect to server. Check your connection.");
            } else {
                toast.error("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        console.log("📧 Verify Email Page Loaded");
        console.log("👤 User Data:", userData);
        console.log("🔐 Is Logged In:", isLoggedin);

        if (!isLoggedin) {
            console.log("❌ Not logged in, redirecting to login");
            navigate('/login');
            return;
        }

        if (!userData) {
            console.log("❌ No user data, redirecting to login");
            navigate('/login');
            return;
        }

        if (userData.isAccountVerified) {
            console.log("✅ Email already verified, redirecting to home");
            navigate('/');
            return;
        }

        console.log("✅ User needs email verification");
    }, [isLoggedin, userData, navigate]);

    if (!userData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading user data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className='flex items-center justify-center min-h-screen px-6
        sm:px-0 bg-gradient-to-br from-pink-100 via-blue-100 to-purple-100 bg-cover'>
            
            {/* Logo */}
            <div 
                onClick={() => navigate('/')}
                className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 h-28 sm:h-32 
                bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg 
                flex items-center justify-center cursor-pointer shadow-lg'
            >
                <span className="text-white text-xl font-bold">Auth</span>
            </div>

            <form onSubmit={onSubmitHandler} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm mt-20'>
                <h1 className='text-white text-2xl font-semibold text-center mb-4'>
                    Email Verification
                </h1>

                <p className='text-center mb-2 text-indigo-300'>
                    Enter the 6-digit code sent to:
                </p>
                <p className='text-center mb-6 text-white font-medium'>
                    {userData.email}
                </p>

                <div className='flex justify-between mb-8' onPaste={handlePaste}>
                    {Array(6).fill(0).map((_, index) => (
                        <input
                            type="text"
                            maxLength="1"
                            key={index}
                            required
                            disabled={loading}
                            className="w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md
                            focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                            ref={el => inputRefs.current[index] = el}
                            onInput={(e) => handleInput(e, index)}
                            onKeyDown={(e) => handlekeyDown(e, index)}
                        />
                    ))}
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className={`w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-900 
                    text-white rounded-full hover:opacity-90 transition-opacity
                    flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Verifying...
                        </>
                    ) : 'Verify Email'}
                </button>
                
                <div className="mt-6 space-y-3">
                    <p className='text-center text-xs text-gray-400'>
                        Didn't receive OTP? Check your spam folder.
                    </p>
                    
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="w-full text-center text-sm text-indigo-400 hover:text-indigo-300"
                    >
                        Back to Home
                    </button>
                </div>
            </form>
        </div>
    )
}

export default Verifyemail