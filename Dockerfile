# ---------- BUILD STAGE ----------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Generate the Prisma client into src/generated/prisma
RUN npx prisma generate

# Build TS → JS
RUN npm run build

# Copy generated Prisma client into dist so runtime alias imports resolve
RUN mkdir -p dist/src/generated && cp -r src/generated/prisma dist/src/generated/prisma


# ---------- RUNTIME STAGE ----------
FROM node:20-alpine AS runner
LABEL authors="isaachatilima"

WORKDIR /app

# Use the exact dependencies from the builder (includes prisma CLI for migrations)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Copy compiled JS
COPY --from=builder /app/dist ./dist

# Copy Prisma client exactly where your app expects it
COPY --from=builder /app/src/generated/prisma ./src/generated/prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Copy migrations (needed for migrate deploy)
COPY --from=builder /app/prisma ./prisma

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "-r", "tsconfig-paths/register", "dist/server.js"]
