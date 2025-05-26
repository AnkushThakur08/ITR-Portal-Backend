import express from "express";
import { protect } from "@/middleware/auth";
import { getUserProfile, getUserPayments, downloadInvoice } from "@/controllers/user.controller";

const router = express.Router();

router.get("/profile", protect, getUserProfile);

router.get("/payments", protect, getUserPayments);

router.get("/invoice", protect, downloadInvoice);

export default router;
