import { AppError } from "@/middleware/errorHandler";
import { ITRType } from "@/models/payment.model";
import { User } from "@/models/user.model";
import { Request, Response, NextFunction } from "express";

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

    files.forEach((file) => {
      user.documents.push({
        name: file.originalname,
        url: file.path,
        type: file.mimetype,
        uploadedAt: new Date(),
      });
    });

    user.stepperStatus.currentStep = 4;
    await user.save();

    res.status(200).json({ message: "Documents uploaded successfully" });
  } catch (error) {
    next(error);
  }
};
