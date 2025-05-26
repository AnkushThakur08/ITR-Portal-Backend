// src/models/payment.model.ts
import mongoose, { Document, Schema } from "mongoose";

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED";
export type PaymentMethod = "ONLINE" | "UPI" | "CARD";
export type ITRType = "ITR1" | "ITR2" | "ITR3" | "ITR4";

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  orderId: string;
  amount: number;
  currency: string;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  paymentDate?: Date;
  itrType: ITRType;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED"],
      default: "PENDING",
    },
    paymentMethod: {
      type: String,
      enum: ["ONLINE", "UPI", "CARD"],
      required: true,
    },
    transactionId: {
      type: String,
    },
    paymentDate: {
      type: Date,
    },
    itrType: {
      type: String,
      enum: ["ITR1", "ITR2", "ITR3", "ITR4"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Payment = mongoose.model<IPayment>("Payment", paymentSchema);
