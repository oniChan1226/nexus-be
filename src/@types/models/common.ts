import { Types } from "mongoose";

export interface BaseDocument {
  _id: Types.ObjectId | string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type Ref<T> = T | Types.ObjectId | string;
