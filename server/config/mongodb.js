// config/mongodb.js
import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;
        
        if (!mongoURI) {
            console.warn("⚠️ MONGODB_URI not set, skipping database connection");
            return;
        }
        
        console.log("🔗 Connecting to MongoDB...");
        await mongoose.connect(mongoURI);
        console.log("✅ MongoDB connected successfully");
    } catch (error) {
        console.error("❌ MongoDB connection failed:", error.message);
        // Don't exit process in production
        if (process.env.NODE_ENV !== "production") {
            process.exit(1);
        }
    }
};

export default connectDB;