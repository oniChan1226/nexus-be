import { Router } from "express";
import { verifyJWT } from "middlewares/auth.middleware";
import { validateResource } from "utils";
import { AuthValidator } from "./auth.validator";
import { AuthController } from "./auth.controller";

const router = Router();

router.post(
  "/register",
  validateResource(AuthValidator.registerSchema),
  AuthController.register
);

router.post(
  "/login",
  validateResource(AuthValidator.loginSchema),
  AuthController.login
);

router.post(
  "/login-with-otp",
  validateResource(AuthValidator.loginWithOtpSchema),
  AuthController.loginWithOtp
);

router.post(
  "/verify-otp",
  validateResource(AuthValidator.verifyOtpSchema),
  AuthController.verifyOtp
);

// OAuth 2.0
router.get("/linkedin", AuthController.linkedInAuth);
router.get("/linkedin/callback", AuthController.linkedInAuthCallback);

export default router;
