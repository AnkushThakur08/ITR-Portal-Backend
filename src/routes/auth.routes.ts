import express from "express";
import { validateRequest } from "../middleware/validateRequest";
import {
  sendOTP,
  verifyOTP,
  registerUser,
  loginWithPassword,
  loginWithOTP,
} from "../controllers/auth.controller";
import { protect } from "../middleware/auth";
import {
  sendOTPSchema,
  verifyOTPSchema,
  registerSchema,
  loginWithPasswordSchema,
  loginWithOTPSchema,
} from "../validations/auth.validation";

const router = express.Router();

// Send OTP
router.post("/send-otp", validateRequest(sendOTPSchema), sendOTP);

// Verify OTP
router.post("/verify-otp", validateRequest(verifyOTPSchema), verifyOTP);

// Register user
router.post("/register", validateRequest(registerSchema), registerUser);

// Login with password
router.post(
  "/login/password",
  validateRequest(loginWithPasswordSchema),
  loginWithPassword
);

// Login with OTP
router.post("/login/otp", validateRequest(loginWithOTPSchema), loginWithOTP);

// Get current user
router.get("/me", protect, (req, res) => {
  res.json({ user: req.user });
});

export default router;
