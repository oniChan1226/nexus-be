import mongoose from "mongoose";
import { UserModel, VerificationTokenModel } from "models";
import type {
  LinkedInAuthCallbackQuery,
  UserLoginData,
  UserLoginWithOtpData,
  UserOtpData,
  UserRegisterData,
  VerifyEmailQuery,
  ResendVerificationData,
  ForgotPasswordData,
  ResetPasswordData,
  RefreshTokenData,
} from "./auth.validator";
import { ApiError, ApiResponse } from "utils";
import { IUser, UserDocument } from "../../@types/models/user.types";
import { t } from "utils";
import { OtpService } from "services/otp.service";
import { EmailService } from "services/email.service";
import axios from "axios";
import { config } from "config/env";
import jwt from "jsonwebtoken";

export const AuthService = {
  async register(data: UserRegisterData) {
    // validate existence
    const doesUserExist = await UserModel.findByEmail(data.email);
    if (doesUserExist) {
      throw new ApiError(409, t("USER.EXISTS"));
    }

    const user = await UserModel.create(data);

    // Generate email verification token
    const verificationToken =
      await VerificationTokenModel.createVerificationToken(
        user._id as mongoose.Types.ObjectId,
        "email_verification"
      );

    // Send verification email (async - don't wait)
    const verificationUrl = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/auth/verify-email?token=${verificationToken.token}`;
    await EmailService.sendVerificationEmail(
      user.email,
      user.name,
      verificationUrl
    );

    return new ApiResponse<IUser>(
      201,
      "Registration successful! Please check your email to verify your account.",
      user.toObject()
    );
  },

  async login(data: UserLoginData) {
    // validate creds
    const user = await UserModel.findByEmail(data.email);
    if (!user) {
      throw new ApiError(404, t("USER.NOT_FOUND_AGAINST_EMAIL"));
    }

    const isValidPassword = await user.isPasswordCorrect(data.password);
    if (!isValidPassword) {
      throw new ApiError(400, t("USER.INCORRECT_PASSWORD"));
    }

    // Check if email is verified
    if (!user.isVerified) {
      throw new ApiError(
        403,
        "Please verify your email before logging in. Check your inbox for the verification link."
      );
    }

    user.lastLoginAt = new Date();
    await user.save();

    const tokens = await this.generateAccessAndRefreshToken(user);

    return {
      response: new ApiResponse<IUser>(200, t("AUTH.LOG_IN"), user),
      tokens: { ...tokens },
    };
  },

  async loginWithOtp(data: UserLoginWithOtpData) {
    const user = await UserModel.findByEmail(data.email);
    if (!user) {
      throw new ApiError(404, t("USER.NOT_FOUND_AGAINST_EMAIL"));
    }

    await OtpService.sendOtp(data.email);

    return new ApiResponse(200, t("OTP.OTP_SENT"));
  },

  async verifyOtp(data: UserOtpData) {
    const storedOtp = await OtpService.getOtp(data.email);

    if (!storedOtp) {
      throw new ApiError(400, t("OTP.OTP_EXPIRED"));
    }

    if (storedOtp !== data.otp) {
      throw new ApiError(400, t("OTP.OTP_INVALID"));
    }

    await OtpService.deleteOtp(data.email);

    // OTP valid → Log user in
    const user = await UserModel.findByEmail(data.email);
    if (!user) throw new ApiError(404, t("USER.NOT_FOUND_AGAINST_EMAIL"));

    // Check if email is verified
    if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    const tokens = await this.generateAccessAndRefreshToken(user);

    return {
      response: new ApiResponse<IUser>(200, t("OTP.OTP_VERIFIED"), user),
      tokens,
    };
  },

  // async linkedInAuthCallback(query: LinkedInAuthCallbackQuery) {
  //   const { code } = query;

  //   // Exchange code for access token
  //   const tokenResponse = await axios.post(
  //     config.LINKEDIN.token_url,
  //     new URLSearchParams({
  //       grant_type: "authorization_code",
  //       code: code as string,
  //       redirect_uri: config.LINKEDIN.redirect_uri,
  //       client_id: config.LINKEDIN.client_id,
  //       client_secret: config.LINKEDIN.client_secret,
  //     }).toString(),
  //     {
  //       headers: { "Content-Type": "application/x-www-form-urlencoded" },
  //     }
  //   );

  //   const accessToken = tokenResponse.data.access_token;

  //   const profileResponse = await axios.get("https://api.linkedin.com/v2/me", {
  //     headers: { Authorization: `Bearer ${accessToken}` },
  //   });

  //   const profile = profileResponse.data;
  //   console.log("LinkedIn Access Token:", accessToken);
  //   console.log("LinkedIn Profile:", profile);

  //   return new ApiResponse(200, t("AUTH.LOG_IN"));
  // },

  async generateAccessAndRefreshToken(
    user: UserDocument
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save();

    return { accessToken, refreshToken };
  },

  // Email Verification
  async verifyEmail(query: VerifyEmailQuery) {
    const { token } = query;

    const tokenDoc = await VerificationTokenModel.verifyToken(
      token,
      "email_verification"
    );

    if (!tokenDoc) {
      throw new ApiError(400, "Invalid or expired verification token");
    }

    const user = await UserModel.findById(tokenDoc.userId);
    if (!user) {
      throw new ApiError(404, t("USER.NOT_FOUND"));
    }

    if (user.isVerified) {
      throw new ApiError(400, "Email already verified");
    }

    user.isVerified = true;
    await user.save();

    // Delete used token
    await VerificationTokenModel.deleteOne({ _id: tokenDoc._id });

    return new ApiResponse(
      200,
      "Email verified successfully! You can now log in."
    );
  },

  async resendVerification(data: ResendVerificationData) {
    const user = await UserModel.findByEmail(data.email);

    if (!user) {
      throw new ApiError(404, t("USER.NOT_FOUND_AGAINST_EMAIL"));
    }

    if (user.isVerified) {
      throw new ApiError(400, "Email already verified");
    }

    // Generate new token
    const verificationToken =
      await VerificationTokenModel.createVerificationToken(
        user._id as mongoose.Types.ObjectId,
        "email_verification"
      );

    // Send verification email
    const verificationUrl = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/auth/verify-email?token=${verificationToken.token}`;
    await EmailService.sendVerificationEmail(
      user.email,
      user.name,
      verificationUrl
    );

    return new ApiResponse(
      200,
      "Verification email sent! Please check your inbox."
    );
  },

  // Password Reset
  async forgotPassword(data: ForgotPasswordData) {
    const user = await UserModel.findByEmail(data.email);

    if (!user) {
      // Don't reveal if user exists - security best practice
      return new ApiResponse(
        200,
        "If an account exists with this email, a password reset link has been sent."
      );
    }

    // Generate reset token
    const resetToken = await VerificationTokenModel.createVerificationToken(
      user._id as mongoose.Types.ObjectId,
      "password_reset"
    );

    // Send reset email
    const resetUrl = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/auth/reset-password?token=${resetToken.token}`;
    await EmailService.sendPasswordResetEmail(user.email, user.name, resetUrl);

    return new ApiResponse(
      200,
      "If an account exists with this email, a password reset link has been sent."
    );
  },

  async resetPassword(data: ResetPasswordData) {
    const { token, password } = data;

    const tokenDoc = await VerificationTokenModel.verifyToken(
      token,
      "password_reset"
    );

    if (!tokenDoc) {
      throw new ApiError(400, "Invalid or expired reset token");
    }

    const user = await UserModel.findById(tokenDoc.userId).select("+password");
    if (!user) {
      throw new ApiError(404, t("USER.NOT_FOUND"));
    }

    // Update password (will be hashed by pre-save hook)
    user.password = password;
    user.refreshToken = undefined; // Invalidate all sessions
    await user.save();

    // Delete used token
    await VerificationTokenModel.deleteOne({ _id: tokenDoc._id });

    return new ApiResponse(
      200,
      "Password reset successful! You can now log in with your new password."
    );
  },

  // Logout
  async logout(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new ApiError(404, t("USER.NOT_FOUND"));
    }

    user.refreshToken = undefined;
    await user.save();

    return new ApiResponse(200, "Logged out successfully");
  },

  async logoutAll(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new ApiError(404, t("USER.NOT_FOUND"));
    }

    user.refreshToken = undefined;
    await user.save();

    return new ApiResponse(200, "Logged out from all devices successfully");
  },

  // Refresh Token
  async refreshToken(data: RefreshTokenData) {
    const { refreshToken } = data;

    if (!refreshToken) {
      throw new ApiError(401, "Refresh token required");
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, config.JWT.refreshToken.secret) as {
        _id: string;
      };
    } catch (error) {
      throw new ApiError(401, "Invalid or expired refresh token");
    }

    // Find user and check if refresh token matches (cast to UserDocument)
    const user = (await UserModel.findById(decoded._id)) as UserDocument | null;
    if (!user || user.refreshToken !== refreshToken) {
      throw new ApiError(401, "Invalid refresh token");
    }

    // Generate new tokens
    const tokens = await this.generateAccessAndRefreshToken(user);

    return {
      response: new ApiResponse(200, "Token refreshed successfully"),
      tokens,
    };
  },

  // Get current user
  async getCurrentUser(userId: string) {
    const user = await UserModel.findById(userId).populate("role");
    if (!user) {
      throw new ApiError(404, t("USER.NOT_FOUND"));
    }

    return new ApiResponse<IUser>(
      200,
      "User retrieved successfully",
      user.toObject()
    );
  },
};
