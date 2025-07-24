# Farming Product REST API Backend

## 🌾 Project Overview
Farming Product is a RESTful API designed to help farmers (sellers) connect with buyers and efficiently sell their agricultural products. The platform streamlines the transaction process, handling secure payments and ensuring both parties are kept informed throughout the transaction lifecycle.

- **Single Entry Point:** The application is launched from a single entry file: `app.ts`.
- **API Versioning:** All endpoints are versioned and accessible under `/api/v1/*` (e.g., `/api/v1/auth/login`).
- **Payment Handling:** The API manages payment methods and transaction flows between buyers and sellers, ensuring secure and reliable processing.
- **Push Notifications:** Real-time push notifications are sent to both buyers and sellers at key transaction stages using Expo Push Notification, keeping all actors updated on order progress.

---

## 🚀 Why This Project Stands Out
- **Modern TypeScript/Node.js stack** with strong typing and modular architecture
- **Automated Quality:** Every code push to GitHub is automatically linted, formatted, built, and tested (unit/integration) via CI/CD (GitHub Actions)
- **Swagger/OpenAPI 3.0:** All endpoints are fully documented for easy onboarding and API exploration
- **Robust Validation:** Zod is used for runtime validation on all major endpoints
- **Cloudinary File Uploads:** Secure, scalable image handling for user and product images
- **Prettier & ESLint:** Consistent code style enforced with pre-push hooks
- **Developer Experience:** Fast feedback, clear error messages, and a comprehensive troubleshooting guide
- **Ready for Production:** Dockerized, with Postgres, and best practices for deployment

---

## 📦 Automated CI/CD
Every push and pull request triggers:
- Linting (ESLint)
- Formatting (Prettier)
- Build (TypeScript)
- Unit & integration tests (Vitest, SuperTest)
- Docker image build & push (if configured)

See `.github/workflows/ci-cd.yml` for details.

## 📚 API Documentation
- All endpoints are documented using Swagger (OpenAPI 3.0)
- All endpoints are versioned under `/api/v1/*` (e.g., `/api/v1/auth/login`)
- Models, request/response schemas, and authentication requirements are described in detail
- JWT Bearer authentication is required for all protected endpoints
- Access docs at: `http://localhost:3000/api-docs` (Swagger UI reflects the versioned API)

## �� Authentication
- JWT tokens are required for all routes except `/auth/*`
- Add `Authorization: Bearer <token>` header to requests

## ☁️ File Uploads (Cloudinary)
- Product and user image uploads are supported via multipart/form-data
- See Swagger docs for detailed request/response examples

## 🛡️ Validation
- All major endpoints use Zod for request validation
- Validation errors return 400 with detailed error messages (see Swagger examples)

## 🧹 Code Formatting
- Prettier is used for code formatting. Run `yarn format` to format all source files
- A pre-push hook automatically formats code before every push

## 🧪 Testing
- Run all tests: `yarn test`
- Tests use [Vitest](https://vitest.dev/) and [SuperTest](https://github.com/visionmedia/supertest)
- Tests are run automatically on every push/PR via GitHub Actions

## 🛠️ Troubleshooting
For common issues and solutions, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

This project is licensed under the MIT License.

## 📬 Example API Requests

### User Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "yourpassword"}'
```

### Create Product (with JWT and image upload)
```bash
curl -X POST http://localhost:3000/api/v1/user/product/add \
  -H "Authorization: Bearer <your_jwt_token>" \
  -F "productName=Tomato" \
  -F "productCat=Vegetable" \
  -F "priceType=per kg" \
  -F "price=1000" \
  -F "productImage=@/path/to/image.jpg"
```

### Get All Products (with JWT)
```bash
curl -X GET http://localhost:3000/api/v1/user/product \
  -H "Authorization: Bearer <your_jwt_token>"
```

See Swagger UI (`/api-docs`) for all endpoints, models, and authentication details.
