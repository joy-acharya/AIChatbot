export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  createdAt: Date;
  deliveredAt?: Date | null;
  seenAt?: Date | null;
}

export interface CreateMessageDTO {
  content: string;
}
