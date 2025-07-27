# Troubleshooting Guide

This document lists common issues encountered during development and their solutions.

## Table of Contents
- [Environment Setup Issues](#environment-setup-issues)
- [Docker Issues](#docker-issues)
- [Database Issues](#database-issues)
- [Authentication Issues](#authentication-issues)
- [Code Quality Issues](#code-quality-issues)
- [Testing Design Decisions](#testing-design-decisions)
- [Testing Issues](#testing-issues)
- [Static File Serving Issues](#static-file-serving-issues)
- [TypeScript Compilation Issues](#typescript-compilation-issues)

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

## Testing Design Decisions

### Testing Strategy Overview
Our testing approach is built on three main pillars:

1. **Unit Tests**
   - Purpose: Test individual components in isolation
   - Coverage Target: 80% for utilities and helper functions
   - Tools: Vitest for test runner, vi.mock() for mocking
   - Example:
   ```typescript
   describe('validateEmail', () => {
     it('should validate correct email format', () => {
       expect(validateEmail('test@example.com')).toBe(true);
       expect(validateEmail('invalid-email')).toBe(false);
     });
   });
   ```

2. **Integration Tests**
   - Purpose: Test component interactions and API endpoints
   - Coverage Target: 70% for controllers and routes
   - Tools: Supertest for HTTP testing, test database for data persistence
   - Example:
   ```typescript
   describe('Product API', () => {
     it('should create a new product', async () => {
       const response = await request(app)
         .post('/api/v1/products')
         .set('Authorization', `Bearer ${testToken}`)
         .send(testProduct);
       expect(response.status).toBe(201);
     });
   });
   ```

3. **Coverage Testing**
   - Tool: V8 coverage provider
   - Minimum Thresholds:
     ```typescript
     thresholds: {
       branches: 25,
       functions: 10,
       lines: 25,
       statements: 25
     }
     ```
   - Reports: Text, JSON, HTML, and LCOV formats
   - CI Integration: Coverage reports in GitHub Actions

### Test Organization
```
tests/
├── unit/
│   ├── utils/
│   └── helpers/
├── integration/
│   ├── api/
│   └── services/
├── mocks/
│   ├── database.ts
│   └── services.ts
└── setup.ts
```

### Mocking Strategy
1. **External Services**
   - Mock HTTP calls using vi.mock()
   - Use mock implementations for email, payment services
   - Example:
   ```typescript
   vi.mock('nodemailer', () => ({
     createTransport: () => ({
       sendMail: vi.fn().mockResolvedValue({ messageId: 'test' })
     })
   }));
   ```

2. **Database Operations**
   - Use in-memory SQLite for integration tests
   - Mock Sequelize models for unit tests
   - Provide test factories for common entities

### Best Practices
1. **Test Isolation**
   - Reset database state between tests
   - Clear mocks after each test
   - Use beforeEach and afterEach hooks

2. **Test Data Management**
   - Use factories for test data generation
   - Avoid sharing mutable state between tests
   - Example:
   ```typescript
   const createTestUser = () => ({
     id: uuidv4(),
     email: 'test@example.com',
     password: hashSync('password123', 10)
   });
   ```

3. **Error Testing**
   - Test both success and error paths
   - Verify error messages and status codes
   - Test edge cases and boundary conditions

## Testing Issues

### Nodemailer Mocking Issues
**Problem**: Tests fail with error "Cannot read properties of undefined (reading 'sendMail')" when testing email functionality.  
**Root Cause**: 
- Nodemailer is imported as a default ESM import: `import nodemailer from "nodemailer"`
- The mock structure doesn't match the expected import pattern
- Vitest hoisting issues with variable declarations outside mock factories

**Solution**:
1. Use a minimal mock that matches the ESM default import pattern:
   ```typescript
   vi.mock('nodemailer', () => ({
     __esModule: true,
     default: {
       createTransport: () => ({
         sendMail: () => Promise.resolve({ messageId: 'test-message-id' }),
       }),
     },
   }));
   ```

2. **Avoid these common mistakes**:
   - Don't use variables outside the mock factory (causes hoisting issues)
   - Don't use `vi.fn()` outside the factory unless properly exported
   - Don't mix CommonJS and ESM import patterns

3. **For more complex mocking with assertions**, define mocks inside the factory:
   ```typescript
   vi.mock('nodemailer', () => {
     const mockSendMail = vi.fn().mockResolvedValue({ messageId: 'test-message-id' });
     const mockCreateTransport = vi.fn().mockReturnValue({
       sendMail: mockSendMail,
     });
     
     return {
       __esModule: true,
       default: {
         createTransport: mockCreateTransport,
       },
     };
   });
   ```

4. **Alternative approach** for accessing mocks in tests:
   ```typescript
   // In test file
   import nodemailer from 'nodemailer';
   
   // Access the mock
   const mockCreateTransport = vi.mocked(nodemailer.createTransport);
   const mockTransporter = mockCreateTransport();
   const mockSendMail = vi.mocked(mockTransporter.sendMail);
   
   // Assert calls
   expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
     to: 'test@example.com',
     subject: 'Verify Your Email'
   }));
   ```

**Why this works**:
- The mock structure exactly matches how nodemailer is imported and used in the code
- `__esModule: true` ensures proper ESM module handling
- The `default` export contains the `createTransport` method
- `createTransport` returns an object with a `sendMail` method
- All functions are properly mocked to return promises

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

### Coverage Issues
**Problem**: Coverage reports show unexpectedly low coverage.  
**Solution**:
1. Ensure all source files are included in coverage analysis
2. Check coverage configuration in vitest.config.ts
3. Add missing test cases for uncovered code paths
4. Use coverage reports to identify untested code:
   ```bash
   # Generate detailed coverage report
   yarn coverage
   
   # View HTML coverage report
   open coverage/index.html
   ```

### 404 Page Setup
**Problem**: Need to serve a custom 404 page for non-existing routes.  
**Solution**:
1. Create a custom `404.html` file in the `public/` directory
2. Update the Express 404 handler to serve different responses based on request type:
   ```typescript
   // 404 handler - serve custom 404 page for HTML requests, JSON for API requests
   app.use((req: Request, res: Response, next: NextFunction) => {
     // Check if the request is for an API endpoint or expects JSON
     const isAPIRequest = req.path.startsWith('/api/') || req.get('Accept')?.includes('application/json');
     
     if (isAPIRequest) {
       // For API requests, return JSON error
       next(new AppError(`Not Found - ${req.originalUrl}`, 404));
     } else {
       // For web requests, serve the custom 404 page
       res.status(404).sendFile(path.join(__dirname, "../public/404.html"));
     }
   });
   ```

**Features of the 404 page**:
- Beautiful design with animations and gradients
- Helpful navigation options (Go Home, Go Back, API Docs)
- Search functionality for finding API endpoints
- Display of the requested path that caused the 404
- Interactive elements and keyboard shortcuts
- Responsive design for all devices

### Asset Organization
**Problem**: Need to organize static assets in a structured way.  
**Solution**:
1. Create an `assets/` directory within `public/` to organize all static files
2. Move CSS, JavaScript, and images to appropriate subdirectories:
   ```
   public/
   ├── index.html          # Main welcome page
   ├── 404.html            # Custom 404 error page
   ├── assets/             # Static assets directory
   │   ├── styles.css      # Additional CSS styles
   │   ├── script.js       # Interactive JavaScript features
   │   └── images/         # Image assets
   └── README.md           # Documentation
   ```

3. Update Express static file serving:
   ```typescript
   app.use("/public", express.static("public"));
   app.use("/public/assets", express.static("public/assets"));
   app.use("/public/assets/images", express.static("public/assets/images"));
   ```

4. Update HTML files to reference new asset paths:
   ```html
   <link rel="stylesheet" href="/public/assets/styles.css">
   <script src="/public/assets/script.js"></script>
   ```

5. Update multer storage configuration:
   ```typescript
   cb(null, "./public/assets/images");
   ```

**Benefits**:
- Better organization and maintainability
- Clear separation of concerns
- Easier to manage and update assets
- Consistent file structure across the project

### Async Test Issues
**Problem**: Tests fail due to timing issues with async operations.  
**Solution**:
1. Use proper async/await syntax
2. Implement retry logic for flaky tests
3. Add appropriate timeouts:
   ```typescript
   describe('Async operations', () => {
     it('should handle delayed responses', async () => {
       await expect(async () => {
         const result = await longRunningOperation();
         expect(result).toBeDefined();
       }).resolves.not.toThrow();
     }, 10000); // Extend timeout for long-running tests
   });
   ```

## Static File Serving Issues

### Docker Static File Serving
**Problem**: Static files (HTML, CSS, JS) are not served correctly in Docker containers.  
**Root Cause**: 
- The `public` directory is not copied to the production Docker image
- TypeScript compilation is disabled (`noEmit: true`)
- File paths are incorrect relative to the compiled `dist` directory

**Solution**:
1. **Ensure public directory is copied in Dockerfile**:
   ```dockerfile
   # Copy public directory to production stage
   COPY --from=builder /app/public ./public
   ```

2. **Enable TypeScript compilation** in `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "noEmit": false,  // Changed from true
       "outDir": "./dist"
     }
   }
   ```

3. **Use correct file paths** in `app.ts`:
   ```typescript
   // Root route - serve index.html
   app.get("/", (req: Request, res: Response) => {
     res.sendFile(path.join(__dirname, "../public/index.html"));
   });

   // 404 handler - serve 404.html for non-API requests
   app.use((req: Request, res: Response, next: NextFunction) => {
     const isAPIRequest = req.path.startsWith('/api/v1') || req.get('Accept')?.includes('application/json');
     if (isAPIRequest) {
       next(new AppError(`Not Found - ${req.originalUrl}`, 404));
     } else {
       res.status(404).sendFile(path.join(__dirname, "../public/404.html"));
     }
   });
   ```

4. **Configure static file serving**:
   ```typescript
   // Serve static files
   app.use("/public", express.static("public"));
   app.use("/public/assets", express.static("public/assets"));
   app.use("/public/assets/images", express.static("public/assets/images"));
   ```

**Why this works**:
- `__dirname` in the compiled container points to `/app/dist`
- `../public/` correctly resolves to `/app/public/`
- Static file serving makes assets accessible via HTTP

### Missing Coverage Dependency
**Problem**: Running `yarn vitest --coverage --ui` fails with "Cannot find dependency '@vitest/coverage-v8'".  
**Solution**:
1. Install the missing coverage dependency:
   ```bash
   yarn add -D @vitest/coverage-v8
   ```

2. Or use the coverage command that's already configured:
   ```bash
   yarn coverage
   ```

### Interactive Coverage UI Issues
**Problem**: Vitest UI fails to start or shows errors.  
**Solution**:
1. Ensure all dependencies are installed:
   ```bash
   yarn install
   ```

2. Try running UI without coverage first:
   ```bash
   yarn vitest --ui
   ```

3. If issues persist, use the standard coverage command:
   ```bash
   yarn coverage
   ```

## TypeScript Compilation Issues

### Docker Build TypeScript Errors
**Problem**: Docker build fails with TypeScript compilation errors.  
**Root Cause**: 
- `tsconfig.json` has `"noEmit": true` preventing JavaScript output
- Build process expects compiled files in `dist/` directory

**Solution**:
1. **Update `tsconfig.json`**:
   ```json
   {
     "compilerOptions": {
       "noEmit": false,  // Enable compilation
       "outDir": "./dist",
       "rootDir": "./src"
     }
   }
   ```

2. **Ensure build process works**:
   ```bash
   # Test build locally
   yarn build
   
   # Verify dist directory is created
   ls -la dist/
   ```

3. **Update Dockerfile** to handle build properly:
   ```dockerfile
   FROM node:20-alpine AS builder
   WORKDIR /app
   COPY package.json yarn.lock ./
   RUN yarn install --frozen-lockfile
   COPY . .
   RUN yarn build  # This will now work

   FROM node:20-alpine AS prod
   WORKDIR /app
   COPY --from=builder /app/package.json ./
   COPY --from=builder /app/yarn.lock ./
   COPY --from=builder /app/node_modules ./node_modules
   COPY --from=builder /app/dist ./dist
   COPY --from=builder /app/public ./public
   COPY --from=builder /app/migrations ./migrations
   ```

### Environment Variable Issues in Docker
**Problem**: Application fails to start due to missing environment variables in Docker.  
**Solution**:
1. **Add required environment variables** to `docker-compose.yml`:
   ```yaml
   environment:
     # Database Configuration
     DATABASE_URL: postgresql://${DB_USER:-postgres}:${DB_PASSWORD:-postgres}@db:5432/${DB_HOSTNAME:-farming_products}
     
     # JWT Configuration
     JWT_SECRET: ${JWT_SECRET:-your_jwt_secret}
     JWT_SECRET_REFRESH: ${JWT_SECRET_REFRESH:-your_jwt_refresh_secret}
     
     # Payment Configuration (Adwa)
     ADWA_MERCHANT_KEY: ${ADWA_MERCHANT_KEY:-dummy-merchant-key}
     ADWA_APPLICATION_KEY: ${ADWA_APPLICATION_KEY:-dummy-application-key}
     ADWA_SUBSCRIPTION_KEY: ${ADWA_SUBSCRIPTION_KEY:-dummy-subscription-key}
     ADWA_BASE_URL: ${ADWA_BASE_URL:-https://dummy-api.adwa.com}
   ```

2. **Create `.env` file** with actual values for development:
   ```env
   JWT_SECRET=your_actual_jwt_secret
   JWT_SECRET_REFRESH=your_actual_jwt_refresh_secret
   ADWA_MERCHANT_KEY=your_actual_merchant_key
   ADWA_APPLICATION_KEY=your_actual_application_key
   ADWA_SUBSCRIPTION_KEY=your_actual_subscription_key
   ADWA_BASE_URL=https://api.adwa.com
   ```

### Port Conflicts in Docker
**Problem**: Docker containers fail to start due to port conflicts.  
**Solution**:
1. **Change database port mapping** in `docker-compose.yml`:
   ```yaml
   db:
     image: postgres:15
     ports:
       - "5433:5432"  # Changed from 5432:5432
   ```

2. **Check for running containers**:
   ```bash
   # List running containers
   docker ps
   
   # Stop conflicting containers
   docker stop <container_id>
   
   # Or stop all containers
   docker stop $(docker ps -q)
   ```

3. **Use different ports** if needed:
   ```yaml
   app:
     ports:
       - "3001:3000"  # Use different host port
   ```

### Docker Daemon Issues
**Problem**: "Cannot connect to the Docker daemon" error.  
**Solution**:
1. **Start Docker Desktop** (macOS/Windows):
   - Open Docker Desktop application
   - Wait for Docker to fully start

2. **Start Docker service** (Linux):
   ```bash
   sudo systemctl start docker
   sudo systemctl enable docker
   ```

3. **Check Docker status**:
   ```bash
   docker --version
   docker info
   ```

### Sequelize Migration Issues in Docker
**Problem**: `sequelize-cli` fails with "stripAnsi is not a function" error.  
**Solution**:
1. **Temporarily disable migrations** in `docker-compose.yml`:
   ```yaml
   command: node dist/app.js  # Remove migration command
   ```

2. **Run migrations manually** if needed:
   ```bash
   # Connect to running container
   docker-compose exec app sh
   
   # Run migrations manually
   npx sequelize-cli db:migrate
   ```

3. **Alternative**: Use a different migration approach:
   ```yaml
   command: sh -c "sleep 10 && npx sequelize-cli db:migrate && node dist/app.js"
   ```

### File Path Resolution in Docker
**Problem**: File paths work locally but fail in Docker containers.  
**Root Cause**: 
- Different working directories between local and container environments
- Compiled TypeScript files have different `__dirname` values

**Solution**:
1. **Use absolute paths** in Docker:
   ```typescript
   // Instead of relative paths
   res.sendFile("./public/index.html");
   
   // Use absolute paths
   res.sendFile(path.join(__dirname, "../public/index.html"));
   ```

2. **Verify file locations** in container:
   ```bash
   # Connect to container
   docker-compose exec app sh
   
   # Check file structure
   ls -la /app/
   ls -la /app/dist/
   ls -la /app/public/
   ```

3. **Update multer storage paths**:
   ```typescript
   // Update destination for file uploads
   cb(null, "./public/assets/images");
   ```

### Health Check Endpoint
**Problem**: Need a simple health check endpoint for monitoring.  
**Solution**:
1. **Add health check route** in `src/routes/index.ts`:
   ```typescript
   appRouter.get("/health", (req, res) => {
     res.status(200).json({
       status: "success",
       message: "Farming Products API is running",
       timestamp: new Date().toISOString(),
       version: "1.0.0"
     });
   });
   ```

2. **Test the endpoint**:
   ```bash
   curl http://localhost:3000/api/v1/health
   ```

3. **Add to Docker health check** (optional):
   ```yaml
   healthcheck:
     test: ["CMD", "curl", "-f", "http://localhost:3000/api/v1/health"]
     interval: 30s
     timeout: 10s
     retries: 3
   ``` 