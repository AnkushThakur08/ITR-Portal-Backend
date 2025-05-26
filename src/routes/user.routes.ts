import express from "express";
import { protect } from "@/middleware/auth";
import { getUserProfile } from "@/controllers/user.controller";

const router = express.Router();

router.get("/profile", protect, getUserProfile);

export default router;
