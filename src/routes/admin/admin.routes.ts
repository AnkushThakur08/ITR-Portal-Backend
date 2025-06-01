import express from "express";
import { protect, restrictTo } from "@/middleware/auth";
import { getAdminDashboardStats, getAdminRecentITRs } from "@/controllers/admin/admin.controller";

const router = express.Router();

router.get(
  "/dashboard/stats",
  protect,
  restrictTo("superadmin"),
  getAdminDashboardStats
);

router.get(
  "/dashboard/recent-filings",
  protect,
  restrictTo("superadmin"),
  getAdminRecentITRs
);

export default router;
