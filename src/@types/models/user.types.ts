import { HydratedDocument, Model, ObjectId, Types } from "mongoose";
import { BaseDocument } from "./common";

export interface IUser extends BaseDocument {
  name: string;
  email: string;
  password?: string;
  age?: number;
  profileImage?: string;
  // Role
  role: [ObjectId];
  // security
  refreshToken?: string;
  isVerified?: boolean;
  // audits
  lastLoginAt?: Date;
}

// mongoose populates methods
export interface UserDocument extends HydratedDocument<IUser> {
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): Promise<string>;
  generateRefreshToken(): Promise<string>;
}

// manual extented methods included
export interface UserModelType extends Model<IUser> {
  findByEmail(email: string): Promise<UserDocument | null>;
}
