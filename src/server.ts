// src/server.ts
import http from "http";
import app from "./app";
import { initSocket } from "./socket"

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

const server = http.createServer(app);

initSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Chat backend listening on http://localhost:${PORT}`);
});
