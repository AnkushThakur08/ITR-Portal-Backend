import { NextFunction, Request, Response } from "express";
import { User } from "@/models/user.model";
import { AppError } from "@/middleware/errorHandler";
import { Payment } from "@/models/payment.model";

export const getUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user._id).lean();

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const latestPayment = await Payment.findOne({
      userId: user._id,
      paymentStatus: "COMPLETED",
    })
      .sort({ paymentDate: -1 })
      .lean();

    const profile = {
      name: user.name,
      email: user.email,
      itrType: user.itrType,
      itrPrice: user.itrPrice,
      paymentCompleted: !!latestPayment,
      status: user.status,
      stepper: user.stepperStatus,
    };

    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
};
