# Use official Node.js 20 image
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy source files and configs
COPY . .

# Verify files exist
RUN ls -la && \
    echo "Contents of tsconfig.json:" && \
    cat tsconfig.json

# Build the app
RUN yarn build

# Production image
FROM node:20-alpine AS prod
WORKDIR /app

# Copy only the necessary files
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/migrations ./migrations

EXPOSE 3000
CMD ["node", "dist/app.js"] 