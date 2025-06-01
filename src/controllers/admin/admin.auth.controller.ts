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
    if (!user) {
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

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};
