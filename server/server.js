import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";

const app = express();

// DB connect
connectDB();

// Middlewares
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: ["https://host-r222.onrender.com","https://login-xuh4.onrender.com"],
    credentials: true,
  })
);

// Test route
app.get("/", (req, res) => {
  res.send("API working fine!!");
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

/* ===============================
   🔥 ADD THIS PART (IMPORTANT)
   =============================== */

// 👇 Sirf local me server start hoga
if (process.env.VERCEL !== "1") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`✅ Server running on PORT: ${PORT}`);
  });
}

// 👇 Vercel ke liye export
export default app;
