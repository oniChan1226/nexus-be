import z from "zod";

// === SCHEMAS ===
const registerSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").max(20).trim(),
    email: z.email(),
    password: z.string().min(6).max(20),
    age: z.number().min(12).max(100).optional(),
    profileImage: z.string().optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.email(),
    password: z.string().min(6).max(20),
  }),
});

const loginWithOtpSchema = z.object({
  body: z.object({
    email: z.email(),
  }),
});

const verifyOtpSchema = z.object({
  body: z.object({
    email: z.email(),
    otp: z.string().length(6),
  }),
});

const linkedInAuthCallbackSchema = z.object({
  query: z.object({
    code: z.string(),
  }),
});

const verifyEmailSchema = z.object({
  query: z.object({
    token: z.string().min(1, "Token is required"),
  }),
});

const resendVerificationSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
  }),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Token is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password too long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Password must contain uppercase, lowercase, number and special character"
      ),
  }),
});

const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, "Refresh token is required"),
  }),
});

// === TYPES ===
export type UserRegisterData = z.infer<typeof registerSchema>["body"];
export type UserLoginData = z.infer<typeof loginSchema>["body"];
export type UserLoginWithOtpData = z.infer<typeof loginWithOtpSchema>["body"];
export type UserOtpData = z.infer<typeof verifyOtpSchema>["body"];
export type LinkedInAuthCallbackQuery = z.infer<
  typeof linkedInAuthCallbackSchema
>["query"];
export type VerifyEmailQuery = z.infer<typeof verifyEmailSchema>["query"];
export type ResendVerificationData = z.infer<
  typeof resendVerificationSchema
>["body"];
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>["body"];
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>["body"];
export type RefreshTokenData = z.infer<typeof refreshTokenSchema>["body"];

// === GROUPED SCHEMAS ===
export const AuthValidator = {
  registerSchema,
  loginSchema,
  loginWithOtpSchema,
  verifyOtpSchema,
  linkedInAuthCallbackSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema,
};
