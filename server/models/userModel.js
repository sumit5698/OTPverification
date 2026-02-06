
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: { type: String, required: true, unique: true },

  password: { type: String, required: true },

  verifyOtp: { type: String, default: null },

  verifyOtpExpireAt: { type: Number, default: null },

  isAccountVerified: { type: Boolean, default: false },

  resetOtp: { type: String, default: null },

  resetOtpExpireAt: { type: Number, default: null },
});


const userModel =mongoose.models.user || mongoose.model('user', userSchema)

export default userModel;