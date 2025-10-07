import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { SocialPlatform, User, UserDocument, UserModelType } from "../@types/user.types";
import bcrypt from "bcrypt";
import { config } from "../config/env";

const socialPlatformSchema = new mongoose.Schema<SocialPlatform>(
  {
    name: { type: String },
    accessToken: { type: String },
    image: { type: String },
    profileUrl: { type: String },
  },
  {
    _id: false,
  }
);

const userSchema = new mongoose.Schema<User>(
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
    refreshToken: {
      type: String,
    },
    socialPlatforms: [socialPlatformSchema],
    // audits
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

// ✅ Static method
userSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email });
};

// ✅ Pre-save hook
userSchema.pre<UserDocument>("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ✅ Instance methods
userSchema.methods.generateAccessToken = async function (this: UserDocument) {
  return jwt.sign(
    { _id: this._id },
    config.JWT.accessToken.secret!,
    { expiresIn: config.JWT.accessToken.expiresIn }
  );
};

userSchema.methods.generateRefreshToken = async function (this: UserDocument) {
  return jwt.sign(
    { _id: this._id },
    config.JWT.refreshToken.secret!,
    { expiresIn: config.JWT.refreshToken.expiresIn }
  );
};

export const UserModel = mongoose.model<User, UserModelType>(
  "User",
  userSchema
);
