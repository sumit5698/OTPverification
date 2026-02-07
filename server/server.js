// server.js or index.js
import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";

const app = express();

// Load environment variables
if (process.env.NODE_ENV !== "production") {
    import('dotenv').then(dotenv => dotenv.config());
}

// Middlewares
app.use(express.json());
app.use(cookieParser());

// CORS configuration
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
}));

// Handle preflight requests
app.options("*", cors());

// DB connect
connectDB();

// Test route
app.get("/", (req, res) => {
    res.send("✅ API working fine!!");
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on PORT: ${PORT}`);
    console.log(`🌐 http://localhost:${PORT}`);
});