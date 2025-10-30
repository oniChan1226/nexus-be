import { asyncHandler } from "utils";
import { AuthService } from "./auth.service";
import { config } from "config/env";
import { LinkedInAuthCallbackQuery } from "./auth.validator";

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

  loginWithOtp: asyncHandler(async (req, res) => {
    const response = await AuthService.loginWithOtp(req.body);

    return res.status(response.status).json(response);
  }),

  verifyOtp: asyncHandler(async (req, res) => {
    const { response, tokens } = await AuthService.verifyOtp(req.body);

    return res
      .status(response.status)
      .cookie("accessToken", tokens.accessToken, { ...options })
      .cookie("refreshToken", tokens.refreshToken, { ...options })
      .json(response);
  }),

  linkedInAuth: asyncHandler(async (req, res) => {
    const state = "asdasasddasd";
    const authUrl =
      `${config.LINKEDIN.auth_url}?response_type=code` +
      `&client_id=${config.LINKEDIN.client_id}` +
      `&redirect_uri=${encodeURIComponent(config.LINKEDIN.redirect_uri)}` +
      `&state=${state}` +
      `&scope=${encodeURIComponent(config.LINKEDIN.scope)}`;

    return res.status(200).redirect(authUrl);
  }),

  linkedInAuthCallback: asyncHandler(async (req, res) => {
    const response = await AuthService.linkedInAuthCallback(
      req.query as LinkedInAuthCallbackQuery
    );

    return res.status(response.status).json(response);
  }),
};
