import { Request, Response, NextFunction } from "express"
import { ApiError } from "../utils/ApiError"
import { ApiResponse } from "../utils/ApiResponse"
import logger from "../config/logger"

export const ErrorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(err)
  if (err instanceof ApiError) {
    return res
      .status(err.status)
      .json(new ApiResponse<null>(err.status, err.message, null, false))
  }
  return res
    .status(500)
    .json(new ApiResponse<null>(500, "Something went wrong", null, false))
}
