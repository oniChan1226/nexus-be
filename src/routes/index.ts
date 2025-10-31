import { Router } from "express";

import AuthRouter from "../modules/auth/auth.route";
import NotificationRouter from "../modules/notifications/notification.route";

const router = Router();

router.use("/auth", AuthRouter);
router.use("/notifications", NotificationRouter);

export default router;
