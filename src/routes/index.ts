import { Router } from "express";

import AuthRouter from "../modules/auth/auth.route";
import NotificationRouter from "../modules/notifications/notification.route";
import AIRouter from "../modules/ai/ai.route";

const router = Router();

router.use("/auth", AuthRouter);
router.use("/notifications", NotificationRouter);
router.use("/ai", AIRouter);

export default router;
