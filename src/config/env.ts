import dotenv from "dotenv";
dotenv.config();

export const config = {
  MAIN: {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || "development",
    mongoUri: process.env.MONGO_URI || "",
    dbName: process.env.DB_NAME,
  },
  API: {
    prefix: "/api",
  },
  JWT: {
    secret: process.env.JWT_SECRET || "your_jwt_secret",
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  },
};
