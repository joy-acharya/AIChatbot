import { pool } from "../../config/db";
import { CreateConversationDTO } from "./conversation.types";

export class ConversationService {
  static async createOneToOne(data: CreateConversationDTO) {
    const { currentUserId, otherUserId } = data;

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [other]: any = await conn.query(
        "SELECT id FROM users WHERE id = ? LIMIT 1",
        [otherUserId]
      );

      if (other.length === 0) {
        throw new Error("Other user does not exist");
      }

      // Check if same conversation exists already
      const [existing]: any = await conn.query(
        `
        SELECT c.id 
        FROM conversations c
        JOIN conversation_participants cp1 ON cp1.conversation_id = c.id AND cp1.user_id = ?
        JOIN conversation_participants cp2 ON cp2.conversation_id = c.id AND cp2.user_id = ?
        WHERE c.is_group  = 0
        LIMIT 1
      `,
        [currentUserId, otherUserId]
      );

      if (existing.length > 0) {
        await conn.commit();
        return { id: existing[0].id, isGroup: false, title: null };
      }

      // Create conversation
      const [result]: any = await conn.query(
        "INSERT INTO conversations (title, is_group) VALUES (?, ?)",
        [null, false]
      );

      const conversationId = result.insertId;

      // Insert participants
      await conn.query(
        "INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?), (?, ?)",
        [conversationId, currentUserId, conversationId, otherUserId]
      );

      await conn.commit();

      return {
        id: conversationId,
        title: null,
        isGroup: false,
        createdAt: new Date().toISOString(),
      };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  static async getUserConversations(userId: number) {
    const [rows]: any = await pool.query(
      `
      SELECT c.*
      FROM conversations c
      JOIN conversation_participants cp ON cp.conversation_id = c.id
      WHERE cp.user_id = ?
      ORDER BY c.created_at DESC
    `,
      [userId]
    );

    // Convert 0/1 => true/false
    return rows.map((row: any) => ({
      ...row,
      isGroup: !!row.isGroup,
    }));
  }
}
