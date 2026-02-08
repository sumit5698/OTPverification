import React, { useContext, useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContent } from '../context/Appcontext'
import { toast } from 'react-toastify'
import axios from 'axios'

const Verifyemail = () => {
    const { backendUrl, isLoggedin, userData, getUserData } = useContext(AppContent)
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const inputRefs = useRef([])
    const [isSubmitting, setIsSubmitting] = useState(false)

    // ✅ FIXED: Safe toast function
    const showToast = (message, type = 'error') => {
        try {
            // Ensure message is a string
            const msg = typeof message === 'string' ? message : 
                       message?.toString ? message.toString() : 'An error occurred';
            
            // Remove any parentheses that might cause issues
            const cleanMsg = msg.replace(/[()]/g, '').trim();
            
            if (type === 'success') {
                toast.success(cleanMsg, {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            } else {
                toast.error(cleanMsg, {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            }
        } catch (error) {
            console.error("Toast error:", error);
            // Fallback to console
            console[type === 'success' ? 'log' : 'error'](message);
        }
    }

    const handleInput = (e, index) => {
        const value = e.target.value
        
        // Only allow numbers
        if (!/^\d?$/.test(value)) {
            e.target.value = '';
            return;
        }
        
        if (value.length > 0 && index < inputRefs.current.length - 1) {
            inputRefs.current[index + 1].focus();
        }
    }

    const handlekeyDown = (e, index) => {
        if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
            inputRefs.current[index - 1].focus();
        }
        
        // Prevent non-numeric input
        if (!/^\d$/.test(e.key) && 
            e.key !== 'Backspace' && 
            e.key !== 'Delete' && 
            e.key !== 'Tab' && 
            e.key !== 'ArrowLeft' && 
            e.key !== 'ArrowRight') {
            e.preventDefault();
        }
    }

    const handlePaste = (e) => {
        e.preventDefault();
        const paste = e.clipboardData.getData('text').trim();
        
        // Only accept numbers
        const cleanPaste = paste.replace(/\D/g, '');
        
        if (cleanPaste.length === 6) {
            // Fill all inputs at once
            for (let i = 0; i < 6; i++) {
                if (inputRefs.current[i]) {
                    inputRefs.current[i].value = cleanPaste[i] || '';
                }
            }
        } else {
            showToast('Please paste a valid 6-digit OTP');
        }
    }

    const validateOTP = () => {
        const otpArray = inputRefs.current.map(input => input?.value || '');
        const otp = otpArray.join('');
        
        // Check if all inputs are filled
        if (otp.length !== 6) {
            showToast('Please fill all 6 digits of the OTP');
            return null;
        }
        
        // Check if OTP contains only numbers
        if (!/^\d+$/.test(otp)) {
            showToast('OTP should contain only numbers');
            return null;
        }
        
        return otp;
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        
        if (isSubmitting || loading) {
            return;
        }
        
        const otp = validateOTP();
        if (!otp) {
            return;
        }
        
        setIsSubmitting(true);
        setLoading(true);

        try {
            console.log("🔐 Verifying email with OTP:", otp);
            console.log("👤 User ID:", userData?.id);

            if (!userData?.id) {
                showToast("User data not found. Please login again.");
                setTimeout(() => navigate('/login'), 1500);
                return;
            }

            const response = await axios.post(
                `${backendUrl}/api/auth/verify-email`,
                {
                    userId: userData.id,
                    otp: otp,
                    email: userData.email
                },
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000
                }
            );

            console.log("✅ Verification response:", response.data);

            if (response.data?.success) {
                showToast(response.data.message || 'Email verified successfully!', 'success');
                
                // Refresh user data
                try {
                    await getUserData();
                } catch (refreshError) {
                    console.log("Could not refresh user data:", refreshError);
                }
                
                // Navigate to home after a short delay
                setTimeout(() => {
                    navigate('/');
                }, 1500);
            } else {
                showToast(response.data?.message || "Verification failed");
                // Clear OTP on failure
                inputRefs.current.forEach(input => {
                    if (input) input.value = '';
                });
                setTimeout(() => {
                    if (inputRefs.current[0]) {
                        inputRefs.current[0].focus();
                    }
                }, 100);
            }

        } catch (error) {
            console.error("❌ Verification error:", error);
            
            let errorMessage = "Something went wrong. Please try again.";
            
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    errorMessage = error.response.data?.message || "Verification failed";
                } else if (error.code === 'ECONNABORTED') {
                    errorMessage = "Request timeout. Please try again.";
                } else if (error.message.includes("Network Error")) {
                    errorMessage = "Cannot connect to server. Check your connection.";
                }
            }
            
            showToast(errorMessage);
            
            // Clear OTP on error
            inputRefs.current.forEach(input => {
                if (input) input.value = '';
            });
            setTimeout(() => {
                if (inputRefs.current[0]) {
                    inputRefs.current[0].focus();
                }
            }, 100);
        } finally {
            setIsSubmitting(false);
            setLoading(false);
        }
    }

    // Resend OTP functionality
    const [resendTimer, setResendTimer] = useState(0);
    const [canResend, setCanResend] = useState(false);

    const handleResendOTP = async () => {
        if (!canResend || !userData?.id) return;
        
        setCanResend(false);
        setResendTimer(60);
        
        try {
            // First try send-verify-otp endpoint
            const response = await axios.post(
                `${backendUrl}/api/auth/send-verify-otp`,
                { 
                    userId: userData.id
                },
                { 
                    withCredentials: true,
                    timeout: 10000
                }
            );
            
            if (response.data?.success) {
                showToast('OTP resent successfully!', 'success');
                // Clear existing OTP
                inputRefs.current.forEach(input => {
                    if (input) input.value = '';
                });
                setTimeout(() => {
                    if (inputRefs.current[0]) {
                        inputRefs.current[0].focus();
                    }
                }, 100);
            } else {
                showToast(response.data?.message || 'Failed to resend OTP');
                setCanResend(true);
            }
        } catch (error) {
            console.error("❌ Resend OTP error:", error);
            showToast('Failed to resend OTP. Please try again.');
            setCanResend(true);
        }
        
        // Start countdown
        const interval = setInterval(() => {
            setResendTimer(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    useEffect(() => {
        console.log("📧 Verify Email Page Loaded");
        console.log("👤 User Data:", userData);
        console.log("🔐 Is Logged In:", isLoggedin);

        if (!isLoggedin) {
            console.log("❌ Not logged in, redirecting to login");
            showToast("Please login first");
            navigate('/login');
            return;
        }

        if (!userData) {
            console.log("❌ No user data, redirecting to login");
            showToast("User data not found");
            navigate('/login');
            return;
        }

        if (userData.isAccountVerified) {
            console.log("✅ Email already verified, redirecting to home");
            navigate('/');
            return;
        }

        console.log("✅ User needs email verification");
        
        // Focus first input on load
        setTimeout(() => {
            if (inputRefs.current[0]) {
                inputRefs.current[0].focus();
            }
        }, 100);
        
        // Enable resend after 30 seconds
        const timer = setTimeout(() => {
            setCanResend(true);
        }, 30000);
        
        return () => clearTimeout(timer);
    }, [isLoggedin, userData, navigate]);

    if (!userData) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-100 via-blue-100 to-purple-100">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading user data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className='flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-pink-100 via-blue-100 to-purple-100'>
            
            {/* Logo */}
            <div 
                onClick={() => navigate('/')}
                className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 h-28 sm:h-32 
                bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg 
                flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-shadow'
            >
                <span className="text-white text-xl font-bold">Auth</span>
            </div>

            <form onSubmit={onSubmitHandler} className='bg-slate-900 p-8 rounded-lg shadow-lg w-full max-w-md mt-20'>
                <h1 className='text-white text-2xl font-semibold text-center mb-4'>
                    Email Verification
                </h1>

                <p className='text-center mb-2 text-indigo-300'>
                    Enter the 6-digit code sent to:
                </p>
                <p className='text-center mb-6 text-white font-medium break-all px-4'>
                    {userData.email}
                </p>

                <div className='flex justify-between mb-8' onPaste={handlePaste}>
                    {Array.from({ length: 6 }, (_, index) => (
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength="1"
                            key={index}
                            required
                            disabled={loading || isSubmitting}
                            className="w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md
                            focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50
                            transition-all duration-200 border border-gray-700"
                            ref={el => inputRefs.current[index] = el}
                            onChange={(e) => handleInput(e, index)}
                            onKeyDown={(e) => handlekeyDown(e, index)}
                            aria-label={`OTP digit ${index + 1}`}
                        />
                    ))}
                </div>

                <button 
                    type="submit" 
                    disabled={loading || isSubmitting}
                    className={`w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-900 
                    text-white rounded-full hover:opacity-90 transition-opacity duration-200
                    flex items-center justify-center gap-2 ${(loading || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {(loading || isSubmitting) ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Verifying...
                        </>
                    ) : 'Verify Email'}
                </button>
                
                <div className="mt-6 space-y-3 text-center">
                    <div>
                        <button
                            type="button"
                            onClick={handleResendOTP}
                            disabled={!canResend || loading || isSubmitting}
                            className={`text-sm ${canResend ? 'text-indigo-400 hover:text-indigo-300 hover:underline' : 'text-gray-500 cursor-not-allowed'}`}
                        >
                            {canResend ? 'Resend OTP' : `Resend in ${resendTimer}s`}
                        </button>
                    </div>
                    
                    <p className='text-xs text-gray-400'>
                        Didn't receive OTP? Check your spam folder or click resend.
                    </p>
                    
                    <div className="pt-2 border-t border-gray-700">
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            disabled={loading || isSubmitting}
                            className="text-sm text-indigo-400 hover:text-indigo-300 hover:underline disabled:opacity-50"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default Verifyemail