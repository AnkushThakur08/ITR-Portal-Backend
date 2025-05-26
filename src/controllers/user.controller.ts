import { NextFunction, Request, Response } from "express";
import { User } from "@/models/user.model";
import { AppError } from "@/middleware/errorHandler";
import { Payment } from "@/models/payment.model";
import PDFDocument from "pdfkit";
import moment from "moment";
import fs from "fs";
import path from "path";
import QRCode from "qrcode";

export const getUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user._id).lean();

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const latestPayment = await Payment.findOne({
      userId: user._id,
      paymentStatus: "COMPLETED",
    })
      .sort({ paymentDate: -1 })
      .lean();

    const profile = {
      name: user.name,
      email: user.email,
      itrType: user.itrType,
      itrPrice: user.itrPrice,
      paymentCompleted: !!latestPayment,
      status: user.status,
      stepper: user.stepperStatus,
    };

    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
};

export const getUserPayments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payments = await Payment.find({ userId: req.user._id })
      .sort({ paymentDate: -1 })
      .select(
        "paymentDate itrType amount paymentStatus currency  paymentMethod transactionId"
      )
      .lean();

    res.status(200).json(payments);
  } catch (error) {
    next(error);
  }
};

// export const downloadInvoice = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const payment = await Payment.findOne({
//       userId: req.user._id,
//       paymentStatus: "COMPLETED",
//     })
//       .sort({ paymentDate: -1 })
//       .populate("userId", "name email")
//       .lean();

//     if (!payment) return next(new AppError("No completed payment found", 404));

//     const doc = new PDFDocument({ margin: 50 });
//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader("Content-Disposition", "attachment; filename=invoice.pdf");
//     doc.pipe(res);

//     // Load logo image (adjust path as needed)
//     const logoPath = path.join(__dirname, "../../public/logo.png");
//     if (fs.existsSync(logoPath)) {
//       doc.image(logoPath, { width: 100, align: "center" });
//     }

//     doc.moveDown();
//     doc
//       .fillColor("#444444")
//       .fontSize(24)
//       .text("Tax Filing Invoice", { align: "center" })
//       .moveDown();

//     // Metadata
//     doc
//       .fontSize(12)
//       .text(
//         `Invoice Date: ${moment(payment.paymentDate).format("DD MMM YYYY")}`
//       )
//       .text(`Transaction ID: ${payment.transactionId}`)
//       .text(`Order ID: ${payment.orderId}`)
//       .text(`User Email: ${(payment.userId as any).email}`)
//       .moveDown();

//     // Payment Info
//     doc
//       .fontSize(14)
//       .fillColor("#000000")
//       .text("Payment Details", { underline: true })
//       .moveDown(0.5);
//     doc
//       .fontSize(12)
//       .text(`Name: ${(payment.userId as any).name}`)
//       .text(`ITR Type: ${payment.itrType}`)
//       .text(`Amount Paid: ₹${payment.amount}`)
//       .text(`Payment Method: ${payment.paymentMethod}`)
//       .moveDown();

//     // GST Section (placeholder for future)
//     doc
//       .fontSize(12)
//       .fillColor("gray")
//       .text("GST Number: 29ABCDE1234F2Z5 (For future use)")
//       .moveDown();

//     // QR Code
//     const qrText = `Transaction ID: ${payment.transactionId}\nAmount: ₹${payment.amount}`;
//     const qrImage = await QRCode.toDataURL(qrText);
//     doc.image(Buffer.from(qrImage.split(",")[1], "base64"), { width: 100 });

//     // Footer
//     doc.moveDown();
//     doc
//       .fontSize(10)
//       .fillColor("gray")
//       .text("This is a computer-generated invoice for your tax filing fee.", {
//         align: "center",
//       });

//     doc.end();
//   } catch (error) {
//     next(error);
//   }
// };

export const downloadInvoice = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=invoice.pdf");
    doc.pipe(res);

    // Static data
    const staticData = {
      invoiceDate: "26 May 2025",
      transactionId: "TXN123456789",
      orderId: "ORD987654321",
      email: "johndoe@example.com",
      name: "John Doe",
      itrType: "ITR-1",
      amount: 999,
      paymentMethod: "UPI",
      gstNumber: "29ABCDE1234F2Z5",
    };

    // Load logo image (adjust path as needed)
    const logoPath = path.join(__dirname, "../../public/logo.png");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, { width: 100, align: "center" });
    }

    doc.moveDown();
    doc
      .fillColor("#444444")
      .fontSize(24)
      .text("Tax Filing Invoice", { align: "center" })
      .moveDown();

    // Metadata
    doc
      .fontSize(12)
      .text(`Invoice Date: ${staticData.invoiceDate}`)
      .text(`Transaction ID: ${staticData.transactionId}`)
      .text(`Order ID: ${staticData.orderId}`)
      .text(`User Email: ${staticData.email}`)
      .moveDown();

    // Payment Info
    doc
      .fontSize(14)
      .fillColor("#000000")
      .text("Payment Details", { underline: true })
      .moveDown(0.5);
    doc
      .fontSize(12)
      .text(`Name: ${staticData.name}`)
      .text(`ITR Type: ${staticData.itrType}`)
      .text(`Amount Paid: ${staticData.amount}`)
      .text(`Payment Method: ${staticData.paymentMethod}`)
      .moveDown();

    // GST Section
    doc
      .fontSize(12)
      .fillColor("gray")
      .text(`GST Number: ${staticData.gstNumber} (For future use)`)
      .moveDown();

    // QR Code
    const qrText = `
      Name: ${staticData.name}\n
      Email: ${staticData.email}\n
      Transaction ID: ${staticData.transactionId}\n
      Amount: ₹${staticData.amount}\n
      OrderID: ${staticData.orderId}\n
      data: ${staticData.invoiceDate} `;

    const qrImage = await QRCode.toDataURL(qrText);
    doc.image(Buffer.from(qrImage.split(",")[1], "base64"), { width: 100 });

    // Footer
    doc.moveDown();
    doc
      .fontSize(10)
      .fillColor("gray")
      .text("This is a computer-generated invoice for your tax filing fee.", {
        align: "center",
      });

    doc.end();
  } catch (error) {
    next(error);
  }
};

export const getUserDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user._id)
      .select("name email phoneNumber pan address pincode dob")
      .lean();
    if (!user) return next(new AppError("User not found", 404));

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const updateUserDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, pan, address, pincode, dob } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return next(new AppError("User not found", 404));

    user.name = name;
    user.pan = pan;
    user.address = address;
    user.pincode = pincode;
    user.dob = dob;

    await user.save();
    res.status(200).json({ message: "Personal details updated successfully" });
  } catch (error) {
    next(error);
  }
};

export const getUserDocuments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user._id).select("documents").lean();
    if (!user) return next(new AppError("User not found", 404));

    res.status(200).json(user.documents);
  } catch (error) {
    next(error);
  }
};

export const deleteUserDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { filename } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) return next(new AppError("User not found", 404));

    user.documents = user.documents.filter((doc) => doc.name !== filename);
    await user.save();

    res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    next(error);
  }
};
