import express from "express";
import { protect } from "@/middleware/auth";
import {
  sendOTPSchema,
  verifyOTPSchema,
  registerSchema,
  loginWithPasswordSchema,
  loginWithOTPSchema,
} from "../validations/auth.validation";
import { loginWithPassword, loginWithPhone, registerUser, verifyOTP } from "@/controllers/auth.controller";
import { validateRequest } from "@/middleware/validateRequest";

const router = express.Router();

// Register user
router.post("/register", validateRequest(registerSchema), registerUser);

// Verify OTP
router.post("/verify-otp", validateRequest(verifyOTPSchema), verifyOTP);

// Login with password
router.post("/login/password", validateRequest(loginWithPasswordSchema), loginWithPassword);

// Login with OTP
router.post("/login/otp", validateRequest(loginWithOTPSchema), loginWithPhone);


// Send OTP
// router.post("/send-otp", validateRequest(sendOTPSchema), sendOTPController);




// Get current user
// router.get("/me", protect, (req, res) => {
//   res.json({ user: req.user });
// });

// Check API
router.get("/check", (req, res) => {
  res.send("API is working");
});

export default router;
