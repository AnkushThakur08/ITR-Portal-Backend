import express from "express";
import { adminLoginSchema } from "@/validations/admin/admin.auth.validation";
import { adminLogin } from "@/controllers/admin/admin.auth.controller";
import { validateRequest } from "@/middleware/validateRequest";

const router = express.Router();

router.post("/login", validateRequest(adminLoginSchema), adminLogin);

export default router;
