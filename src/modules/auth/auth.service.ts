import { UserModel } from "models";
import type {
  UserLoginData,
  UserLoginWithOtpData,
  UserOtpData,
  UserRegisterData,
} from "./auth.validator";
import { ApiError, ApiResponse } from "utils";
import { IUser, UserDocument } from "../../@types/models/user.types";
import { t } from "utils";
import { OtpService } from "services/otp.service";

export const AuthService = {
  async register(data: UserRegisterData) {
    // validate existence
    const doesUserExist = await UserModel.findByEmail(data.email);
    if (doesUserExist) {
      throw new ApiError(409, t("USER.EXISTS"));
    }

    const user = await UserModel.create(data);

    return new ApiResponse<IUser>(201, t("USER.CREATED"), user.toObject());
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

    const tokens = await this.generateAccessAndRefreshToken(user);

    return {
      response: new ApiResponse<IUser>(200, t("OTP.OTP_VERIFIED"), user),
      tokens,
    };
  },

  async generateAccessAndRefreshToken(
    user: UserDocument
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save();

    return { accessToken, refreshToken };
  },
};
