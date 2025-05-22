import { Request, Response } from "express";
import { User } from "../models/user.model";
import jwt from "jsonwebtoken";
import { SignOptions } from "jsonwebtoken";
import { validateRequest } from "../middleware/validateRequest";
import {
  registerSchema,
  loginSchema,
  verifyOTPSchema,
  sendOTPSchema,
} from "../validations/auth.validation";
import { generateOTP, sendOTP } from "../utils/otp";
import { sendWelcomeEmail, sendOTPEmail } from "../utils/email";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// JWT sign options
const jwtOptions: SignOptions = {
  expiresIn: "24h",
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, phoneNumber, password, userType } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phoneNumber }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    const user = new User({
      name,
      email,
      phoneNumber,
      password,
      userType,
      role: "client",
    });

    await user.save();

    // Generate OTP
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    // Send OTP via SMS
    // await sendOTP(phoneNumber, otp);

    // Send welcome email with OTP
    await sendOTPEmail(email, otp, name);

    res.status(201).json({
      message: "User registered successfully. Please verify your account using the OTP sent.",
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Error registering user" });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, otp } = req.body;

    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(401).json({ message: "Invalid phone number" });
    }

    if (user.otp !== otp || !user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(401).json({ message: "Invalid or expired OTP" });
    }

    // Clear OTP
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const token = jwt.sign(
      { userId: user._id.toString() },
      JWT_SECRET,
      jwtOptions
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        userType: user.userType,
      },
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ message: "Error verifying OTP" });
  }
};

export const loginWithPassword = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, password } = req.body;

    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(401).json({ message: "User does not exist" });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id.toString() },
      JWT_SECRET,
      jwtOptions
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        userType: user.userType,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error logging in" });
  }
};

export const loginWithPhone = async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.body;

    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(401).json({ message: "User does not exist" });
    }

    // Generate OTP
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    // Send OTP
    // await sendOTP(phoneNumber, otp);

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error sending OTP" });
  }
};

export const sendOTPController = async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.body;

    // Check if user exists
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate OTP
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    // Send OTP
    await sendOTP(phoneNumber, otp);

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ message: "Error sending OTP" });
  }
};

export const authController = {
  registerUser: [validateRequest(registerSchema), registerUser],
  loginWithPassword: [validateRequest(loginSchema), loginWithPassword],
  loginWithPhone: [validateRequest(loginSchema), loginWithPhone],
  verifyOTP: [validateRequest(verifyOTPSchema), verifyOTP],
  sendOTP: [validateRequest(sendOTPSchema), sendOTPController],
};
