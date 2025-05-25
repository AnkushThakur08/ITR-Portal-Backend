import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IStepperStatus {
  currentStep: 1 | 2 | 3 | 4 | 5;
  isCompleted: boolean;
}

export interface IUser extends Document {
  phoneNumber: string;
  email?: string;
  name?: string;
  address?: string;
  pincode?: string;
  pan?: string;
  dob?: Date;
  bankAccountNumber?: string;
  ifscCode?: string;
  password?: string;
  role: "client" | "admin" | "superadmin";
  userType?: "individual" | "business";
  termsAccepted?: boolean;
  incomeSources: {
    salaryIncome: boolean;
    rentalIncome: boolean;
    business: boolean;
    capitalGains: boolean;
    otherSources: boolean;
    foreignSource: boolean;
  };
  itrType?: "ITR1" | "ITR2" | "ITR3" | "ITR4";
  itrPrice?: number;
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
  stepperStatus: IStepperStatus;
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

    name: {
      type: String,
    },

    address: {
      type: String,
    },

    pincode: {
      type: String,
      match: /^[0-9]{6}$/,
    },

    pan: {
      type: String,
      unique: true,
      match: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
    },

    dob: {
      type: Date,
    },

    bankAccountNumber: {
      type: String,
      trim: true,
    },

    ifscCode: {
      type: String,
      match: /^[A-Z]{4}0[A-Z0-9]{6}$/,
    },

    password: {
      type: String,
    },

    role: {
      type: String,
      enum: ["client", "admin", "superadmin"],
      default: "client",
    },

    userType: {
      type: String,
      enum: ["individual", "business"],
      default: "individual",
    },
    termsAccepted: {
      type: Boolean,
      default: false,
    },
    incomeSources: {
      salaryIncome: { type: Boolean, default: false },
      business: { type: Boolean, default: false },
      rentalIncome: { type: Boolean, default: false },
      capitalGains: { type: Boolean, default: false },
      otherSources: { type: Boolean, default: false },
      foreignSource: { type: Boolean, default: false },
    },

    itrType: {
      type: String,
      enum: ["ITR1", "ITR2", "ITR3", "ITR4"],
    },

    itrPrice: {
      type: Number,
    },

    documents: {
      type: [
        {
          name: { type: String, required: true },
          url: { type: String, required: true },
          type: { type: String, required: true },
          uploadedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },

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
    stepperStatus: {
      currentStep: {
        type: Number,
        enum: [1, 2, 3, 4, 5],
        default: 1,
      },
      isCompleted: {
        type: Boolean,
        default: false,
      },
    },
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

// Pre-save middleware to determine ITR type and price based on income sources
userSchema.pre("save", function (next) {
  if (this.isModified("incomeSources")) {
    const {
      salaryIncome,
      rentalIncome,
      business,
      capitalGains,
      otherSources,
      foreignSource,
    } = this.incomeSources;

    // ITR 1: Any combination of salary, rental, and other sources
    // But NO business, capital gains, or foreign income
    if (
      !business &&
      !capitalGains &&
      !foreignSource &&
      (salaryIncome || rentalIncome || otherSources)
    ) {
      this.itrType = "ITR1";
      this.itrPrice = 299;
    }
    // ITR 2: Any income source with capital gains or foreign income
    // But NO business income
    else if (!business && (capitalGains || foreignSource)) {
      this.itrType = "ITR2";
      this.itrPrice = 1499;
    }
    // ITR 3: Business income with capital gains or foreign income
    else if (business && (capitalGains || foreignSource)) {
      this.itrType = "ITR3";
      this.itrPrice = 1999;
    }
    // ITR 4: Business income without capital gains or foreign income
    else if (business) {
      this.itrType = "ITR4";
      this.itrPrice = 799;
    }
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
