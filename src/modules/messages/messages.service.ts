import { pool } from "../../config/db";
import { Message } from "./messages.type";
import { getIO } from "../../socket";
import { getUserSocketIds } from "../../socket";

export class MessageService {
  static async createMessage(
    conversationId: number,
    senderId: number,
    content: string
  ): Promise<Message> {
    const [result]: any = await pool.query(
      `
      INSERT INTO messages (conversation_id, sender_id, content,deliveredAt)
      VALUES (?, ?, ?, NOW())
      `,
      [conversationId, senderId, content]
    );

    const message: Message = {
      id: result.insertId,
      conversationId,
      senderId,
      content,
      createdAt: new Date(),
      deliveredAt: new Date(),
      seenAt: null,
    };

      // NEW: emit realtime event to the conversation room
    try {
      const io = getIO();
      const roomName = `conversation:${conversationId}`;
      const senderSocketIds = getUserSocketIds(senderId);
      io.to(roomName).except(senderSocketIds).emit("new_message", message);
    } catch (err) {
      console.error("Socket emit new_message error:", err);
    }

    return message;
  }

  static async getMessages(
    conversationId: number,
    limit = 50,
    offset = 0
  ): Promise<Message[]> {
    const [rows]: any = await pool.query(
      `
    SELECT
      id,
      conversation_id AS conversationId,
      sender_id AS senderId,
      content,
      created_at AS createdAt,
      deliveredAt,
      seenAt
    FROM messages
    WHERE conversation_id = ?
    ORDER BY created_at DESC
    LIMIT ?
    OFFSET ?
      `,
      [conversationId, limit, offset]
    );

    return rows;
  }

  static async userInConversation(userId: number, conversationId: number): Promise<boolean> {
    const [rows]: any = await pool.query(
      `
      SELECT 1
      FROM conversation_participants
      WHERE conversation_id = ? AND user_id = ?
      LIMIT 1
      `,
      [conversationId, userId]
    );

    return rows.length > 0;
  }

  static async markMessagesSeen(conversationId: number,userId: number,lastMessageId: number)
  : Promise<void> {
    // Mark as seen all messages in this conversation, up to lastMessageId,
    // that were NOT sent by this user.
    await pool.query(
      `
      UPDATE messages
      SET seenAt = NOW()
      WHERE conversation_id = ?
        AND id <= ?
        AND sender_id <> ?
        AND (seenAt IS NULL)
      `,
      [conversationId, lastMessageId, userId]
    );

    // Notify all participants via socket
    try {
      const io = getIO();
      const roomName = `conversation:${conversationId}`;
      io.to(roomName).emit("messages_seen", {
        conversationId,
        seenByUserId: userId,
        lastMessageId,
      });
    } catch (err) {
      console.error("Socket emit messages_seen error:", err);
    }
  }
}
