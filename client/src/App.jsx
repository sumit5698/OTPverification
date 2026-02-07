import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import Home from './pages/Home';
import Login from './pages/Login';
import Verifyemail from './pages/verifyemail';
import Resetpassword from './pages/resetpassword'; // ✅ Fixed import name

const App = () => {
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
                <Route path="/reset-password" element={<Resetpassword />} />
            </Routes>
        </>
    );
};

export default App;