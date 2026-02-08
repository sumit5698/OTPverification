import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js";

// ✅ Use consistent JWT secret
const JWT_SECRET = process.env.JWT_SECRET || "local-secret-key";

/* ================= REGISTER ================= */
export const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ 
            success: false, 
            message: "Name, email and password are required" 
        });
    }

    try {
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: "User already exists with this email" 
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new userModel({
            name,
            email,
            password: hashedPassword,
        });

        await user.save();

        const token = jwt.sign(
            { id: user._id },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        // ✅ Cookie settings for production/development
        const isProduction = process.env.NODE_ENV === "production";
        
        res.cookie("token", token, {
            httpOnly: true,
            secure: isProduction, // true in production, false in development
            sameSite: isProduction ? "none" : "lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            domain: isProduction ? ".onrender.com" : undefined
        });

        // Email sending (optional)
        if (process.env.SENDER_EMAIL) {
            try {
                const mailOption = {
                    from: process.env.SENDER_EMAIL,
                    to: email,
                    subject: "Welcome to Sumit Website",
                    html: `
                        <h2>Welcome ${name}!</h2>
                        <p>Your account has been created successfully with email: ${email}</p>
                        <p>Thank you for joining us!</p>
                    `,
                };
                await transporter.sendMail(mailOption);
                console.log("📧 Welcome email sent to:", email);
            } catch (emailError) {
                console.error("❌ Email sending failed:", emailError.message);
            }
        }

        return res.status(201).json({ 
            success: true, 
            message: "Registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isAccountVerified: user.isAccountVerified
            }
        });

    } catch (error) {
        console.error("❌ Register error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Server error during registration" 
        });
    }
};

/* ================= LOGIN ================= */
export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required",
        });
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid email or password" 
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid email or password" 
            });
        }

        const token = jwt.sign(
            { id: user._id },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        // ✅ Cookie settings
        const isProduction = process.env.NODE_ENV === "production";
        
        res.cookie("token", token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            domain: isProduction ? ".onrender.com" : undefined
        });

        return res.status(200).json({ 
            success: true, 
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isAccountVerified: user.isAccountVerified
            }
        });

    } catch (error) {
        console.error("❌ Login error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Server error during login" 
        });
    }
};

/* ================= LOGOUT ================= */
export const logout = async (req, res) => {
    try {
        const isProduction = process.env.NODE_ENV === "production";
        
        res.clearCookie("token", {
            path: "/",
            domain: isProduction ? ".onrender.com" : undefined,
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax"
        });

        return res.status(200).json({ 
            success: true, 
            message: "Logged out successfully" 
        });

    } catch (error) {
        console.error("❌ Logout error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Server error during logout" 
        });
    }
};

/* ================= CHECK AUTH ================= */
export const isAuthenticated = async (req, res) => {
    try {
        const token = req.cookies?.token;
        
        console.log("🔍 is-auth endpoint called");
        console.log("🍪 Cookie token:", token ? "Present" : "Not present");

        if (!token) {
            return res.status(200).json({ 
                success: true,
                authenticated: false,
                message: "No authentication token found" 
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
            console.log("✅ Token verified, user ID:", decoded.id);
        } catch (jwtError) {
            console.log("❌ Token verification failed:", jwtError.message);
            return res.status(200).json({
                success: true,
                authenticated: false,
                message: "Invalid or expired token"
            });
        }

        const user = await userModel.findById(decoded.id).select("-password");
        
        if (!user) {
            console.log("❌ User not found for ID:", decoded.id);
            return res.status(200).json({
                success: true,
                authenticated: false,
                message: "User not found"
            });
        }

        console.log("✅ User found:", user.email);

        return res.status(200).json({
            success: true,
            authenticated: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isAccountVerified: user.isAccountVerified
            }
        });

    } catch (error) {
        console.error("❌ is-auth error:", error);
        return res.status(500).json({
            success: false,
            authenticated: false,
            message: "Server error during authentication check"
        });
    }
};

/* ================= SEND VERIFY OTP ================= */
export const sendVerityOtp = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ 
                success: false, 
                message: "User ID is required" 
            });
        }

        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        if (user.isAccountVerified) {
            return res.status(400).json({ 
                success: false, 
                message: "Account is already verified" 
            });
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 10 * 60 * 1000; // 10 minutes

        await user.save();

        // Send email
        if (process.env.SENDER_EMAIL) {
            try {
                const mailOption = {
                    from: process.env.SENDER_EMAIL,
                    to: user.email,
                    subject: "Email Verification OTP",
                    html: `
                        <h3>Hello ${user.name},</h3>
                        <p>Your email verification OTP is: <strong>${otp}</strong></p>
                        <p>This OTP is valid for 10 minutes.</p>
                        <p>If you didn't request this, please ignore this email.</p>
                    `,
                };
                await transporter.sendMail(mailOption);
                console.log("📧 Verification OTP sent to:", user.email);
            } catch (emailError) {
                console.error("❌ Email sending failed:", emailError.message);
            }
        }

        return res.status(200).json({
            success: true,
            message: "Verification OTP sent to your email",
            otp: process.env.NODE_ENV === "development" ? otp : undefined // Send OTP only in dev
        });

    } catch (error) {
        console.error("❌ Send verify OTP error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Server error while sending OTP" 
        });
    }
};

/* ================= VERIFY EMAIL ================= */
export const verifyEmail = async (req, res) => {
    try {
        const { userId, otp } = req.body;

        if (!userId || !otp) {
            return res.status(400).json({ 
                success: false, 
                message: "User ID and OTP are required" 
            });
        }

        const user = await userModel.findById(userId);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        if (user.isAccountVerified) {
            return res.status(400).json({ 
                success: false, 
                message: "Email is already verified" 
            });
        }

        if (!user.verifyOtp || !user.verifyOtpExpireAt) {
            return res.status(400).json({ 
                success: false, 
                message: "No OTP found. Please request a new one." 
            });
        }

        if (user.verifyOtpExpireAt < Date.now()) {
            return res.status(400).json({ 
                success: false, 
                message: "OTP has expired. Please request a new one." 
            });
        }

        if (String(user.verifyOtp) !== String(otp)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid OTP" 
            });
        }

        user.isAccountVerified = true;
        user.verifyOtp = null;
        user.verifyOtpExpireAt = null;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Email verified successfully!"
        });

    } catch (error) {
        console.error("❌ Verify email error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Server error during email verification" 
        });
    }
};

/* ================= SEND RESET OTP ================= */
export const sendResetOtp = async (req, res) => {
    const { email } = req.body || {};

    if (!email) {
        return res.status(400).json({ 
            success: false, 
            message: "Email is required" 
        });
    }

    try {
        const user = await userModel.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "No account found with this email" 
            });
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 10 * 60 * 1000; // 10 minutes

        await user.save();

        // Send email
        if (process.env.SENDER_EMAIL) {
            try {
                const mailOption = {
                    from: process.env.SENDER_EMAIL,
                    to: user.email,
                    subject: "Password Reset OTP",
                    html: `
                        <h3>Hello ${user.name},</h3>
                        <p>Your password reset OTP is: <strong>${otp}</strong></p>
                        <p>This OTP is valid for 10 minutes.</p>
                        <p>If you didn't request this, please ignore this email.</p>
                    `,
                };
                await transporter.sendMail(mailOption);
                console.log("📧 Reset OTP sent to:", user.email);
            } catch (emailError) {
                console.error("❌ Email sending failed:", emailError.message);
            }
        }

        return res.status(200).json({ 
            success: true, 
            message: "Password reset OTP sent to your email",
            otp: process.env.NODE_ENV === "development" ? otp : undefined
        });

    } catch (error) {
        console.error("❌ Send reset OTP error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Server error while sending reset OTP" 
        });
    }
};

/* ================= RESET PASSWORD ================= */
export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.status(400).json({
            success: false,
            message: "Email, OTP and new password are required",
        });
    }

    try {
        const user = await userModel.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        if (!user.resetOtp || !user.resetOtpExpireAt) {
            return res.status(400).json({ 
                success: false, 
                message: "No OTP found. Please request a new one." 
            });
        }

        if (user.resetOtpExpireAt < Date.now()) {
            return res.status(400).json({ 
                success: false, 
                message: "OTP has expired. Please request a new one." 
            });
        }

        if (String(user.resetOtp) !== String(otp)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid OTP" 
            });
        }

        // Check if new password is different from old
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                message: "New password must be different from old password"
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.resetOtp = null;
        user.resetOtpExpireAt = null;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password reset successfully!"
        });

    } catch (error) {
        console.error("❌ Reset password error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Server error during password reset" 
        });
    }
};