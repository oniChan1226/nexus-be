export const MESSAGES = {
  USER: {
    CREATED: "User created successfully.",
    UPDATED: "User updated successfully.",
    DELETED: "User deleted successfully.",
    NOT_FOUND: "User not found.",
    NOT_FOUND_AGAINST_EMAIL: "User not found against email",
    EXISTS: "User already exists.",
    INCORRECT_PASSWORD: "Incorrect Password",
  },
  AUTH: {
    LOG_IN: "User logged in successfully",
    LOG_OUT: "User logged out successfully",
    INVALID: "Invalid credentials.",
    TOKEN_EXPIRED: "Access token expired. Please login again.",
  },
  OTP: {
    OTP_SENT: "Otp sent",
    OTP_EXPIRED: "Otp expired",
    OTP_INVALID: "Invalid Otp",
    OTP_VERIFIED: "Otp verified successfully",
  },
  LOGGING: {},
  COMMON: {
    SERVER_ERROR: "Something went wrong. Please try again later.",
    UNAUTHORIZED: "You are not authorized to perform this action.",
  },
} as const;
