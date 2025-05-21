import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  phoneNumber: string;
  email?: string;
  name?: string;
  address?: string;
  pan?: string;
  age?: number;
  password?: string;
  role: "client" | "admin" | "superadmin";
  userType?: "individual" | "business";
  incomeSources: {
    salary: boolean;
    houseProperty: boolean;
    business: boolean;
    capitalGains: boolean;
    otherSources: boolean;
    foreignSource: boolean;
  };
  itrType?: "ITR1" | "ITR2" | "ITR3" | "ITR4";
  documents: {
    name: string;
    url: string;
    type: string;
    uploadedAt: Date;
  }[];
  taxPortalPassword?: string;
  assignedTo?: mongoose.Types.ObjectId;
  status:
    | "pending"
    | "in_progress"
    | "completed"
    | "blocked"
    | "pending_on_client"
    | "payment_pending";
  remarks?: string;
  otp?: string;
  otpExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      sparse: true,
      required: true,
      unique: true,
    },
    name: String,
    address: String,
    pan: String,
    age: Number,
    password: String,
    role: {
      type: String,
      enum: ["client", "admin", "superadmin"],
      default: "client",
    },
    userType: {
      type: String,
      enum: ["individual", "business"],
    },
    incomeSources: {
      salary: { type: Boolean, default: false },
      houseProperty: { type: Boolean, default: false },
      business: { type: Boolean, default: false },
      capitalGains: { type: Boolean, default: false },
      otherSources: { type: Boolean, default: false },
      foreignSource: { type: Boolean, default: false },
    },
    itrType: {
      type: String,
      enum: ["ITR1", "ITR2", "ITR3", "ITR4"],
    },
    documents: [
      {
        name: String,
        url: String,
        type: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    taxPortalPassword: String,
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: [
        "pending",
        "in_progress",
        "completed",
        "blocked",
        "pending_on_client",
        "payment_pending",
      ],
      default: "pending",
    },
    remarks: String,
    otp: String,
    otpExpiry: Date,
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("password") && this.password) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>("User", userSchema);
