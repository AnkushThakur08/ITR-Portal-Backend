import { Request, Response, NextFunction } from "express";
import { v2 as cloudinary } from "cloudinary";
import { AppError } from "@/middleware/errorHandler";
import { ITRType } from "@/models/payment.model";
import { User } from "@/models/user.model";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const updatePersonalDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user._id;
    const {
      name,
      email,
      address,
      pincode,
      pan,
      dob,
      bankAccountNumber,
      ifscCode,
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    user.name = name;
    // user.email = email;
    user.address = address;
    user.pincode = pincode;
    user.pan = pan;
    user.dob = dob;
    user.bankAccountNumber = bankAccountNumber;
    user.ifscCode = ifscCode;
    user.stepperStatus.currentStep = 2;

    await user.save();

    res.status(200).json({ message: "Personal details updated successfully" });
  } catch (error) {
    next(error);
  }
};

export const updateIncomeSources = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user._id;
    const sources = req.body;

    const user = await User.findById(userId);
    if (!user) return next(new AppError("User not found", 404));

    user.incomeSources = sources;
    user.stepperStatus.currentStep = 3;

    const {
      salaryIncome,
      rentalIncome,
      capitalGains,
      foreignSource,
      otherSources,
      business,
    } = sources;
    let itrType = "ITR1";
    let itrPrice = 299;

    const hasCapitalOrForeign = capitalGains || foreignSource;
    const hasBusiness = business;

    if (hasCapitalOrForeign && hasBusiness) {
      itrType = "ITR3";
      itrPrice = 1999;
    } else if (hasBusiness) {
      itrType = "ITR4";
      itrPrice = 799;
    } else if (hasCapitalOrForeign) {
      itrType = "ITR2";
      itrPrice = 1499;
    }

    user.itrType = itrType as ITRType;
    user.itrPrice = itrPrice;

    await user.save();
    res
      .status(200)
      .json({ message: "Income sources updated", itrType, itrPrice });
  } catch (error) {
    next(error);
  }
};

export const uploadDocuments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user._id;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return next(new AppError("No documents uploaded", 400));
    }

    const user = await User.findById(userId);
    if (!user) return next(new AppError("User not found", 404));

    // Upload all files in parallel
    const uploads = await Promise.all(
      files.map((file) => {
        return new Promise<{
          name: string;
          url: string;
          type: string;
          uploadedAt: Date;
        }>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              resource_type: "auto",
              folder: "itr-documents",
            },
            (error, result) => {
              if (error || !result)
                return reject(error || new Error("Upload failed"));
              resolve({
                name: file.originalname,
                url: result.secure_url,
                type: file.mimetype,
                uploadedAt: new Date(),
              });
            }
          );
          stream.end(file.buffer);
        });
      })
    );

    // Push all uploaded docs at once
    user.documents.push(...uploads);
    user.stepperStatus.currentStep = 4;
    await user.save();

    res.status(200).json({
      message: "Documents uploaded to Cloudinary successfully",
      documents: uploads,
    });
  } catch (error) {
    console.error("Upload failed:", error);
    next(error);
  }
};

export const updateTaxPortalPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user._id;
    const { taxPortalPassword } = req.body;
    const user = await User.findById(userId);
    if (!user) return next(new AppError("User not found", 404));
    user.taxPortalPassword = taxPortalPassword;
    user.stepperStatus.currentStep = 5;

    await user.save();
    res.status(200).json({ message: "Tax portal password saved successfully" });
  } catch (error) {
    next(error);
  }
};
