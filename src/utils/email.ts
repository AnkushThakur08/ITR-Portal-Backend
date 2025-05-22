import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<void> => {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER, // Same as auth.user
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
  } catch (error) {
    console.error("Email error:", error);
    throw error;
  }
};

export const sendWelcomeEmail = async (
  email: string,
  name: string
): Promise<void> => {
  const subject = "Welcome to ITR Filing Portal";
  const html = `
    <h1>Welcome ${name}!</h1>
    <p>Thank you for registering with ITR Filing Portal.</p>
    <p>Best regards,<br>ITR Filing Portal Team</p>
  `;
  await sendEmail(email, subject, html);
};

export const sendOTPEmail = async (
  email: string,
  otp: string,
  name: string,
): Promise<void> => {
  const subject = "Your OTP for ITR Filing Portal";
  const html = `
    <h2>Complete Your Verification</h2>
    <p>Dear ${name},</p>
    <p>Thank you for registering with <strong>ITR Filing Portal</strong>.</p>
    <p>To complete your registration, please verify your contact information using the One-Time Password (OTP) below:</p>
    <h3 style="color:#2E86C1;">Your OTP: <strong>${otp}</strong></h3>
    <p>This OTP has been sent to both your registered email and mobile number and is valid for the next <strong>10 minutes</strong>.</p>
    <p>Please do not share this OTP with anyone. If you did not initiate this request, kindly ignore this message or contact our support team immediately.</p>
    <br>
    <p>Best regards,<br>
    ITR Filing Portal Team</p>
  `;
  await sendEmail(email, subject, html);
};
