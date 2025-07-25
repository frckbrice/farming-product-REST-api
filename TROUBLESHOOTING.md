# Troubleshooting Guide

This document lists common issues encountered during development and their solutions.

## Table of Contents
- [Environment Setup Issues](#environment-setup-issues)
- [Docker Issues](#docker-issues)
- [Database Issues](#database-issues)
- [Authentication Issues](#authentication-issues)
- [Code Quality Issues](#code-quality-issues)
- [Testing Issues](#testing-issues)

## Environment Setup Issues

### Missing Environment Variables
**Problem**: Application fails to start due to missing environment variables.  
**Solution**: 
1. Copy `.env.example` to create a new `.env` file
2. Fill in all required variables:
   ```env
   NODE_ENV=development
   PORT=3000
   
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_NAME=farming_products
   
   # JWT Configuration
   JWT_SECRET=your_jwt_secret
   JWT_SECRET_REFRESH=your_jwt_refresh_secret
   ```

### Node.js Version Compatibility
**Problem**: Package installation fails due to Node.js version mismatch.  
**Solution**: 
1. Use Node.js version 20 or later
2. Run `nvm use 20` if using nvm
3. Delete `node_modules` and `yarn.lock`
4. Run `yarn install` again

## Docker Issues

### Docker Compose Database Connection
**Problem**: Application container cannot connect to database container.  
**Solution**:
1. Ensure correct service names in `docker-compose.yml`
2. Use service name as host in database connection:
   ```yaml
   environment:
     DB_HOST: db
     DB_PORT: 5432
   ```

### Docker Build Failures
**Problem**: Docker build fails due to TypeScript compilation errors.  
**Solution**:
1. Use multi-stage builds to separate build and runtime environments
2. Include all dependencies (including devDependencies) in builder stage
3. Copy only necessary files to production stage:
   ```dockerfile
   FROM node:20-alpine AS builder
   WORKDIR /app
   COPY package.json yarn.lock ./
   RUN yarn install --frozen-lockfile
   COPY . .
   RUN yarn build

   FROM node:20-alpine AS prod
   WORKDIR /app
   COPY --from=builder /app/package.json ./
   COPY --from=builder /app/yarn.lock ./
   COPY --from=builder /app/node_modules ./node_modules
   COPY --from=builder /app/dist ./dist
   ```

## Database Issues

### Migration Failures
**Problem**: Database migrations fail to run automatically.  
**Solution**:
1. Set `RUN_MIGRATIONS=true` in environment variables
2. Ensure migrations are compiled to JavaScript in the dist folder
3. Add migration command to startup:
   ```yaml
   command: sh -c "yarn install && yarn build && npx sequelize-cli db:migrate && node dist/app.js"
   ```

### Database Connection Timeouts
**Problem**: Application fails to connect to database on startup.  
**Solution**:
1. Add retry logic in database connection
2. Ensure correct database credentials in environment variables
3. Check if database service is ready before connecting

## Authentication Issues

### JWT Token Verification
**Problem**: JWT verification fails with "invalid signature".  
**Solution**:
1. Ensure same JWT secret is used for signing and verification
2. Check token expiration time
3. Verify token format in Authorization header:
   ```typescript
   // Correct format
   Authorization: Bearer <token>
   ```

### OAuth Integration
**Problem**: Google/Facebook authentication fails.  
**Solution**:
1. Verify OAuth credentials in environment variables
2. Ensure correct redirect URIs in OAuth provider settings
3. Handle token verification properly:
   ```typescript
   const ticket = await googleClient.verifyIdToken({
     idToken: googleToken,
     audience: process.env.GMAIL_AUTH_CLIENTID,
   });
   ```

## Code Quality Issues

### ESLint Errors

#### Unused Variables
**Problem**: ESLint error for unused function parameters.  
**Solution**:
1. Prefix unused parameters with underscore
2. Update ESLint configuration:
   ```json
   {
     "rules": {
       "@typescript-eslint/no-unused-vars": [
         "error",
         { "argsIgnorePattern": "^_" }
       ]
     }
   }
   ```

#### Express Error Handler
**Problem**: Unused `next` parameter in error handler.  
**Solution**:
1. Remove unused parameter if not needed
2. Or prefix with underscore if required by type definition:
   ```typescript
   const errorHandler = (
     err: Error | AppError,
     _req: Request,
     res: Response
   ): void => {
     // Handler implementation
   };
   ```

### TypeScript Type Issues
**Problem**: Type errors in request handlers.  
**Solution**:
1. Define proper interfaces for request bodies
2. Use type assertions carefully
3. Implement proper type checking:
   ```typescript
   interface LoginRequest {
     email: string;
     password: string;
   }

   app.post('/login', (req: Request<unknown, unknown, LoginRequest>, res: Response) => {
     const { email, password } = req.body;
     // Implementation
   });
   ```

## Testing Issues

### Test Environment Setup
**Problem**: Tests fail due to missing environment variables.  
**Solution**:
1. Create `tests/setup.ts` for test environment configuration
2. Set test-specific environment variables:
   ```typescript
   process.env.NODE_ENV = 'test';
   process.env.JWT_SECRET = 'test_secret';
   ```

### Database Mocking
**Problem**: Tests fail due to database operations.  
**Solution**:
1. Create mock implementations for database models
2. Use Vitest for mocking:
   ```typescript
   vi.mock('../src/models', () => ({
     User: {
       findOne: vi.fn(),
       create: vi.fn(),
     }
   }));
   ```

### API Testing
**Problem**: Integration tests fail due to authentication.  
**Solution**:
1. Create test utilities for generating valid tokens
2. Mock authentication middleware in tests
3. Use supertest for API testing:
   ```typescript
   import request from 'supertest';
   import app from '../app';

   describe('Auth endpoints', () => {
     it('should login successfully', async () => {
       const response = await request(app)
         .post('/api/v1/auth/login')
         .send({
           email: 'test@example.com',
           password: 'password123'
         });
       expect(response.status).toBe(200);
     });
   });
   ``` 