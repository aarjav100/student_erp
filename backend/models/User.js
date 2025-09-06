import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/.+@.+\..+/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["student", "teacher", "faculty", "professor", "assistant-professor", "associate-professor", "admin", "staff", "librarian", "accountant", "hr", "registrar", "dean", "principal", "vice-principal", "coordinator", "counselor", "security", "maintenance", "guest"],
      default: "student", // will be auto-detected at signup
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    testId: {
      type: String,
      required: false,
    },
    approvalAuthority: {
      type: String,
      enum: ["admin", "registration_block", "faculty"],
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    approvedAt: {
      type: Date,
      required: false,
    },
    rejectionReason: {
      type: String,
      required: false,
    },
    selectedRole: {
      type: String,
      required: false,
    },
    course: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

// 🔑 Pre-save hook to hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// 🔑 Method to compare password at login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;