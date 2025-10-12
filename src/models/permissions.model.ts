import mongoose from "mongoose";
import { IPermissions, PermissionsModelType } from "../@types/index.types";

const permissionsSchema = new mongoose.Schema<IPermissions>(
  {
    module: {
      type: String,
      required: true,
      trim: true,
    },
    actions: {
      create: { type: Boolean, default: false },
      read: { type: Boolean, default: false },
      update: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
    },
    conditions: {
      ownedOnly: { type: Boolean, default: false },
      orgRestricted: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

export const PermissionModel = mongoose.model<
  IPermissions,
  PermissionsModelType
>("Permission", permissionsSchema);
