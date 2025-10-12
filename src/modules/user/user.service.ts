import { UserModel } from "models";
import type { UserLoginData, UserRegisterData } from "./user.validator";
import { ApiError, ApiResponse } from "utils";
import { IUser } from "../../@types/models/user.types";
import { t } from "utils";

export const UserService = {
  async register(data: UserRegisterData) {
    // validate existence
    const doesUserExist = await UserModel.findByEmail(data.email);
    if (doesUserExist) {
      throw new ApiError(409, t("USER.EXISTS"));
    }

    const user = await UserModel.create(data);

    return new ApiResponse<IUser>(200, t("USER.CREATED"), user.toObject());
  },

  async login(data: UserLoginData) {
    // validate creds
    const user = await UserModel.findByEmail(data.email);
    if (!user) {
      throw new ApiError(404, t("USER.NOT_FOUND_AGAINST_EMAIL"));
    }

    if (await user.isPasswordCorrect(data.password)) {
      throw new ApiError(400, t("USER.INCORRECT_PASSWORD"));
    }
  },
};
