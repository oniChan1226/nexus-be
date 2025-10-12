import { IRole, RoleModelType, UserRoleEnum } from "../@types/index.types";
import mongoose from "mongoose";

const rolesSchema = new mongoose.Schema<IRole>(
  {
    name: {
      type: String,
      enum: Object.values(UserRoleEnum),
      required: true,
    },
    description: {
      type: String,
    },
    permissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Permission",
      },
    ],
  },
  { timestamps: true }
);

export const RoleModel = mongoose.model<IRole, RoleModelType>(
  "Role",
  rolesSchema
);
