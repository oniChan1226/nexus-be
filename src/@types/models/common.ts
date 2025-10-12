import { ObjectId } from "mongoose";

export interface BaseDocument {
    _id: ObjectId | string;
    createdAt?: Date;
    updatedAt?: Date;
};