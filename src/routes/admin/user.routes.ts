import express from "express";
import { protect, restrictTo } from "@/middleware/auth";
import { validateRequest } from "@/middleware/validateRequest";
import {
  exportAdminUsers,
  getAdminUserDetails,
  getAdminUsers,
  softDeleteUser,
  updateUserByAdmin,
} from "@/controllers/admin/user.controller";
import { updateUserByAdminSchema } from "@/validations/admin/auth.validation";

const router = express.Router();

router.get("/users", protect, restrictTo("admin", "superadmin"), getAdminUsers);

router.patch(
  "/users/:userId",
  protect,
  restrictTo("admin", "superadmin"),
  validateRequest(updateUserByAdminSchema),
  updateUserByAdmin
);

router.delete(
  "/users/:userId",
  protect,
  restrictTo("admin", "superadmin"),
  softDeleteUser
);

router.get(
  "/users/export",
  protect,
  restrictTo("admin", "superadmin"),
  exportAdminUsers
);

router.get(
  "/users/:userId",
  protect,
  restrictTo("admin", "superadmin"),
  getAdminUserDetails
);

export default router;
