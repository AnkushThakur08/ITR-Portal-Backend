import express from "express";
import {
  adminLoginSchema,
  adminSignupSchema,
} from "@/validations/admin/auth.validation";
import {
  adminLogin,
  adminSignup,
} from "@/controllers/admin/auth.controller";
import { validateRequest } from "@/middleware/validateRequest";

const router = express.Router();

router.post("/login", validateRequest(adminLoginSchema), adminLogin);

router.post("/signup", validateRequest(adminSignupSchema), adminSignup);

export default router;
