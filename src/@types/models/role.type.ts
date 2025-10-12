import { HydratedDocument, Model, ObjectId } from "mongoose";
import { UserRoleEnum } from "../enum";
import { BaseDocument } from "./common";
import { IPermissions } from "./permissions.types";

export interface IRole extends BaseDocument {
  name: UserRoleEnum;
  description?: string;
  permissions: [ObjectId | IPermissions];
}

export interface RoleDocument extends HydratedDocument<IRole> {}

export interface RoleModelType extends Model<IRole> {}
