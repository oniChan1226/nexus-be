import { HydratedDocument, Model } from "mongoose";
import { BaseDocument, Ref } from "./common";
import { IRole } from "./role.type";

export interface IUser extends BaseDocument {
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  password?: string;
  age?: number;
  profileImage?: string;
  avatar?: string;
  // Role
  role: Ref<IRole>[];
  permissions?: {
    action: string;
    subject: string;
  }[];
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
