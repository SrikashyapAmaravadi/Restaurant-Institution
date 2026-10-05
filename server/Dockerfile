# Multi-stage Production Dockerfile for Express API
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY server/package*.json ./server/
COPY prisma ./prisma/

RUN npm ci --workspace=server

# Generate Prisma Client
RUN npx prisma generate --schema=prisma/schema.prisma

# Copy Server Source
COPY server ./server

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server ./server
COPY --from=builder /app/prisma ./prisma
COPY package.json ./

USER expressjs

EXPOSE 3000

CMD ["node", "server/src/server.js"]
