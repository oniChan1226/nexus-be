import { Router } from "express";

import AuthRouter from "../modules/auth/auth.route";

const router = Router();

router.use("/auth", AuthRouter);

export default router;
