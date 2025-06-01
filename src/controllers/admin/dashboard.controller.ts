import { NextFunction, Request, Response } from "express";
import { User } from "@/models/user.model";
import { Payment } from "@/models/payment.model";
import moment from "moment";

// DASHBOARD
export const getAdminDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const totalUsers = await User.countDocuments({ role: "client" });
    const completedITRs = await User.countDocuments({ status: "completed" });
    const pendingITRs = await User.countDocuments({ status: "pending" });
    const issuesReported = 12; // static or from separate Issue model if exists

    res.status(200).json({
      totalUsers,
      completedITRs,
      pendingITRs,
      issuesReported,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminRecentITRs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const recentUsers = await User.find({ role: "client" })
      .sort({ updatedAt: -1 })
      .limit(10)
      .select("name email itrType status updatedAt");

    const enriched = await Promise.all(
      recentUsers.map(async (user) => {
        const payment = await Payment.findOne({
          userId: user._id,
          paymentStatus: "COMPLETED",
        })
          .sort({ paymentDate: -1 })
          .lean();

        return {
          name: user.name,
          email: user.email,
          itrType: user.itrType,
          status: user.status,
          date: payment?.paymentDate
            ? moment(payment.paymentDate).format("YYYY-MM-DD")
            : null,
          amount: payment?.amount || null,
          invoiceUrl: payment?.transactionId
            ? `/api/v1/users/invoice/${payment.transactionId}`
            : null,
        };
      })
    );

    res.status(200).json(enriched);
  } catch (error) {
    next(error);
  }
};
