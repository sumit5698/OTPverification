import React, { useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AppContent } from './context/Appcontext';

import Home from './pages/Home';
import Login from './pages/Login';
import Verifyemail from './pages/verifyemail';
import ResetPassword from "./pages/ResetPassword";

const App = () => {
    const { loading } = useContext(AppContent);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-100 via-blue-100 to-purple-100">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/verify-email" element={<Verifyemail />} />
                <Route path="/reset-password" element={<ResetPassword />} />
            </Routes>
        </>
    );
};

export default App;