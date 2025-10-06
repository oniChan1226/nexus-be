import mongoose from "mongoose";
import { config } from "./env";

export const connectDB = async () => {
  try {
    const mongoUri = `${config.MAIN.mongoUri}/${config.MAIN.dbName}`;
    const connection = await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB connected: ${connection.connection.name}`);

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected.");
    });
  } catch (error) {
    console.error("❌ MongoDB connection failed:", (error as Error).message);
    process.exit(1);
  }
};
