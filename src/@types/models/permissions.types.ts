import { HydratedDocument, Model } from "mongoose";
import { BaseDocument } from "./common";

type ActionsType = {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
};
type ConditionsType = {
  ownedOnly: boolean;
  orgRestricted: boolean;
};

export interface IPermissions extends BaseDocument {
  module: string;
  actions: ActionsType;
  conditions: ConditionsType;
}

export interface PermissionsDocument extends HydratedDocument<IPermissions> {}

export interface PermissionsModelType extends Model<IPermissions> {}
