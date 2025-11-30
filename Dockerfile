# ---------- Stage 1: Build (TypeScript -> JavaScript) ----------
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install dependencies (npm)
COPY package*.json ./
RUN npm install

# Copy source
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript -> dist
RUN npm run build

# ---------- Stage 2: Runtime ----------
FROM node:20-alpine

WORKDIR /usr/src/app

# Install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy built files from builder
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 4000

CMD ["node", "dist/server.js"]
