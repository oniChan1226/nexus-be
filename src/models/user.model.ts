import mongoose, { Types } from "mongoose"

export interface User {
  _id: Types.ObjectId | string
  email: string
  name: string
  age: number
  refreshToken: string
  socialPlatforms: {
    name: string
    socialId: string
    profileUrl: string
    accessToken: string
  }[]
  lastLoginAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface UserDocument extends mongoose.Document {}
