import mongoose, { HydratedDocument, Model, Types } from "mongoose";

// plain interface
export interface SocialPlatform {
  name: string;
  image: string;
  profileUrl: string;
  accessToken: string;
}
export interface User {
  _id: Types.ObjectId | string;
  email: string;
  password: string;
  name: string;
  age?: number;
  profileImage?: string;
  refreshToken?: string;
  socialPlatforms?: SocialPlatform[];
  // audits
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// mongoose populates methods
export interface UserDocument extends HydratedDocument<User> {
  generateAccessToken(): Promise<string>;
  generateRefreshToken(): Promise<string>;
}

// manual extented methods included
export interface UserModelType extends Model<User> {
  findByEmail(email: string): Promise<UserDocument | null>;
}
