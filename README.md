# 🌾 Farming Products REST API



[![Node.js](https://img.shields.io/badge/Node.js-20-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-✓-blue.svg)](https://www.docker.com/)
[![CI/CD](https://img.shields.io/badge/CI/CD-GitHub%20Actions-green.svg)](https://github.com/features/actions)
[![Test Coverage](https://img.shields.io/badge/Test%20Coverage-80%25+-green.svg)](https://vitest.dev/)


  <div>
    <img src="./public/assets/images/farmingP_1.png" alt="Farming Product" width="100%" height="100%" />
  </div>
  <div>
    <img src="./public/assets/images/farmingP_2.png" alt="Farming Product" width="100%" height="100%" />
  </div>

## 🚀 Live Demo

- **API Documentation**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- **Welcome Page**: [http://localhost:3000/](http://localhost:3000/)
- **Health Check**: [http://localhost:3000/api/v1/health](http://localhost:3000/api/v1/health)

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [API Endpoints](#-api-endpoints)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)

## 🎯 Overview

This project demonstrates a **production-ready REST API** for a farming marketplace platform. It showcases modern software development practices including:

- **Microservices Architecture** with clean separation of concerns
- **TypeScript** for type safety and better developer experience
- **PostgreSQL** with Sequelize ORM for robust data management
- **JWT Authentication** with secure token-based sessions
- **File Upload** with Cloudinary integration
- **Real-time Notifications** using Expo Push Notifications
- **Payment Processing** with Adwa payment gateway
- **Comprehensive Testing** with 80%+ code coverage
- **Docker Containerization** for consistent deployment
- **CI/CD Pipeline** with automated testing and deployment

## ✨ Key Features

### 🔐 **Authentication & Security**
- JWT-based authentication with refresh tokens
- Role-based access control (Farmers, Buyers, Admins)
- Input validation with Zod schemas
- Rate limiting and security middleware
- Password hashing with bcrypt

### 🛒 **Functionality**
- Product catalog with search and filtering
- Order management system
- Secure payment processing
- User reviews and ratings
- Real-time order tracking

### 📱 **User Experience**
- Responsive web interface
- Push notifications for order updates
- File upload for product images
- User profile management
- Custom 404 error pages

### 🏗️ **Developer Experience**
- Comprehensive API documentation (Swagger/OpenAPI)
- Automated testing with Vitest
- Code quality tools (ESLint, Prettier)
- Hot reloading for development
- Detailed error logging

## 🛠️ Tech Stack

### **Backend**
- **Runtime**: Node.js 20
- **Language**: TypeScript 5.0
- **Framework**: Express.js
- **Database**: PostgreSQL 15
- **ORM**: Sequelize with TypeScript
- **Authentication**: JWT + bcrypt
- **Validation**: Zod schemas
- **File Upload**: Multer + Cloudinary

### **Testing & Quality**
- **Testing Framework**: Vitest
- **HTTP Testing**: Supertest
- **Code Coverage**: V8 Coverage
- **Linting**: ESLint
- **Formatting**: Prettier

### **DevOps & Deployment**
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Database Migrations**: Sequelize CLI
- **Environment Management**: dotenv

### **External Services**
- **Cloud Storage**: Cloudinary
- **Push Notifications**: Expo
- **Payment Gateway**: Adwa
- **Email Service**: Nodemailer

## 🏛️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Apps   │    │   Web Browser   │    │   Mobile Apps   │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │    Express.js Server      │
                    │   (TypeScript + Node.js)  │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │    Business Logic Layer   │
                    │  (Controllers + Services) │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │    Data Access Layer      │
                    │   (Sequelize + Models)    │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │      PostgreSQL DB        │
                    └───────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL (or use Docker)

### 1. Clone & Install
```bash
git clone <repository-url>
cd farming-product-REST-api
yarn install
```

### 2. Environment Setup
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Run with Docker (Recommended)
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

### 4. Run Locally
```bash
# Start database
docker-compose up db -d

# Run migrations
npx sequelize-cli db:migrate

# Start development server
yarn dev
```

## 📡 API Endpoints

### **Authentication**
```http
POST   /api/v1/auth/signup     # User registration
POST   /api/v1/auth/login      # User login
POST   /api/v1/auth/verifyOTP  # OTP verification
```

### **Products**
```http
GET    /api/v1/products        # Get all products
POST   /api/v1/products        # Create product (Farmers only)
GET    /api/v1/products/:id    # Get product by ID
PUT    /api/v1/products/:id    # Update product
DELETE /api/v1/products/:id    # Delete product
```

### **Orders & Payments**
```http
POST   /api/v1/orders          # Create order
GET    /api/v1/orders          # Get user orders
POST   /api/v1/payments        # Process payment
```

### **User Management**
```http
GET    /api/v1/users/profile   # Get user profile
PUT    /api/v1/users/profile   # Update profile
POST   /api/v1/users/upload-avatar # Upload profile picture
```

### **System**
```http
GET    /api/v1/health          # Health check with DB status
GET    /api-docs               # API documentation (Swagger)
```

## 🧪 Testing

### Run All Tests
```bash
yarn test              # Run tests
yarn coverage          # Generate coverage report
yarn vitest --ui       # Interactive test UI
```

### Test Coverage
- **Unit Tests**: 80%+ coverage
- **Integration Tests**: API endpoints
- **Mocking**: External services (email, payments)
- **Database**: Test database with migrations

### Example Test
```typescript
describe('Auth Controller', () => {
  it('should create user and send OTP on successful signup', async () => {
    const response = await request(app)
      .post('/api/v1/auth/signup')
      .send({
        email: 'test@example.com',
        password: 'password123',
        role: 'farmer'
      });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message', 'User created successfully');
  });
});
```

## 🐳 Deployment

### Docker Deployment
```bash
# Build and run
docker-compose up --build -d

# Production build
docker build -t farming-api .
docker run -p 3000:3000 farming-api
```

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# JWT
JWT_SECRET=your_jwt_secret
JWT_SECRET_REFRESH=your_refresh_secret

# External Services
CLOUDINARY_CLOUD_NAME=your_cloud_name
ADWA_MERCHANT_KEY=your_merchant_key
```

## 📁 Project Structure

```
farming-product-REST-api/
├── src/
│   ├── controllers/          # API controllers
│   │   ├── auth.controller.ts
│   │   ├── product.controller.ts
│   │   └── user.controller.ts
│   ├── middleware/           # Express middleware
│   │   ├── auth-check.ts
│   │   ├── errorHandler.ts
│   │   └── rateLimiter.ts
│   ├── models/              # Database models
│   │   ├── user.ts
│   │   ├── product.ts
│   │   └── order.ts
│   ├── routes/              # API routes
│   │   ├── auth.routes.ts
│   │   ├── product.routes.ts
│   │   └── user.routes.ts
│   ├── config/              # Configuration
│   │   └── config.ts
│   └── utils/               # Utility functions
│       └── runMigrations.ts
├── public/                  # Static files
│   ├── index.html          # Welcome page
│   ├── 404.html            # Custom 404 page
│   └── assets/             # Static assets
│       ├── styles.css
│       ├── script.js
│       └── images/
├── tests/                   # Test files
│   ├── controllers/
│   ├── mocks/
│   └── setup.ts
├── migrations/             # Database migrations
├── docker-compose.yml      # Docker services
├── Dockerfile             # Docker configuration
└── README.md              # This file
```

## 🎯 Key Achievements

- **Scalable Architecture**: Designed for high-traffic e-commerce operations
- **Security First**: Implemented comprehensive security measures
- **Developer Experience**: Full CI/CD pipeline with automated testing
- **Production Ready**: Dockerized deployment with health monitoring
- **Documentation**: Complete API documentation with Swagger
- **Code Quality**: 80%+ test coverage with TypeScript

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Developer

**Developed by [Avom Brice](https://maebrieporfolio.vercel.app)**

*Full-Stack Developer | TypeScript | Node.js | React | DevOps*

---

**Ready to scale your e-commerce platform? This API demonstrates enterprise-level development practices with modern technologies and best practices.**
