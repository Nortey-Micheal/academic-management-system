import { model, models, Schema } from "mongoose";

const options = {
  discriminatorKey: "role",
  timestamps: true,
};

const UserSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: String,

    password: { type: String, required: true },

    avatarUrl: String,

    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "inactive",
    },

    role: {
      type: String,
      enum: ['admin','headteacher','teacher'],
      index: true,
      default: 'teacher'
    },

    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },

  },
  options
);

export const User = models.User || model("User", UserSchema);
