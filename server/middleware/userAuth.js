import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
    try {
        // Get token from cookies
        const token = req.cookies?.token;
        
        console.log("🔍 Auth Middleware - Token:", token ? "Found" : "Not found");

        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Not authorized. Please login.' 
            });
        }

        // Verify token
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET || "local-secret-key");
        
        // Attach userId to request
        req.userId = tokenDecode.id;
        
        console.log("✅ User authenticated, ID:", req.userId);
        
        next();
        
    } catch (error) {
        console.error("❌ Auth error:", error.message);
        
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token. Please login again.' 
            });
        }
        
        return res.status(401).json({ 
            success: false, 
            message: 'Authentication failed.' 
        });
    }
};

export default userAuth;