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

export default router;
