import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/auth.routes";
import onboardingRoutes from "./routes/onboarding.routes";
import userRoutes from "./routes/user.routes";
// import adminRoutes from "./routes/admin.routes";
// import documentRoutes from "./routes/document.routes";
// import paymentRoutes from "./routes/payment.routes";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/onboarding", onboardingRoutes);
app.use("/api/v1/user", userRoutes);
// app.use("/api/v1/admin", adminRoutes);
// app.use("/api/v1/documents", documentRoutes);
// app.use("/api/v1/payments", paymentRoutes);

// Error handling middleware
app.use(errorHandler);

console.log("process.env.MONGODB_URI", process.env.MONGODB_URI);

// Connect to MongoDB
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/itr-filing";
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
