// server.js
import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";

const app = express();

// Log environment for debugging
console.log("🔧 Environment Variables:");
console.log("- NODE_ENV:", process.env.NODE_ENV);
console.log("- PORT:", process.env.PORT);
console.log("- JWT_SECRET:", process.env.JWT_SECRET ? "Set" : "Not set");
console.log("- MONGODB_URI:", process.env.MONGODB_URI ? "Set" : "Not set");

// Middlewares
app.use(express.json());
app.use(cookieParser());

// CORS configuration
app.use(cors({
    origin: "*", // सभी domains allow करें
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Handle preflight requests
app.options("*", cors());

// Test endpoint - यहाँ तक पहुँच सकते हैं कि नहीं
app.get("/test", (req, res) => {
    res.json({ 
        message: "✅ Test endpoint is working!",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        port: process.env.PORT
    });
});

// DB connect
connectDB();

// Root endpoint
app.get("/", (req, res) => {
    res.json({ 
        message: "✅ Authentication API is running!",
        version: "1.0.0",
        endpoints: {
            test: "/test",
            health: "/health",
            auth: "/api/auth",
            user: "/api/user"
        }
    });
});

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ 
        status: "healthy",
        service: "authentication-api",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

// 404 handler
app.use("*", (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
        suggestion: "Try /test or /health endpoints"
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error("❌ Server error:", err);
    res.status(500).json({
        success: false,
        message: "Internal server error",
        error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
});

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server is running!`);
    console.log(`📍 Port: ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 URL: http://0.0.0.0:${PORT}`);
});