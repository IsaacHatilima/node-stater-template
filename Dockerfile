# ---------- Build stage ----------
FROM node:20-alpine AS builder

LABEL org.opencontainers.image.authors="Isaac Hatilima"
LABEL org.opencontainers.image.source="https://github.com/IsaacHatilima/node-starter-template"
LABEL org.opencontainers.image.description="Node.js API with Prisma, PostgreSQL, Redis"

WORKDIR /app

# 1. Copy only what is needed for dependency install + Prisma generate
COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

# Install deps (no dev pruning yet)
RUN npm ci

# 2. Copy application source
COPY . .

# 3. Generate Prisma client
RUN npx prisma generate

# 4. Build app
RUN npm run build


# ---------- Runtime stage ----------
FROM node:20-alpine

LABEL org.opencontainers.image.authors="Isaac Hatilima"

WORKDIR /app

ENV NODE_ENV=production

# 5. Copy only runtime artifacts
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src
COPY --from=builder /app/prisma.config.ts ./

# Optional but recommended for Prisma in production
#RUN npm prune --omit=dev

EXPOSE 3000

CMD ["node", "dist/server.js"]
