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

// Email Verification
router.get(
  "/verify-email",
  validateResource(AuthValidator.verifyEmailSchema),
  AuthController.verifyEmail
);

router.post(
  "/resend-verification",
  validateResource(AuthValidator.resendVerificationSchema),
  AuthController.resendVerification
);

// Password Reset
router.post(
  "/forgot-password",
  validateResource(AuthValidator.forgotPasswordSchema),
  AuthController.forgotPassword
);

router.post(
  "/reset-password",
  validateResource(AuthValidator.resetPasswordSchema),
  AuthController.resetPassword
);

// Logout (requires auth)
router.post("/logout", verifyJWT, AuthController.logout);
router.post("/logout-all", verifyJWT, AuthController.logoutAll);

// Refresh Token
router.post(
  "/refresh-token",
  validateResource(AuthValidator.refreshTokenSchema),
  AuthController.refreshToken
);

// Get Current User (requires auth)
router.get("/me", verifyJWT, AuthController.getCurrentUser);

export default router;
