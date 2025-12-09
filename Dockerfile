# ================================
# Stage 1: Build Frontend
# ================================
FROM node:22-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy frontend source
COPY . .

# Remove server directory (we don't need it here)
RUN rm -rf server

# Build frontend
RUN npm run build

# ================================
# Stage 2: Build Backend
# ================================
FROM node:22-alpine AS backend-builder

# Install build dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

WORKDIR /app/server

# Copy backend package files
COPY server/package*.json ./

# Install dependencies
RUN npm install

# Copy backend source
COPY server/ .

# Build backend
RUN npm run build

# ================================
# Stage 3: Production Image
# ================================
FROM node:22-alpine AS production

# Install runtime dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S hcc && \
    adduser -S -D -H -u 1001 -G hcc hcc

# Copy backend build and dependencies
COPY --from=backend-builder /app/server/dist ./dist
COPY --from=backend-builder /app/server/package*.json ./

# Install production dependencies only
RUN npm install --only=production && \
    npm cache clean --force

# Copy frontend build to serve statically
COPY --from=frontend-builder /app/frontend/dist ./public

# Create data directory
RUN mkdir -p /app/data && chown -R hcc:hcc /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/app/data
ENV DATABASE_PATH=/app/data/hcc.db

# Switch to non-root user
USER hcc

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the server
CMD ["node", "dist/index.js"]
