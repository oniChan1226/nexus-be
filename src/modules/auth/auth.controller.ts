import { asyncHandler } from "utils";
import { AuthService } from "./auth.service";

const options = {
  httpOnly: true,
  secure: false,
};

export const AuthController = {
  register: asyncHandler(async (req, res) => {
    const response = await AuthService.register(req.body);

    return res.status(response.status).json(response);
  }),

  login: asyncHandler(async (req, res) => {
    const { response, tokens } = await AuthService.login(req.body);

    return res
      .status(response.status)
      .cookie("accessToken", tokens.accessToken, { ...options })
      .cookie("refreshToken", tokens.refreshToken, { ...options })
      .json(response);
  }),
};
