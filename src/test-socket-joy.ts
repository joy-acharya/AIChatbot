// src/test-socket.ts
import { io } from "socket.io-client";

const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJqb3lAZXhhbXBsZS5jb20iLCJpYXQiOjE3NjQ0ODMwODMsImV4cCI6MTc2NTA4Nzg4M30.EIRPg5MsV6FczsZvhydbffiuz-RRpc0Bt8VoleNaViQ"; 
const CONVERSATION_ID = 1;

console.log("Starting test-socket with CONVERSATION_ID =", CONVERSATION_ID);

const socket = io("http://localhost:4000", {
  auth: { token: TOKEN },
});

socket.on("connect", () => {
  console.log("✅ Connected as socket:", socket.id);

  console.log("🔹 Emitting join_conversation...");
  socket.emit("join_conversation", { conversationId: CONVERSATION_ID });
});

socket.on("joined_conversation", (data) => {
  console.log("✅ Joined conversation:", data);
});

socket.on("new_message", (msg) => {
  console.log("💬 New message received:", msg);
});

socket.on("messages_seen", (data) => {
  console.log("👀 messages_seen:", data);
});

socket.on("typing", (data) => {
  console.log("⌨ typing event:", data);
});

socket.on("connect_error", (err) => {
  console.error("❌ connect_error:", err.message);
});

socket.on("error", (err) => {
  console.error("❌ socket error:", err);
});
