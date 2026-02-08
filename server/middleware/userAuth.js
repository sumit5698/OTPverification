import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "local-secret-key";

const userAuth = async (req, res, next) => {
    try {
        // Get token from cookies
        const token = req.cookies?.token;
        
        console.log("🔍 Auth Middleware - Token:", token ? "Present" : "Not present");

        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Authentication required. Please login.' 
            });
        }

        let tokenDecode;
        try {
            tokenDecode = jwt.verify(token, JWT_SECRET);
        } catch (jwtError) {
            console.log("❌ Token verification failed:", jwtError.message);
            
            if (jwtError.name === "TokenExpiredError") {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Session expired. Please login again.' 
                });
            }
            
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token. Please login again.' 
            });
        }

        // Attach userId to request
        req.userId = tokenDecode.id;
        
        console.log("✅ User authenticated, ID:", req.userId);
        
        next();
        
    } catch (error) {
        console.error("❌ Auth middleware error:", error);
        
        return res.status(500).json({ 
            success: false, 
            message: 'Authentication server error.' 
        });
    }
};

export default userAuth;