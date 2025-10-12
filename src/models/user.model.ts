import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import {
  IUser,
  UserDocument,
  UserModelType,
} from "../@types/models/user.types";
import bcrypt from "bcrypt";
import { config } from "../config/env";
import { RoleModel } from "./role.model";
import { UserRoleEnum } from "../@types/enum";

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      unique: true,
      index: true,
      required: [true, "Email is required"],
    },
    password: {
      type: String,
      select: false, // hide from queries by default
      required: [true, "Password is required"],
    },
    age: {
      type: Number,
    },
    profileImage: {
      type: String,
    },
    // Access
    role: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
      },
    ],
    // Security
    refreshToken: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    // audits
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "users",
    toJSON: {
      transform(_doc, ret) {
        delete ret.password;
        delete ret.refreshToken;
        return ret;
      },
    },
    toObject: {
      transform(_doc, ret) {
        delete ret.password;
        delete ret.refreshToken;
        return ret;
      },
    },
  }
);

// ✅ Static method
userSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email }).select("+password");
};

// ✅ Pre-save hook
userSchema.pre<UserDocument>("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  if (this.password) {
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

userSchema.pre<UserDocument>("save", async function (next) {
  if (!this.role || this.role.length === 0) {
    const defaultRole = await RoleModel.findOne({
      name: UserRoleEnum.USER,
    }).select("_id");
    if (!defaultRole) next();
    if (defaultRole) this.role = [defaultRole._id];
  }
  next();
});

// ✅ Instance methods
userSchema.methods.isPasswordCorrect = async function (
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = async function (
  this: UserDocument
): Promise<string> {
  return jwt.sign({ _id: this._id }, config.JWT.accessToken.secret!, {
    expiresIn: config.JWT.accessToken.expiresIn,
  });
};

userSchema.methods.generateRefreshToken = async function (
  this: UserDocument
): Promise<string> {
  return jwt.sign({ _id: this._id }, config.JWT.refreshToken.secret!, {
    expiresIn: config.JWT.refreshToken.expiresIn,
  });
};

export const UserModel = mongoose.model<IUser, UserModelType>(
  "User",
  userSchema
);
