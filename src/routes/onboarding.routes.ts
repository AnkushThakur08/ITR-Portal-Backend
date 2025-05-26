import multer from "multer";
import express from "express";
import { protect } from "@/middleware/auth";
import { validateRequest } from "@/middleware/validateRequest";
import {
  updateIncomeSources,
  updatePersonalDetails,
  updateTaxPortalPassword,
  uploadDocuments,
} from "@/controllers/onboarding.controller";
import {
  incomeSourcesSchema,
  personalDetailsSchema,
  taxPortalPasswordSchema,
} from "@/validations/onboarding.validation";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Personal Details
router.patch(
  "/personal-details",
  protect,
  validateRequest(personalDetailsSchema),
  updatePersonalDetails
);

// Income Source
router.patch(
  "/income-sources",
  protect,
  validateRequest(incomeSourcesSchema),
  updateIncomeSources
);

// Upload Document
router.post(
  "/upload-documents",
  protect,
  upload.array("documents"),
  uploadDocuments
);

// Tax Password
router.patch(
  "/tax-password",
  protect,
  validateRequest(taxPortalPasswordSchema),
  updateTaxPortalPassword
);

export default router;
