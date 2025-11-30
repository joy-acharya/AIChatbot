import { Router } from "express";
import { ConversationController } from "./conversation.controller";
import { authMiddleware } from "../../middleware/authMiddleware";

const router = Router();

router.post("/", authMiddleware, ConversationController.createOneToOne);
router.get("/", authMiddleware, ConversationController.list);

export default router;
