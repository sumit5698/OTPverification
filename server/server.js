import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();

// ✅ Connect to MongoDB
await connectDB();

// ✅ Middleware setup
app.use(express.json());
app.use(cookieParser());

// ✅ Dynamic CORS Configuration
const allowedOrigins = [
    "http://localhost:5173",
    "https://your-frontend-app.vercel.app",  // Change to your actual frontend URL
    "https://otpverification-frontend.vercel.app"  // Example
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            console.log("❌ CORS blocked for origin:", origin);
            return callback(new Error(msg), false);
        }
        
        console.log("✅ CORS allowed for origin:", origin);
        return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    exposedHeaders: ["Set-Cookie"]
}));

// ✅ Handle preflight requests
app.options("*", cors());

// ✅ Request logging middleware
app.use((req, res, next) => {
    console.log(`\n📝 ${req.method} ${req.originalUrl}`);
    console.log("📦 Body:", req.body);
    console.log("🍪 Cookies:", req.cookies);
    console.log("🌐 Origin:", req.headers.origin);
    next();
});

// ✅ Root endpoint
app.get("/", (req, res) => {
    res.json({ 
        success: true,
        message: "✅ Authentication API is running",
        version: "1.0.0",
        environment: process.env.NODE_ENV,
        endpoints: {
            auth: "/api/auth",
            user: "/api/user"
        }
    });
});

// ✅ Health check with MongoDB status
app.get("/health", async (req, res) => {
    try {
        const mongoose = require("mongoose");
        const dbState = mongoose.connection.readyState;
        
        const states = {
            0: "disconnected",
            1: "connected",
            2: "connecting",
            3: "disconnecting"
        };
        
        res.json({ 
            success: true,
            status: "healthy",
            timestamp: new Date().toISOString(),
            database: states[dbState] || "unknown",
            uptime: process.uptime()
        });
    } catch (error) {
        res.json({
            success: false,
            status: "unhealthy",
            error: error.message
        });
    }
});

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

// ✅ 404 handler
app.use("*", (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
        availableRoutes: ["/", "/health", "/api/auth/*", "/api/user/*"]
    });
});

// ✅ Error handling middleware
app.use((err, req, res, next) => {
    console.error("❌ Server error:", err.stack || err);
    
    // Handle CORS errors specifically
    if (err.message.includes("CORS")) {
        return res.status(403).json({
            success: false,
            message: "CORS policy violation",
            allowedOrigins: allowedOrigins,
            yourOrigin: req.headers.origin
        });
    }
    
    res.status(500).json({
        success: false,
        message: "Internal server error",
        error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
});

// ✅ Start server
const PORT = process.env.PORT || 10000;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
    console.log(`
    🚀 Server started successfully!
    📡 Port: ${PORT}
    🌐 Environment: ${process.env.NODE_ENV}
    🗄️  Database: ${process.env.MONGODB_URI ? "Configured" : "Not configured"}
    🔗 Local: http://localhost:${PORT}
    🔗 Health: http://localhost:${PORT}/health
    `);
});