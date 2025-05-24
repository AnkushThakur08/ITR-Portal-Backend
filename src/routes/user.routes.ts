import {
  updateIncomeSources,
  updatePersonalDetails,
  uploadDocuments,
} from "@/controllers/user.controller";
import { protect } from "@/middleware/auth";
import { validateRequest } from "@/middleware/validateRequest";
import {
  incomeSourcesSchema,
  personalDetailsSchema,
} from "@/validations/user.validation";
import express from "express";

const router = express.Router();

router.patch(
  "/personal-details",
  protect,
  validateRequest(personalDetailsSchema),
  updatePersonalDetails
);

router.patch(
  "/income-sources",
  protect,
  validateRequest(incomeSourcesSchema),
  updateIncomeSources
);

router.post("/upload-documents", protect, uploadDocuments);

export default router;
