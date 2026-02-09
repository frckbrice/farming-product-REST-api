# ============== Stage 1: Build ==============
FROM node:20-alpine AS builder

WORKDIR /app

# Install deps (devDependencies needed for TypeScript build)
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

# ============== Stage 2: Production (minimal, non-root) ==============
FROM node:20-alpine AS prod

# Non-root user (UID/GID 1001 to avoid conflict with node:20-alpine's default 1000)
RUN addgroup -g 1001 appgroup && \
    adduser -u 1001 -G appgroup -s /bin/sh -D appuser

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5003
# DATABASE_URL is not set in the image (secrets stay out of the build).
# Pass it at runtime: docker run -e DATABASE_URL="postgresql://..." or use --env-file .env

# Production deps only; clean cache in same layer to avoid bloating image
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production --ignore-optional && \
    yarn cache clean

# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/public ./public

# Own all app files as non-root user
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 5003

CMD ["node", "dist/app.js"]
