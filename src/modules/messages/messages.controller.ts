import { Response } from "express";
import { AuthRequest } from "../../middleware/authMiddleware";
import { MessageService } from "./messages.service";

export class MessageController {
  static async create(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const conversationId = Number(req.params.id);
      if (Number.isNaN(conversationId)) {
        return res.status(400).json({ message: "Invalid conversation id" });
      }

      const { content } = req.body;
      if (!content || typeof content !== "string") {
        return res.status(400).json({ message: "content (string) is required" });
      }

      // Check if user is in this conversation
      const isParticipant = await MessageService.userInConversation(
        req.user.id,
        conversationId
      );

      if (!isParticipant) {
        return res.status(403).json({ message: "Not a participant of this conversation" });
      }

      const message = await MessageService.createMessage(
        conversationId,
        req.user.id,
        content
      );

      return res.status(201).json(message);
    } catch (err: any) {
      console.error("Create message error:", err.message);
      return res.status(500).json({ message: "Error creating message" });
    }
  }

  static async list(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const conversationId = Number(req.params.id);
      if (Number.isNaN(conversationId)) {
        return res.status(400).json({ message: "Invalid conversation id" });
      }

      const limit = req.query.limit ? Number(req.query.limit) : 50;
      const offset = req.query.offset ? Number(req.query.offset) : 0;

      const isParticipant = await MessageService.userInConversation(
        req.user.id,
        conversationId
      );

      if (!isParticipant) {
        return res.status(403).json({ message: "Not a participant of this conversation" });
      }

      const messages = await MessageService.getMessages(conversationId, limit, offset);
      return res.json(messages);
    } catch (err: any) {
      console.error("List messages error:", err.message);
      return res.status(500).json({ message: "Error fetching messages" });
    }
  }

  static async markSeen(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const conversationId = Number(req.params.conversationId);
      const { lastMessageId } = req.body;

      if (!lastMessageId) {
        return res
          .status(400)
          .json({ message: "lastMessageId is required" });
      }

      await MessageService.markMessagesSeen(
        conversationId,
        req.user.id,
        Number(lastMessageId)
      );

      return res.json({ ok: true });
    } catch (err) {
      console.error("markSeen error:", err);
      return res.status(500).json({ message: "Error marking messages seen" });
    }
  }
}
