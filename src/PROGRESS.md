# Chat Backend Progress Log

This document tracks what was done each "Day" while building the chat backend (Express + TypeScript + MySQL + Socket.IO).

---

## Day 1 – Project Setup & Basic Server

- Initialized Node + TypeScript + Express project.
- Created:
  - `src/app.ts` with:
    - `GET /` (hello)
    - `GET /health` (health check)
    - `GET /db-test` (DB connectivity test)
  - `src/server.ts` HTTP entry point.
  - `src/config/db.ts` for MySQL `chat_app` connection.
- Verified:
  - Server runs on `http://localhost:4000`.
  - `/db-test` confirms DB connection.

---

## Day 2 – User Module (Create + List Users)

- Created user module:
  - `user.types.ts` – `User` interface.
  - `user.service.ts` – `createUser`, `getAllUsers`.
  - `user.controller.ts` – HTTP handlers for create & list.
  - `user.routes.ts` – `POST /users/create`, `GET /users`.
- Confirmed:
  - Able to create users and list users via Postman.

---

## Day 3 – Authentication (Register, Login, JWT, /me)

- Implemented auth module:
  - `auth.types.ts` – `JWTPayload { id, email }`.
  - `auth.service.ts` – register + login with bcrypt + JWT.
  - `auth.controller.ts` – `POST /auth/register`, `POST /auth/login`.
  - `auth.routes.ts`.
- Implemented `authMiddleware`:
  - Verifies `Authorization: Bearer <token>`.
  - Attaches `req.user`.
- Added `GET /me` endpoint using `authMiddleware`.
- Tested:
  - Register → Login → Get token → `/me` returns the logged-in user.

---

## Day 4 – Conversations & Messages (HTTP APIs)

- Conversations:
  - `conversation.types.ts` – `Conversation`, `ConversationParticipant`, `CreateConversationDTO`.
  - `conversation.service.ts` – `createOneToOne`, `getUserConversations`.
  - `conversation.controller.ts` – `POST /conversations`, `GET /conversations`.
  - `conversation.routes.ts` (mounted at `/conversations`).
- Messages:
  - `messages.type.ts` – `Message`.
  - `messages.service.ts` – `userInConversation`, `createMessage`, `getMessages`.
  - `messages.controller.ts` – `POST /conversations/:id/messages`, `GET /conversations/:id/messages`.
  - `messages.routes.ts` (also mounted under `/conversations`).
- Tested:
  - Create users → create 1-to-1 conversation → send message → list messages.

---

## Day 5 – Real-time Messaging with Socket.IO

- Integrated Socket.IO:
  - `socket.ts` with:
    - `initSocket(server)` – attaches Socket.IO to the HTTP server.
    - JWT-based socket auth using `io.use`.
    - `io.on("connection")` to:
      - Log connected user ID.
      - Handle `join_conversation` (validate membership, join room).
      - Emit `joined_conversation`.
      - Handle `disconnect`.
    - `getIO()` to expose the Socket.IO instance to services.
  - Updated `server.ts` to call `initSocket(server)`.

- Linked messages with Socket.IO:
  - In `MessageService.createMessage`:
    - After saving to DB, emit:
      - `io.to("conversation:<id>").emit("new_message", message)`.

- Created test Socket.IO client:
  - `src/test-socket.ts` using `socket.io-client` to:
    - Connect with JWT.
    - Emit `join_conversation`.
    - Listen for `joined_conversation` and `new_message`.

- Verified:
  - Running server + test-socket client.
  - When sending `POST /conversations/:id/messages`, client receives `new_message` in real time.

---

## Next Planned Days

These are TODOs for upcoming days:

- **Day 6 – Dockerization**
  - Add `Dockerfile` for the backend.
  - Add `docker-compose.yml` for Node + MySQL.
  - Verify `docker-compose up` runs the whole stack.

- **Day 7 – GitHub Repository & Project Structure**
  - Initialize Git repo, push to GitHub.
  - Add `.gitignore`, `README.md`, `PROGRESS.md`.
  - Decide branching strategy (main/dev/feature branches).

- **Day 8 – CI Pipeline (GitHub Actions)**
  - Add Jest test suite (auth, conversations, messages).
  - Configure GitHub Actions to:
    - Run `npm install`
    - Run `npm test`
    - Optionally build Docker image.

- **Day 9+ – Advanced Chat Features**
  - Typing indicator, read receipts, delivered/seen flags.
  - Group conversations.
  - Vue frontend with Socket.IO client.
  - AI integration for smart replies / assistant.

---
