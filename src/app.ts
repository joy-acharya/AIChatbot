// src/app.ts
import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import { pool } from "./config/db";
import userRoutes from "./modules/users/user.routes";
import authRoutes from "./modules/auth/auth.routes";
import { authMiddleware, AuthRequest  } from "./middleware/authMiddleware";
import conversationRoutes from "./modules/conversations/conversation.routes";
import messageRoutes from "./modules/messages/messages.routes";


dotenv.config();

const app: Application = express();

// Middlewares
app.use(express.json());
app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/conversations", conversationRoutes);
app.use("/conversations", messageRoutes);

type HealthResponse = {
    status: 'ok'
    message: string
}

// Health check route
app.get("/health", (req: Request, res: Response<HealthResponse>) => {
  return res.json({ status: "ok", message: "Chat backend is running" });
});

// Example test route
app.get("/", (req: Request, res: Response) => {
  res.send("Hello from chat-backend 👋");
});

app.get("/db-test", async (req: AuthRequest, res: Response) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS result");
    return res.json({ ok: true, rows });
  } catch (error) {
    console.error("DB test error:", error);
    return res.status(500).json({ ok: false });
  }
});

app.get("/me", authMiddleware, (req:AuthRequest, res:Response) => {
  return res.json({ user: req.user });
});

export default app;
