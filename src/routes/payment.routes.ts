import express from "express";
import { protect } from "@/middleware/auth";
import {
  createRazorpayOrder,
  handleRazorpayWebhook,
} from "@/controllers/payment.controllers";

const router = express.Router();

router.post("/create-order", protect, createRazorpayOrder);
router.post("/razorpay-webhook", handleRazorpayWebhook);

export default router;
