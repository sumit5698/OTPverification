import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContent } from '../context/Appcontext'
import { toast } from 'react-toastify'
import axios from 'axios'

const Resetpassword = () => {
    const navigate = useNavigate()
    const { backendUrl } = useContext(AppContent)
    axios.defaults.withCredentials = true

    const [email, setEmail] = useState('')
    const [newPassword, setNewPassword] = useState('') // ✅ Fixed typo: setNewPassowrd -> setNewPassword
    const [isEmailSent, setEmailSent] = useState(false)
    const [otp, setOtp] = useState('') // ✅ Fixed typo: setotp -> setOtp
    const [isOtpSubmitted, setOtpSubmitted] = useState(false) // ✅ Fixed typo: setisOtpSubmited -> setOtpSubmitted

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

    const onSubmitEmail = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post(
                backendUrl + '/api/auth/send-reset-otp',
                { email }
            );

            if (data.success) {
                toast.success(data.message);
                setEmailSent(true);
            } else {
                toast.error(data.message);
            }

        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    }

    const onSubmitOtp = async (e) => {
        e.preventDefault();
        const otpArray = inputRefs.current.map(e => e.value)
        const finalOtp = otpArray.join('')
        setOtp(finalOtp) // ✅ Fixed: Use setOtp instead of setotp
        setOtpSubmitted(true) // ✅ Fixed: Use setOtpSubmitted instead of setisOtpSubmited
    }

    const onSubmitNewPassword = async (e) => {
        e.preventDefault();

        try {
            const { data } = await axios.post(
                backendUrl + '/api/auth/reset-password',
                { email, otp, newPassword },
                { withCredentials: true }
            );

            if (data.success) {
                toast.success(data.message)
                navigate('/login');
            } else {
                toast.error(data.message);
            }

        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    };

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

            {/* email id */}
            {!isEmailSent &&
                <form onSubmit={onSubmitEmail} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
                    <h1 className='text-white text-2xl font-semibold text-center mb-4'>
                        Reset password
                    </h1>
                    <p className='text-center mb-6 text-indigo-300'>
                        Enter your registered email address
                    </p>
                    <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5
                        rounded-full bg-[#333A5C]'>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                            viewBox="0 0 24 24" strokeWidth={1.5}
                            stroke="currentColor" className="w-5 h-5 text-gray-300">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M21.75 6.75v10.5A2.25 2.25 0 0119.5 19.5h-15A2.25 2.25 0 012.25 17.25V6.75m19.5 0L12 13.5 2.25 6.75" />
                        </svg>
                        <input
                            type="email"
                            placeholder="Email id"
                            className="bg-transparent outline-none text-white w-full placeholder-gray-300"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className='w-full py-2.5 bg-gradient-to-r from-indigo-500
                    to-indigo-900 text-white rounded-full mt-3'>Submit</button>
                </form>
            }

            {/* otp input form */}
            {!isOtpSubmitted && isEmailSent && // ✅ Fixed variable name
                <form onSubmit={onSubmitOtp} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
                    <h1 className='text-white text-2xl font-semibold text-center mb-4'>
                        Reset password OTP
                    </h1>
                    <p className='text-center mb-6 text-indigo-300'>
                        Enter the 6-digit code to your email id.
                    </p>
                    <div className='flex justify-between mb-8' onPaste={handlePaste}>
                        {Array(6).fill(0).map((_, index) => (
                            <input
                                type="text"
                                maxLength="1"
                                key={index}
                                required
                                className="w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md"
                                ref={e => inputRefs.current[index] = e}
                                onInput={(e) => handleInput(e, index)}
                                onKeyDown={(e) => handlekeyDown(e, index)}
                            />
                        ))}
                    </div>
                    <button type="submit" className='w-full py-2.5 bg-gradient-to-r from-indigo-500
                    to-indigo-900 text-white rounded-full'>Submit</button>
                </form>
            }

            {/* enter new password */}
            {isOtpSubmitted && isEmailSent && // ✅ Fixed variable name
                <form onSubmit={onSubmitNewPassword} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
                    <h1 className='text-white text-2xl font-semibold text-center mb-4'>
                        New password
                    </h1>
                    <p className='text-center mb-6 text-indigo-300'>
                        Enter the new password below
                    </p>
                    <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5
                        rounded-full bg-[#333A5C]'>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                            viewBox="0 0 24 24" strokeWidth={1.5}
                            stroke="currentColor" className="w-5 h-5 text-gray-300">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M21.75 6.75v10.5A2.25 2.25 0 0119.5 19.5h-15A2.25 2.25 0 012.25 17.25V6.75m19.5 0L12 13.5 2.25 6.75" />
                        </svg>
                        <input
                            type="password"
                            placeholder="Password" // ✅ Fixed typo: "passowrd" -> "Password"
                            className="bg-transparent outline-none text-white w-full placeholder-gray-300"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)} // ✅ Fixed: setNewPassowrd -> setNewPassword
                            required
                        />
                    </div>
                    <button type="submit" className='w-full py-2.5 bg-gradient-to-r from-indigo-500
                    to-indigo-900 text-white rounded-full mt-3'>Submit</button>
                </form>
            }
        </div>
    )
}

export default Resetpassword