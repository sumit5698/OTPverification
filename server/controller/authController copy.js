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
        return res.json({ success: false, message: "Missing Details" });
    }

    try {
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.json({ success: false, message: "User already exists" });
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
            JWT_SECRET, // ✅ Use consistent secret
            { expiresIn: "7d" }
        );

        // ✅ LOCAL COOKIE SETTINGS
        res.cookie("token", token, {
            httpOnly: true,
            secure: false, // false for localhost
            sameSite: "lax", // lax for localhost
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        // Email (optional for local testing)
        if (process.env.SENDER_EMAIL) {
            const mailOption = {
                from: process.env.SENDER_EMAIL,
                to: email,
                subject: "Welcome to Sumit Website",
                text: `Welcome to Sumit Website. Your account has been created with email id: ${email}`,
            };
            await transporter.sendMail(mailOption);
        }

        return res.json({ 
            success: true, 
            message: "Registered successfully",
            token: token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("❌ Register error:", error);
        return res.json({ success: false, message: error.message });
    }
};

/* ================= LOGIN ================= */
export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({
            success: false,
            message: "Email and password are required",
        });
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "Invalid email" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid password" });
        }

        const token = jwt.sign(
            { id: user._id },
            JWT_SECRET, // ✅ Use consistent secret
            { expiresIn: "7d" }
        );

        // ✅ LOCAL COOKIE SETTINGS
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.json({ 
            success: true, 
            message: "Login successful",
            token: token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("❌ Login error:", error);
        return res.json({ success: false, message: error.message });
    }
};

/* ================= LOGOUT ================= */
export const logout = async (req, res) => {
    try {
        res.clearCookie("token", {
            path: "/",
        });

        return res.json({ success: true, message: "Logged Out" });

    } catch (error) {
        console.error("❌ Logout error:", error);
        return res.json({ success: false, message: error.message });
    }
};

/* ================= CHECK AUTH ================= */
export const isAuthenticated = async (req, res) => {
  try {
    // Get token from cookies
    const token = req.cookies?.token;
    
    console.log("🔍 is-auth called. Token:", token ? "Found" : "Not found");
    
    if (!token) {
      return res.status(200).json({ 
        success: true,
        authenticated: false,
        message: "No authentication token found" 
      });
    }
    
    // ✅ Use SAME secret
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user from database
    const user = await userModel.findById(decoded.id).select("-password");
    
    if (!user) {
      return res.status(200).json({
        success: true,
        authenticated: false,
        message: "User not found"
      });
    }
    
    return res.status(200).json({
      success: true,
      authenticated: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
    
  } catch (error) {
    console.error("❌ is-auth error:", error.message);
    
    return res.status(200).json({
      success: true,
      authenticated: false,
      message: "Invalid or expired token"
    });
  }
};

/* ================= SEND VERIFY OTP ================= */
export const sendVerityOtp = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.json({ success: false, message: "UserId is required" });
        }

        const user = await userModel.findById(userId);

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        if (user.isAccountVerified) {
            return res.json({ success: false, message: "Account already verified" });
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 10 * 60 * 1000;

        await user.save();

        // Email (optional for local testing)
        if (process.env.SENDER_EMAIL) {
            const mailOption = {
                from: process.env.SENDER_EMAIL,
                to: user.email,
                subject: "Account Verification OTP",
                text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
            };
            await transporter.sendMail(mailOption);
        }

        return res.json({
            success: true,
            message: "Verification OTP sent",
            otp: otp
        });

    } catch (error) {
        console.error("❌ Send verify OTP error:", error);
        return res.json({ success: false, message: error.message });
    }
};

/* ================= VERIFY EMAIL ================= */
export const verifyEmail = async (req, res) => {
    try {
        const { userId, otp } = req.body;

        if (!userId || !otp) {
            return res.json({ success: false, message: "Missing details" });
        }

        const user = await userModel.findById(userId);
        if (!user) return res.json({ success: false, message: "User not found" });

        if (user.verifyOtpExpireAt < Date.now())
            return res.json({ success: false, message: "OTP expired" });

        if (String(user.verifyOtp) !== String(otp))
            return res.json({ success: false, message: "Invalid OTP" });

        user.isAccountVerified = true;
        user.verifyOtp = null;
        user.verifyOtpExpireAt = null;

        await user.save();

        return res.json({
            success: true,
            message: "Email verified successfully",
        });

    } catch (error) {
        console.error("❌ Verify email error:", error);
        return res.json({ success: false, message: error.message });
    }
};

/* ================= SEND RESET OTP ================= */
export const sendResetOtp = async (req, res) => {
    const { email } = req.body || {};

    if (!email) {
        return res.json({ success: false, message: "Email is required" });
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user) return res.json({ success: false, message: "User not found" });

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 10 * 60 * 1000;

        await user.save();

        // Email (optional for local testing)
        if (process.env.SENDER_EMAIL) {
            const mailOption = {
                from: process.env.SENDER_EMAIL,
                to: user.email,
                subject: "Password Reset OTP",
                text: `Your OTP for resetting password is ${otp}`,
            };
            await transporter.sendMail(mailOption);
        }

        return res.json({ 
            success: true, 
            message: "OTP sent to email",
            otp: otp
        });

    } catch (error) {
        console.error("❌ Send reset OTP error:", error);
        return res.json({ success: false, message: error.message });
    }
};

/* ================= RESET PASSWORD ================= */
export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.json({
            success: false,
            message: "Email, otp and new password required",
        });
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user) return res.json({ success: false, message: "User not found" });

        if (user.resetOtp !== otp)
            return res.json({ success: false, message: "Invalid OTP" });

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.resetOtp = "";
        user.resetOtpExpireAt = 0;

        await user.save();

        return res.json({
            success: true,
            message: "Password reset successful",
        });

    } catch (error) {
        console.error("❌ Reset password error:", error);
        return res.json({ success: false, message: error.message });
    }
};