import express from "express";
import { protect } from "@/middleware/auth";
import {
  getUserProfile,
  getUserPayments,
  downloadInvoice,
  getUserDetails,
  updateUserDetails,
  getUserDocuments,
  deleteUserDocument,
} from "@/controllers/user.controller";

const router = express.Router();

// Dashboard API
router.get("/profile", protect, getUserProfile);

router.get("/payments", protect, getUserPayments);

router.get("/invoice", protect, downloadInvoice);

// Personal Details
router.get("/details", protect, getUserDetails);
router.patch("/details", protect, updateUserDetails);

// Document
router.get("/documents", protect, getUserDocuments);
router.delete("/documents/::filename", protect, deleteUserDocument);

export default router;
