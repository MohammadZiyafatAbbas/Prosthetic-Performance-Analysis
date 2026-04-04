# Multi-stage Dockerfile for ProstheticIQ Dashboard
# Stage 1: Build React frontend
FROM node:18-alpine AS builder
WORKDIR /app/client
COPY client/package.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Production server
FROM node:18-alpine AS production
WORKDIR /app

# Copy server
COPY server/package.json server/
RUN cd server && npm install --production

COPY server/ server/
# Copy built frontend into client/dist for static serving
COPY --from=builder /app/client/dist client/dist

ENV NODE_ENV=production
EXPOSE 8080

CMD ["node", "server/index.js"]
