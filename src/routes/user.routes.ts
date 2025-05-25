import multer from "multer";
import express from "express";
import { protect } from "@/middleware/auth";
import { validateRequest } from "@/middleware/validateRequest";
import {
  updateIncomeSources,
  updatePersonalDetails,
  uploadDocuments,
} from "@/controllers/user.controller";
import {
  incomeSourcesSchema,
  personalDetailsSchema,
} from "@/validations/user.validation";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

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

router.post(
  "/upload-documents",
  protect,
  upload.array("documents"),
  uploadDocuments
);

export default router;
