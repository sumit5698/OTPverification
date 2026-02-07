import express from "express";
import { register, 
    login, 
    logout, 
    isAuthenticated, 
    sendVerityOtp, 
    verifyEmail, 
    sendResetOtp, 
    resetPassword } from '../controller/authController.js'

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/is-auth", isAuthenticated); // ✅ This is your is-auth endpoint
router.post("/send-verify-otp", sendVerityOtp);
router.post("/verify-email", verifyEmail);
router.post("/send-reset-otp", sendResetOtp);
router.post("/reset-password", resetPassword);

export default router;