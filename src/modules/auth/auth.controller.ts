import { asyncHandler } from "utils";
import { AuthService } from "./auth.service";

export const AuthController = {
  register: asyncHandler(async (req, res) => {
    const response = await AuthService.register(req.body);

    return res.status(response.status).json(response);
  }),
};
