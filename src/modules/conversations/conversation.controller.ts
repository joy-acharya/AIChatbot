import { Response } from "express";
import { AuthRequest } from "../../middleware/authMiddleware";
import { ConversationService } from "./conversation.service";

export class ConversationController {
  static async createOneToOne(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const conversation = await ConversationService.createOneToOne({
        currentUserId: req.user.id,
        otherUserId: req.body.otherUserId,
      });

      return res.status(201).json(conversation);
    } catch (err: any) {
      console.error("Create conversation error:", err);
      return res.status(500).json({ message: err.message || "Error creating conversation" });
    }
  }

  static async list(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const conversations = await ConversationService.getUserConversations(req.user.id);
      return res.json(conversations);
    } catch (err: any) {
      console.error("List conversations error:", err);
      return res.status(500).json({ message: "Error fetching conversations" });
    }
  }
}
