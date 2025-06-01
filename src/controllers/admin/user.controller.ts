import { User } from "@/models/user.model";
import { NextFunction, Request, Response } from "express";
import ExcelJS from "exceljs";
import { AppError } from "@/middleware/errorHandler";
import { Payment } from "@/models/payment.model";

export const getAdminUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { search, status, assignedTo, journey } = req.query;

    const query: any = { role: "client" };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
      ];
    }

    if (status) query.status = status;
    if (assignedTo) query.assignedTo = assignedTo;
    if (journey) query["stepperStatus.currentStep"] = Number(journey);

    const users = await User.find(query)
      .populate("assignedTo", "name email")
      .select("name phoneNumber email itrType stepperStatus status assignedTo");

    const response = users.map((user) => ({
      _id: user._id,
      name: user.name,
      phoneNumber: user.phoneNumber,
      email: user.email,
      itrType: user.itrType,
      currentJourney: `Step ${user.stepperStatus?.currentStep}`,
      assignedTo: user.assignedTo ? user.assignedTo : "Unassigned",
      status: user.status,
    }));

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const updateUserByAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    const user = await User.findById(userId);
    if (!user || user.role !== "client") {
      return next(new AppError("User not found", 404));
    }

    Object.assign(user, updates);

    await user.save();

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    next(error);
  }
};

export const softDeleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user || user.role !== "client") {
      return next(new AppError("User not found", 404));
    }

    user.status = "blocked"; // mark as deleted
    await user.save();

    res
      .status(200)
      .json({ message: "User blocked (soft deleted) successfully" });
  } catch (error) {
    next(error);
  }
};

export const exportAdminUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { search, status, assignedTo, journey } = req.query;

    const query: any = { role: "client" };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
      ];
    }

    if (status) query.status = status;
    if (assignedTo) query.assignedTo = assignedTo;
    if (journey) query["stepperStatus.currentStep"] = Number(journey);

    const users = await User.find(query).populate("assignedTo", "name");

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("ITR Users");

    sheet.columns = [
      { header: "Name", key: "name", width: 25 },
      { header: "Phone", key: "phoneNumber", width: 15 },
      { header: "Email", key: "email", width: 25 },
      { header: "ITR Type", key: "itrType", width: 10 },
      { header: "Journey Step", key: "journey", width: 15 },
      { header: "Assigned To", key: "assignedTo", width: 20 },
      { header: "Status", key: "status", width: 15 },
    ];

    users.forEach((user) => {
      sheet.addRow({
        name: user.name,
        phoneNumber: user.phoneNumber,
        email: user.email,
        itrType: user.itrType,
        journey: `Step ${user.stepperStatus?.currentStep || 1}`,
        assignedTo: user.assignedTo || "Unassigned",
        status: user.status,
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=ITR-Users.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};

export const getAdminUserDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .populate("assignedTo", "name email")
      .select("-password -otp -otpExpiry");

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const payments = await Payment.find({
      userId: user._id,
      paymentStatus: "COMPLETED",
    }).sort({ paymentDate: -1 });

    res.status(200).json({
      user,
      documents: user.documents,
      payments,
    });
  } catch (error) {
    next(error);
  }
};
