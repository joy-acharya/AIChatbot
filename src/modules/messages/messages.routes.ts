import { Router } from "express";
import { MessageController } from "./messages.controller";
import { authMiddleware } from "../../middleware/authMiddleware";

const router = Router();

// /conversations/:id/messages
router.get("/:id/messages", authMiddleware, MessageController.list);
router.post("/:id/messages", authMiddleware, MessageController.create);
router.post("/:conversationId/messages/seen",authMiddleware,MessageController.markSeen);
export default router;
