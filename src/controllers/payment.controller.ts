import { NextFunction, Request, Response } from "express";
import { AppError } from "@/middleware/errorHandler";
import { User } from "@/models/user.model";
import { Payment } from "@/models/payment.model";
import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const createRazorpayOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return next(new AppError("User not found", 404));

    const options = {
      amount: user.itrPrice! * 100, // convert to paise
      currency: "INR",
      receipt: `receipt_${user._id}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    await Payment.create({
      userId: user._id,
      orderId: order.id,
      amount: Number(order.amount) / 100,
      currency: order.currency,
      paymentStatus: "PENDING",
      paymentMethod: "ONLINE", // default fallback
      itrType: user.itrType!,
    });
    
    res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    next(error);
  }
};

export const handleRazorpayWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
    const signature = req.headers["x-razorpay-signature"] as string;
    const body = JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    const event = req.body;

    if (event.event === "payment.captured") {
      const paymentEntity = event.payload.payment.entity;
      const orderId = paymentEntity.order_id;

      const paymentDoc = await Payment.findOne({ orderId });
      if (paymentDoc) {
        paymentDoc.paymentStatus = "COMPLETED";
        paymentDoc.paymentMethod = paymentEntity.method.toUpperCase();
        paymentDoc.transactionId = paymentEntity.id;
        paymentDoc.paymentDate = new Date(paymentEntity.created_at * 1000);
        await paymentDoc.save();

        const user = await User.findById(paymentDoc.userId);
        if (user) {
          user.stepperStatus.isCompleted = true;
          user.status = "payment_pending";
          await user.save();
        }
      }
    }

    res.status(200).json({ message: "Webhook received" });
  } catch (error) {
    next(error);
  }
};
