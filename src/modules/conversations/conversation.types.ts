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

export interface CreateOneToOneConversationDTO {
  otherUserId: number;
}

export interface CreateConversationDTO {
  currentUserId: number;
  otherUserId: number;
}