import { config } from "config/env";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { UserModel } from "models";
import { ApiError, asyncHandler, t } from "utils";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const accessToken =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!accessToken) {
    throw new ApiError(401, t("AUTH.INVALID"));
  }

  let decodedAccessToken: JwtPayload & { _id: string };
  try {
    decodedAccessToken = jwt.verify(
      accessToken,
      config.JWT.accessToken.secret
    ) as JwtPayload & { _id: string };
  } catch (error) {
    throw new ApiError(401, t("AUTH.TOKEN_EXPIRED"));
  }

  const user = await UserModel.findById(decodedAccessToken?._id);
  if (!user) {
    throw new ApiError(404, t("USER.NOT_FOUND"));
  }

  req.user = user;

  next();
});
