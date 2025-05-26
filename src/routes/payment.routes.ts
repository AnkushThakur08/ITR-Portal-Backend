import express from "express";
import { protect } from "@/middleware/auth";
import { createRazorpayOrders } from "@/controllers/payment.controllers";

const router = express.Router();

router.post("/create-order", protect, createRazorpayOrders);
router.post("/razorpay-webhook");

export default router;
