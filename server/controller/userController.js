import userModel from "../models/userModel.js";

export const getUserData = async (req, res) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ 
                success: false, 
                message: "User ID not found in request" 
            });
        }

        const user = await userModel.findById(userId).select("-password -verifyOtp -resetOtp");

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        return res.status(200).json({
            success: true,
            userData: {
                id: user._id,
                name: user.name,
                email: user.email,
                isAccountVerified: user.isAccountVerified,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error("❌ Get user data error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Server error while fetching user data" 
        });
    }
};