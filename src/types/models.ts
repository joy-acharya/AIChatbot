// src/types/models.ts

export interface User {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

export interface Conversation {
  id: number;
  title: string | null;
  isGroup: boolean;
  createdAt: Date;
}

export interface ConversationParticipant {
  id: number;
  conversationId: number;
  userId: number;
  joinedAt: Date;
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  createdAt: Date;
}
