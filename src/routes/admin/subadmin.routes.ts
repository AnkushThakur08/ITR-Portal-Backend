import express from "express";
import {
  getAdminStats,
  getSubAdminList,
} from "@/controllers/admin/subadmin.controller";
import { protect, restrictTo } from "@/middleware/auth";

const router = express.Router();

router.get("/stats", protect, restrictTo("superadmin"), getAdminStats);

router.get("/all", protect, restrictTo("superadmin"), getSubAdminList);

export default router;
