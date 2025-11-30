// src/socket.ts
import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { JWTPayload } from "./modules/auth/auth.types"; // adjust path if needed
import { MessageService } from "./modules/messages/messages.service"; // for membership checks

dotenv.config();

const userSockets = new Map<number, Set<string>>(); 
let io: SocketIOServer | null = null;


export function initSocket(server: HTTPServer): SocketIOServer {
  io = new SocketIOServer(server, {
    cors: {
      origin: "*", // for now, open; later will be restricted 
    },
  });

  const JWT_SECRET = process.env.JWT_SECRET || "defaultsecret";

  // 🔐 Auth middleware for sockets
  io.use((socket, next) => {
    // token can come from auth field or header
    const token =
      (socket.handshake.auth && (socket.handshake.auth as any).token) ||
      (socket.handshake.headers.authorization &&
        socket.handshake.headers.authorization.split(" ")[1]);

    if (!token) {
      return next(new Error("Unauthorized: no token"));
    }

    try {
      const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
      socket.data.user = payload; // { id, email }
      next();
    } catch (err) {
      console.error("Socket auth error:", err);
      return next(new Error("Unauthorized: invalid token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const user = socket.data.user as JWTPayload | undefined;
    console.log("🔌 Socket connected:", user?.id);

    if (user) {
      let set = userSockets.get(user.id);
      if (!set) {
        set = new Set();
        userSockets.set(user.id, set);
      }
      set.add(socket.id);
    }

    // Join a conversation room
    socket.on("join_conversation", async (data: { conversationId: number }) => {
      try {
        const { conversationId } = data;
        if (!user) return;

        const isParticipant = await MessageService.userInConversation(
          user.id,
          conversationId
        );

        if (!isParticipant) {
          console.warn(
            `User ${user.id} tried to join conversation ${conversationId} without permission`
          );
          socket.emit("error", {
            message: "Not a participant of this conversation",
          });
          return;
        }

        const roomName = `conversation:${conversationId}`;
        await socket.join(roomName);
        console.log(`User ${user.id} joined room ${roomName}`);

        socket.emit("joined_conversation", { conversationId });
      } catch (err) {
        console.error("join_conversation error:", err);
        socket.emit("error", { message: "Failed to join conversation" });
      }
    });

    socket.on(
      "typing",
      (data: { conversationId: number; isTyping: boolean }) => {
        const user = socket.data.user as JWTPayload | undefined;
        if (!user) return;

        const roomName = `conversation:${data.conversationId}`;

        // Notify everyone else in the room (excluding this socket)
        socket.to(roomName).emit("typing", {
          conversationId: data.conversationId,
          userId: user.id,
          isTyping: data.isTyping,
        });
      }
    );

    socket.on("disconnect", () => {
      if (user) {
        const set = userSockets.get(user.id);
        if (set) {
          set.delete(socket.id);
          if (set.size === 0) userSockets.delete(user.id);
        }
      }
    });
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
}

export function getUserSocketIds(userId: number): string[] {
  const set = userSockets.get(userId);
  return set ? Array.from(set) : [];
}
