import { io } from "socket.io-client";

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTQsImVtYWlsIjoiam95QGV4YW1wbGUuY29tIiwiaWF0IjoxNzYzODE2Nzc0LCJleHAiOjE3NjQ0MjE1NzR9.zFS3YzAJLuRjeBljmw6Gga5oMpJLbk6quDnhByDPzG4";

const socket = io("http://localhost:4000", {
  auth: { token },
});

socket.on("connect", () => {
  console.log("Connected as socket:", socket.id);

  socket.emit("join_conversation", { conversationId: 17 });

  socket.on("joined_conversation", (data) => {
    console.log("Joined conversation:", data);
  });

  socket.on("new_message", (msg) => {
    console.log("New message received:", msg);
  });

  // when user starts typing:
  socket.emit("typing", { conversationId: 1, isTyping: true });

  // when user stops typing (pause or blur input):
  socket.emit("typing", { conversationId: 1, isTyping: false });

  // listen:
  socket.on("typing", (data) => {
    console.log("Typing event:", data);
    // { conversationId: 1, userId: 2, isTyping: true/false }
  });
});

socket.on("error", (err) => {
  console.error("Socket error:", err);
});
