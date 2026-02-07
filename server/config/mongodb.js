// config/mongodb.js
import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/men-auth`);
        console.log("✅ Database connected successfully");
    } catch (error) {
        console.error("❌ Database connection failed:", error.message);
        process.exit(1);
    }
};

export default connectDB;