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
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ IMPORTANT: CORS Configuration for Render.com
const allowedOrigins = [
    "https://otpverification-nfgo.onrender.com", // Your frontend URL
    "http://localhost:5173", // Local development
    "http://localhost:3000",
    "https://otpverification.vercel.app" // Add other domains if needed
];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) {
            console.log("⚠️ No origin header, allowing request");
            return callback(null, true);
        }
        
        console.log("🌐 Checking origin:", origin);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            console.log("✅ Origin allowed:", origin);
            return callback(null, true);
        } else {
            // Check if it's a subdomain of render.com
            if (origin.endsWith('.onrender.com')) {
                console.log("✅ Allowing render.com subdomain:", origin);
                return callback(null, true);
            }
            
            console.log("❌ Origin not allowed:", origin);
            const msg = `The CORS policy for this site does not allow access from ${origin}`;
            return callback(new Error(msg), false);
        }
    },
    credentials: true, // IMPORTANT: Allow cookies
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Accept",
        "Origin",
        "Access-Control-Allow-Origin",
        "Access-Control-Allow-Credentials"
    ],
    exposedHeaders: [
        "Set-Cookie",
        "Date",
        "ETag"
    ],
    maxAge: 600, // How long the results of a preflight request can be cached
    optionsSuccessStatus: 204
};

// ✅ Apply CORS middleware
app.use(cors(corsOptions));

// ✅ Handle preflight requests explicitly
app.options("*", cors(corsOptions));

// ✅ Logging middleware
app.use((req, res, next) => {
    console.log(`\n📝 ${req.method} ${req.originalUrl}`);
    console.log("🌐 Origin:", req.headers.origin);
    console.log("📦 Body:", req.body);
    console.log("🍪 Cookies:", req.cookies);
    console.log("🔑 Auth Header:", req.headers.authorization);
    next();
});

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

// ✅ Health check endpoint
app.get("/health", (req, res) => {
    res.json({
        success: true,
        message: "Server is healthy",
        timestamp: new Date().toISOString(),
        cors: {
            allowedOrigins: allowedOrigins,
            currentOrigin: req.headers.origin
        }
    });
});

// ✅ Root endpoint
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Authentication API",
        endpoints: [
            "GET    /health",
            "POST   /api/auth/register",
            "POST   /api/auth/login",
            "GET    /api/auth/is-auth",
            "GET    /api/auth/logout",
            "GET    /api/user/data",
            "POST   /api/auth/send-verify-otp",
            "POST   /api/auth/verify-email",
            "POST   /api/auth/send-reset-otp",
            "POST   /api/auth/reset-password"
        ],
        cors: {
            allowedOrigins: allowedOrigins
        }
    });
});

// ✅ 404 handler
app.use("*", (req, res) => {
    res.status(404).json({
        success: false,
        message: "Endpoint not found",
        requestedUrl: req.originalUrl,
        availableEndpoints: ["/", "/health", "/api/auth/*", "/api/user/*"]
    });
});

// ✅ Error handler
app.use((err, req, res, next) => {
    console.error("❌ Server error:", err.message);
    
    // Handle CORS errors
    if (err.message.includes("CORS")) {
        return res.status(403).json({
            success: false,
            message: err.message,
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
app.listen(PORT, () => {
    console.log(`
    🚀 Server started on port ${PORT}
    🌐 Environment: ${process.env.NODE_ENV}
    🔗 Health check: https://otpverification-api.onrender.com/health
    🔗 Frontend: https://otpverification-nfgo.onrender.com
    `);
    
    console.log("\n✅ CORS Allowed Origins:");
    allowedOrigins.forEach(origin => console.log(`   - ${origin}`));
    console.log("   - All *.onrender.com subdomains");
});