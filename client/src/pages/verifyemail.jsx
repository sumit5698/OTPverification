import React, { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContent } from '../context/Appcontext'
import { toast } from 'react-toastify'

const Verifyemail = () => {
    const { backendUrl, isLoggedin, userData, getUserData, getFrontendOrigin } = useContext(AppContent)
    const navigate = useNavigate()
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
        try {
            e.preventDefault();
            const otpArray = inputRefs.current.map(e => e.value)
            const otp = otpArray.join('')
            const frontendOrigin = getFrontendOrigin();

            const { data } = await fetch(`${backendUrl}/api/auth/verify-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Origin': frontendOrigin
                },
                credentials: 'include',
                body: JSON.stringify({
                    userId: userData.id,
                    otp: otp
                })
            }).then(res => res.json());

            if (data.success) {
                toast.success(data.message)
                await getUserData()
                navigate('/')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
        }
    }

    useEffect(() => {
        if (!isLoggedin || !userData) {
            navigate('/login');
        }
        if (userData?.isAccountVerified) {
            navigate('/')
        }
    }, [isLoggedin, userData, navigate])

    if (!userData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className='flex items-center justify-center min-h-screen px-6
        sm:px-0 bg-gradient-to-br from-pink-100 via-blue-100 to-purple-100 bg-cover'>
            <img
                onClick={() => navigate('/')}
                src='/auth.jpg'
                alt=''
                className='absolute left-5 sm:left-20
                top-5 w-28 sm:w-32 cursor-pointer'
            />

            <form onSubmit={onSubmitHandler} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
                <h1 className='text-white text-2xl font-semibold text-center mb-4'>
                    Email Verify OTP
                </h1>

                <p className='text-center mb-6 text-indigo-300'>
                    Enter the 6-digit code sent to {userData.email}
                </p>

                <div className='flex justify-between mb-8' onPaste={handlePaste}>
                    {Array(6).fill(0).map((_, index) => (
                        <input
                            type="text"
                            maxLength="1"
                            key={index}
                            required
                            className="w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md"
                            ref={el => inputRefs.current[index] = el}
                            onInput={(e) => handleInput(e, index)}
                            onKeyDown={(e) => handlekeyDown(e, index)}
                        />
                    ))}
                </div>

                <button type="submit" className='w-full py-3 bg-gradient-to-r from-indigo-500
                to-indigo-900 text-white rounded-full hover:opacity-90 transition-opacity'>
                    Verify Email
                </button>
                
                <p className='text-center text-xs text-gray-400 mt-4'>
                    Didn't receive OTP? Check spam folder or try again later.
                </p>
            </form>
        </div>
    )
}

export default Verifyemail