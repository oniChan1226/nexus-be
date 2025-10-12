import { HydratedDocument, Model } from "mongoose";
import { UserRoleEnum } from "../enum";
import { BaseDocument, Ref } from "./common";
import { IPermissions } from "./permissions.types";

export interface IRole extends BaseDocument {
  name: UserRoleEnum;
  description?: string;
  permissions: Ref<IPermissions>[];
}

export interface RoleDocument extends HydratedDocument<IRole> {}

export interface RoleModelType extends Model<IRole> {}
