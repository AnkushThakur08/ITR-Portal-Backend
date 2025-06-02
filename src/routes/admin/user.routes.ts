import express from "express";
import { protect, restrictTo } from "@/middleware/auth";
import { validateRequest } from "@/middleware/validateRequest";
import {
  assignUserToAdmin,
  exportAdminUsers,
  getAdminUserDetails,
  getAdminUsers,
  softDeleteUser,
  updateUserByAdmin,
} from "@/controllers/admin/user.controller";
import { updateUserByAdminSchema } from "@/validations/admin/auth.validation";

const router = express.Router();

// GET ALL USER
router.get("/users", protect, restrictTo("admin", "superadmin"), getAdminUsers);

// UPDATE USER
router.patch(
  "/users/:userId",
  protect,
  restrictTo("admin", "superadmin"),
  validateRequest(updateUserByAdminSchema),
  updateUserByAdmin
);

// DELETE USER
router.delete(
  "/users/:userId",
  protect,
  restrictTo("admin", "superadmin"),
  softDeleteUser
);

// Export Data
router.get(
  "/users/export",
  protect,
  restrictTo("admin", "superadmin"),
  exportAdminUsers
);

// GET USER DETAILS
router.get(
  "/users/:userId",
  protect,
  restrictTo("admin", "superadmin"),
  getAdminUserDetails
);

// ASSIGN ADMIN
router.patch(
  "/users/:userId/assign",
  protect,
  restrictTo("admin", "superadmin"),
  assignUserToAdmin
);

export default router;
