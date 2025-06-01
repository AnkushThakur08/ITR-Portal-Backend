import { NextFunction, Request, Response } from "express";
import { User } from "@/models/user.model";
import { AppError } from "@/middleware/errorHandler";
import jwt from "jsonwebtoken";

export const adminLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
      return next(new AppError("Admin Not Found", 404));
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return next(new AppError("Invalid Credentails", 404));
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    res.status(200).json({ user, token });
  } catch (error) {
    next(error);
  }
};

export const adminSignup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password, role, phoneNumber } = req.body;

    const existingUser = await User.findOne({ email, phoneNumber });

    if (existingUser) {
      return next(new AppError("User Already Exits", 400));
    }

    const newUser = new User({
      name,
      email,
      password,
      role: role,
      phoneNumber,
    });

    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    res.status(201).json({ token, role: newUser.role, newUser });
  } catch (error) {
    console.log("error", error);
    next(error);
  }
};
