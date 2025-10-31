# Nexus Backend (nexus-be)

![Node.js](https://img.shields.io/badge/Node.js-20.x-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Express](https://img.shields.io/badge/Express-5.1-lightgrey)
![MongoDB](https://img.shields.io/badge/MongoDB-8.19-green)
![Redis](https://img.shields.io/badge/Redis-5.8-red)

A robust, scalable backend API built with Express, TypeScript, MongoDB, and Redis. This project implements enterprise-grade authentication, role-based authorization, job queuing with BullMQ, and comprehensive error handling.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Architecture](#-architecture)
- [Development Guide](#-development-guide)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Queue System](#-queue-system)
- [Authentication & Authorization](#-authentication--authorization)
- [Error Handling](#-error-handling)
- [Logging](#-logging)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Best Practices](#-best-practices)

---

## ✨ Features

- 🔐 **JWT Authentication** - Access & Refresh token implementation
- 📧 **OTP-based Login** - Email-based OTP authentication
- 🔑 **LinkedIn OAuth** - Social authentication integration
- 👥 **Role-Based Access Control (RBAC)** - Comprehensive permission system
- 🚀 **Job Queue System** - BullMQ with Redis for background jobs
- ✅ **Request Validation** - Zod schema validation
- 📝 **Structured Logging** - Winston logger with file rotation
- 🛡️ **Error Handling** - Centralized error management
- 🔄 **TypeScript** - Full type safety
- 🏗️ **Modular Architecture** - Clean, scalable folder structure
- 🌐 **RESTful API** - Standard HTTP methods and status codes
- 🔧 **Worker Process** - Separate process for queue consumers

---

## 🛠 Tech Stack

### Core
- **Runtime**: Node.js 20.x
- **Language**: TypeScript 5.9
- **Framework**: Express 5.1
- **Database**: MongoDB 8.19 (Mongoose ODM)
- **Cache/Queue**: Redis 5.8 (ioredis)

### Key Dependencies
- **Authentication**: jsonwebtoken, bcrypt
- **Validation**: Zod 4.1
- **Queue System**: BullMQ 5.61
- **Logging**: Winston 3.18, Morgan
- **Email**: Nodemailer 7.0
- **HTTP Client**: Axios 1.12

### Development
- **TypeScript Tooling**: ts-node, tsc-alias, tsconfig-paths
- **Process Manager**: nodemon
- **Type Definitions**: @types/* packages

---

## 📁 Project Structure

```
nexus-be/
├── src/
│   ├── @types/              # TypeScript type definitions
│   │   ├── config.ts        # Config types
│   │   ├── enum.ts          # Enums
│   │   ├── index.types.ts   # Common types
│   │   ├── models/          # Model types
│   │   │   ├── common.ts
│   │   │   ├── permissions.types.ts
│   │   │   ├── role.type.ts
│   │   │   └── user.types.ts
│   │   └── queues/          # Queue job types
│   │       └── job.types.ts
│   │
│   ├── config/              # Configuration files
│   │   ├── env.ts           # Environment config
│   │   ├── index.ts         # MongoDB connection
│   │   ├── logger.ts        # Winston logger setup
│   │   ├── redis.ts         # Redis connection
│   │   └── bullmq.ts        # BullMQ configuration
│   │
│   ├── middlewares/         # Express middlewares
│   │   ├── auth.middleware.ts    # JWT verification
│   │   └── errorHandler.ts       # Global error handler
│   │
│   ├── models/              # Mongoose models
│   │   ├── index.ts
│   │   ├── user.model.ts
│   │   ├── role.model.ts
│   │   └── permissions.model.ts
│   │
│   ├── modules/             # Feature modules
│   │   ├── auth/            # Authentication module
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.route.ts
│   │   │   └── auth.validator.ts
│   │   └── user/            # User module
│   │       ├── user.controller.ts
│   │       ├── user.service.ts
│   │       ├── user.route.ts
│   │       └── user.validator.ts
│   │
│   ├── queues/              # BullMQ queue definitions
│   │   ├── connection.ts    # Shared Redis connection
│   │   ├── index.ts         # Queue bootstrap
│   │   └── otpQueue.ts      # OTP queue
│   │
│   ├── consumer/            # Queue workers
│   │   ├── index.ts
│   │   └── otpWorker.ts     # OTP job processor
│   │
│   ├── services/            # Business logic services
│   │   ├── email.service.ts
│   │   ├── otp.service.ts
│   │   └── queue.service.ts
│   │
│   ├── lib/                 # Utility libraries
│   │   └── otpStore.ts      # Redis OTP storage
│   │
│   ├── utils/               # Helper utilities
│   │   ├── ApiError.ts      # Custom error class
│   │   ├── ApiResponse.ts   # Response formatter
│   │   ├── asyncHandler.ts  # Async wrapper
│   │   ├── zodValidator.ts  # Zod validation helper
│   │   ├── index.ts
│   │   └── messages/        # i18n messages
│   │       ├── index.ts
│   │       └── messages.ts
│   │
│   ├── routes/              # Route aggregation
│   │   └── index.ts
│   │
│   ├── app.ts               # Express app setup
│   └── server.ts            # Server entry point
│
├── logs/                    # Application logs
│   ├── combined.log
│   └── error.log
│
├── nodemon.json             # Nodemon config (API server)
├── nodemon.worker.json      # Nodemon config (Worker)
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies & scripts
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v20.x or higher
- **MongoDB**: v8.x or higher
- **Redis**: v7.x or higher
- **npm**: v10.x or higher

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nexus-be
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:8

   # Or use your local MongoDB installation
   mongod --dbpath /path/to/data
   ```

5. **Start Redis**
   ```bash
   # Using Docker
   docker run -d -p 6379:6379 --name redis redis:7

   # Or use your local Redis installation
   redis-server
   ```

### Running the Application

#### Development Mode

**Terminal 1: Start the API server**
```bash
npm run dev
```

**Terminal 2: Start the queue worker**
```bash
npm run dev:worker
```

#### Production Mode

```bash
npm run build
npm start
```

### Verify Installation

1. **Health Check**
   ```bash
   curl http://localhost:5000/health
   ```

2. **API Root**
   ```bash
   curl http://localhost:5000/
   ```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Application
NODE_ENV=development
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017
DB_NAME=nexus_db

# JWT Tokens
ACCESS_TOKEN_SECRET=your_super_secret_access_token_key_change_this
REFRESH_TOKEN_SECRET=your_super_secret_refresh_token_key_change_this
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_USERNAME=
REDIS_PASSWORD=
REDIS_DB=0
REDIS_TLS=false

# BullMQ
BULLMQ_PREFIX=bullmq
BULLMQ_MAX_RETRIES=3
BULLMQ_BACKOFF_DELAY=1000

# LinkedIn OAuth (Optional)
CLIENT_ID=your_linkedin_client_id
CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_REDIRECT_URI=http://localhost:5000/api/auth/linkedin/callback
LINKEDIN_ORG_URN=urn:li:organization:123456

# Email Service (Configure based on your provider)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@nexus.com
```

### Environment Variable Descriptions

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment mode | No | `development` |
| `PORT` | Server port | No | `5000` |
| `MONGO_URI` | MongoDB connection string | Yes | - |
| `DB_NAME` | MongoDB database name | Yes | - |
| `ACCESS_TOKEN_SECRET` | JWT access token secret | Yes | - |
| `REFRESH_TOKEN_SECRET` | JWT refresh token secret | Yes | - |
| `ACCESS_TOKEN_EXPIRY` | Access token lifetime | No | `15m` |
| `REFRESH_TOKEN_EXPIRY` | Refresh token lifetime | No | `7d` |
| `REDIS_HOST` | Redis server host | No | `127.0.0.1` |
| `REDIS_PORT` | Redis server port | No | `6379` |

---

## 🏗 Architecture

### Design Patterns

1. **Module Pattern**: Feature-based organization (auth, user, etc.)
2. **Service Layer Pattern**: Business logic separated from controllers
3. **Repository Pattern**: Data access abstraction through Mongoose models
4. **Middleware Pattern**: Request processing pipeline
5. **Factory Pattern**: Queue and connection management
6. **Singleton Pattern**: Shared Redis connections

### Request Flow

```
Client Request
    ↓
Express App
    ↓
Morgan Logger → Winston
    ↓
CORS Middleware
    ↓
Body Parser
    ↓
Cookie Parser
    ↓
Route Handler
    ↓
Zod Validator
    ↓
Auth Middleware (if protected)
    ↓
Controller
    ↓
Service Layer
    ↓
Model/Database
    ↓
Response Formatter
    ↓
Error Handler (if error)
    ↓
Client Response
```

### Key Architecture Decisions

1. **TypeScript First**: Strong typing throughout the application
2. **Async/Await**: Modern asynchronous patterns
3. **Error-First Callbacks**: Consistent error handling
4. **Environment-Based Config**: Centralized configuration management
5. **Dependency Injection**: Loose coupling between components

---

## 📘 Development Guide

### Module Structure

Each feature module should follow this structure:

```
module-name/
├── module-name.controller.ts   # HTTP handlers
├── module-name.service.ts      # Business logic
├── module-name.route.ts        # Route definitions
├── module-name.validator.ts    # Zod schemas
└── module-name.types.ts        # TypeScript types (optional)
```

### Creating a New Module

1. **Create the module directory**
   ```bash
   mkdir -p src/modules/feature-name
   ```

2. **Define types** (`feature-name.types.ts`)
   ```typescript
   export interface IFeature {
     id: string;
     name: string;
     // ... other fields
   }
   ```

3. **Create validator** (`feature-name.validator.ts`)
   ```typescript
   import { z } from 'zod';

   export const createFeatureSchema = z.object({
     name: z.string().min(3).max(100),
     // ... other fields
   });

   export type CreateFeatureInput = z.infer<typeof createFeatureSchema>;
   ```

4. **Create service** (`feature-name.service.ts`)
   ```typescript
   import { ApiError, ApiResponse, t } from 'utils';
   import { FeatureModel } from 'models';
   import { CreateFeatureInput } from './feature-name.validator';

   export const FeatureService = {
     create: async (data: CreateFeatureInput) => {
       // Business logic here
       const feature = await FeatureModel.create(data);
       return new ApiResponse(201, 'Feature created', feature);
     },

     getAll: async () => {
       const features = await FeatureModel.find();
       return new ApiResponse(200, 'Features retrieved', features);
     },

     // ... other methods
   };
   ```

5. **Create controller** (`feature-name.controller.ts`)
   ```typescript
   import { asyncHandler } from 'utils';
   import { FeatureService } from './feature-name.service';

   export const FeatureController = {
     create: asyncHandler(async (req, res) => {
       const response = await FeatureService.create(req.body);
       return res.status(response.status).json(response);
     }),

     getAll: asyncHandler(async (req, res) => {
       const response = await FeatureService.getAll();
       return res.status(response.status).json(response);
     }),

     // ... other handlers
   };
   ```

6. **Create routes** (`feature-name.route.ts`)
   ```typescript
   import { Router } from 'express';
   import { FeatureController } from './feature-name.controller';
   import { validate } from 'utils/zodValidator';
   import { createFeatureSchema } from './feature-name.validator';
   import { verifyJWT } from 'middlewares/auth.middleware';

   const router = Router();

   router.post(
     '/',
     verifyJWT,  // Add if authentication required
     validate(createFeatureSchema),
     FeatureController.create
   );

   router.get('/', FeatureController.getAll);

   export default router;
   ```

7. **Register routes** (in `src/routes/index.ts`)
   ```typescript
   import featureRoutes from '../modules/feature-name/feature-name.route';

   router.use('/features', featureRoutes);
   ```

### Creating a New Model

1. **Define types** (in `src/@types/models/`)
   ```typescript
   import { HydratedDocument, Model } from 'mongoose';
   import { BaseDocument } from './common';

   export interface IFeature extends BaseDocument {
     name: string;
     description?: string;
     // ... other fields
   }

   export interface FeatureDocument extends HydratedDocument<IFeature> {
     // Instance methods
     doSomething(): Promise<void>;
   }

   export interface FeatureModelType extends Model<IFeature> {
     // Static methods
     findByName(name: string): Promise<FeatureDocument | null>;
   }
   ```

2. **Create model** (in `src/models/`)
   ```typescript
   import mongoose from 'mongoose';
   import { IFeature, FeatureDocument, FeatureModelType } from '@types/models/feature.types';

   const featureSchema = new mongoose.Schema<IFeature>(
     {
       name: {
         type: String,
         required: [true, 'Name is required'],
         unique: true,
       },
       description: String,
     },
     {
       timestamps: true,
       collection: 'features',
     }
   );

   // Static method
   featureSchema.statics.findByName = function(name: string) {
     return this.findOne({ name });
   };

   // Instance method
   featureSchema.methods.doSomething = async function() {
     // Implementation
   };

   export const FeatureModel = mongoose.model<IFeature, FeatureModelType>(
     'Feature',
     featureSchema
   );
   ```

3. **Export from models index** (in `src/models/index.ts`)
   ```typescript
   export * from './feature.model';
   ```

### Creating Background Jobs

1. **Define job types** (in `src/@types/queues/job.types.ts`)
   ```typescript
   export interface EmailJobData {
     to: string;
     subject: string;
     body: string;
   }
   ```

2. **Create queue** (in `src/queues/`)
   ```typescript
   import { Queue } from 'bullmq';
   import { getRedisConnection } from './connection';
   import { EmailJobData } from '@types/queues/job.types';

   export const emailQueue = new Queue<EmailJobData>('email', {
     connection: getRedisConnection(),
     defaultJobOptions: {
       attempts: 3,
       backoff: {
         type: 'exponential',
         delay: 1000,
       },
     },
   });

   export const addEmailJob = async (data: EmailJobData) => {
     await emailQueue.add('send-email', data);
   };
   ```

3. **Create worker** (in `src/consumer/`)
   ```typescript
   import { Worker, Job } from 'bullmq';
   import { getRedisConnection } from '../queues/connection';
   import { EmailJobData } from '@types/queues/job.types';
   import logger from '../config/logger';

   export const emailWorker = new Worker<EmailJobData>(
     'email',
     async (job: Job<EmailJobData>) => {
       logger.info(`Processing email job ${job.id}`);
       // Send email logic here
       await sendEmail(job.data);
       logger.info(`Email job ${job.id} completed`);
     },
     {
       connection: getRedisConnection(),
       concurrency: 5,
     }
   );

   emailWorker.on('completed', (job) => {
     logger.info(`Email job ${job.id} completed successfully`);
   });

   emailWorker.on('failed', (job, err) => {
     logger.error(`Email job ${job?.id} failed:`, err);
   });
   ```

4. **Bootstrap worker** (in `src/consumer/index.ts`)
   ```typescript
   export * from './emailWorker';
   ```

### Validation with Zod

**Define schemas:**
```typescript
import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email format'),
  age: z.number().int().positive().optional(),
});
```

**Use in routes:**
```typescript
import { validate } from 'utils/zodValidator';

router.post('/users', validate(createUserSchema), UserController.create);
```

### Error Handling

**Throwing errors:**
```typescript
import { ApiError } from 'utils';

// In services
if (!user) {
  throw new ApiError(404, 'User not found');
}

// With internationalization
throw new ApiError(404, t('USER.NOT_FOUND'));
```

**Custom error responses:**
```typescript
// ApiError is automatically caught by error middleware
// and formatted to:
{
  "statusCode": 404,
  "message": "User not found",
  "success": false,
  "errors": []
}
```

### Using asyncHandler

Wrap all async route handlers:
```typescript
import { asyncHandler } from 'utils';

export const MyController = {
  getUsers: asyncHandler(async (req, res) => {
    // No need for try-catch
    const users = await UserService.getAll();
    res.json(users);
  }),
};
```

### Logging

```typescript
import logger from 'config/logger';

// Info
logger.info('User created successfully', { userId: user._id });

// Error
logger.error('Database connection failed', error);

// Warning
logger.warn('Rate limit approaching for user', { userId });

// Debug (only in development)
logger.debug('Processing request', { body: req.body });
```

---

## 🔌 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "statusCode": 201,
  "message": "User registered successfully",
  "success": true,
  "data": {
    "_id": "65f1234567890abcdef",
    "name": "John Doe",
    "email": "john@example.com",
    "role": ["65f0000000000000000"],
    "isVerified": false,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Login successful",
  "success": true,
  "data": {
    "user": { /* user object */ },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc..."
    }
  }
}
```

Cookies are set automatically:
- `accessToken` (15 minutes)
- `refreshToken` (7 days)

#### Login with OTP
```http
POST /api/auth/login/otp
Content-Type: application/json

{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "OTP sent to email",
  "success": true
}
```

#### Verify OTP
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456"
}
```

#### LinkedIn OAuth
```http
GET /api/auth/linkedin
```
Redirects to LinkedIn for authentication.

```http
GET /api/auth/linkedin/callback?code=xxx&state=xxx
```
Callback endpoint after LinkedIn authentication.

### User Endpoints

All user endpoints require authentication (`Authorization: Bearer <token>` or `accessToken` cookie).

#### Get Current User
```http
GET /api/users/me
Authorization: Bearer <access_token>
```

#### Update User
```http
PATCH /api/users/me
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "John Updated",
  "age": 30
}
```

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "statusCode": 200,
  "status": "OK",
  "message": "Server is healthy and running smoothly.",
  "environment": "development",
  "uptime": "123.45 seconds",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "memoryUsage": {
    "rss": "50.25 MB",
    "heapUsed": "30.15 MB",
    "heapTotal": "45.00 MB"
  },
  "pid": 12345,
  "version": "1.0.0"
}
```

### Response Format

All API responses follow this structure:

**Success:**
```json
{
  "statusCode": 200,
  "message": "Success message",
  "success": true,
  "data": { /* response data */ }
}
```

**Error:**
```json
{
  "statusCode": 400,
  "message": "Error message",
  "success": false,
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

---

## 💾 Database Schema

### User Schema

```typescript
{
  _id: ObjectId,
  name: string,                    // Required
  email: string,                   // Required, unique, indexed
  password: string,                // Required, hashed, not returned in queries
  age?: number,                    // Optional
  profileImage?: string,           // Optional
  role: ObjectId[],                // Reference to Role collection
  refreshToken?: string,           // Stored refresh token
  isVerified: boolean,             // Default: false
  lastLoginAt: Date,               // Default: now
  createdAt: Date,                 // Auto-generated
  updatedAt: Date                  // Auto-generated
}
```

**Indexes:**
- `email`: Unique index

**Instance Methods:**
- `isPasswordCorrect(password: string): Promise<boolean>`
- `generateAccessToken(): Promise<string>`
- `generateRefreshToken(): Promise<string>`

**Static Methods:**
- `findByEmail(email: string): Promise<UserDocument | null>`

**Hooks:**
- Pre-save: Hash password if modified
- Pre-save: Assign default role if none provided
- toJSON/toObject: Remove password and refreshToken

### Role Schema

```typescript
{
  _id: ObjectId,
  name: string,                    // Required, unique (e.g., "USER", "ADMIN")
  description?: string,            // Optional
  permissions: ObjectId[],         // Reference to Permission collection
  createdAt: Date,
  updatedAt: Date
}
```

### Permission Schema

```typescript
{
  _id: ObjectId,
  resource: string,                // e.g., "user", "post"
  action: string,                  // e.g., "create", "read", "update", "delete"
  description?: string,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔄 Queue System

### Overview

The application uses **BullMQ** for background job processing. Jobs are stored in Redis and processed by separate worker processes.

### Available Queues

#### OTP Queue

**Purpose:** Send OTP emails asynchronously

**Job Data:**
```typescript
{
  email: string;
  otp: string;
}
```

**Usage:**
```typescript
import { addOtpJob } from 'queues/otpQueue';

await addOtpJob({
  email: 'user@example.com',
  otp: '123456'
});
```

**Worker:** `src/consumer/otpWorker.ts`

**Configuration:**
- Retry attempts: 3
- Backoff strategy: Exponential
- Delay: 1000ms base

### Creating New Queues

See [Creating Background Jobs](#creating-background-jobs) in the Development Guide.

### Monitoring Queues

**Using Redis CLI:**
```bash
redis-cli
> KEYS bullmq:*
> HGETALL bullmq:email:1
```

**Using BullBoard** (recommended for production):
Install and configure [@bull-board/express](https://github.com/felixmosh/bull-board)

---

## 🔒 Authentication & Authorization

### JWT Authentication

The application uses a dual-token system:

1. **Access Token** (15 minutes)
   - Short-lived
   - Used for API requests
   - Stored in cookies or Authorization header

2. **Refresh Token** (7 days)
   - Long-lived
   - Used to obtain new access tokens
   - Stored in database and cookies

### Authentication Flow

1. User logs in with credentials
2. Server validates credentials
3. Server generates access & refresh tokens
4. Tokens sent to client (cookies + response body)
5. Client includes access token in subsequent requests
6. When access token expires, use refresh token to get new access token

### Protected Routes

Add `verifyJWT` middleware to protect routes:

```typescript
import { verifyJWT } from 'middlewares/auth.middleware';

router.get('/protected', verifyJWT, controller.handler);
```

The middleware:
- Extracts token from cookie or Authorization header
- Verifies JWT signature
- Loads user from database
- Attaches user to `req.user`

### Authorization (RBAC)

**Role-Based Access Control** implementation:

**1. Check user roles:**
```typescript
const hasRole = (user: IUser, roleName: string) => {
  return user.role.some(role => role.name === roleName);
};
```

**2. Create authorization middleware:**
```typescript
export const requireRole = (roles: string[]) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    const userRoles = await RoleModel.find({ _id: { $in: req.user.role } });
    const hasPermission = userRoles.some(role => roles.includes(role.name));

    if (!hasPermission) {
      throw new ApiError(403, 'Forbidden');
    }

    next();
  });
};
```

**3. Use in routes:**
```typescript
router.delete(
  '/users/:id',
  verifyJWT,
  requireRole(['ADMIN']),
  UserController.delete
);
```

### OTP Authentication

1. User requests OTP with email
2. OTP generated and stored in Redis (5 min TTL)
3. OTP sent via email (background job)
4. User submits OTP for verification
5. If valid, tokens are issued

**OTP Storage (Redis):**
```
Key: otp:{email}
Value: {encrypted_otp}
TTL: 300 seconds (5 minutes)
```

---

## ⚠️ Error Handling

### ApiError Class

Custom error class for consistent error responses:

```typescript
import { ApiError } from 'utils';

throw new ApiError(
  statusCode,     // HTTP status code
  message,        // Error message
  errors?,        // Optional validation errors
  stack?          // Optional stack trace
);
```

**Examples:**
```typescript
// Simple error
throw new ApiError(404, 'User not found');

// With validation errors
throw new ApiError(400, 'Validation failed', [
  { field: 'email', message: 'Invalid email' }
]);

// Using i18n messages
throw new ApiError(401, t('AUTH.INVALID_CREDENTIALS'));
```

### Error Middleware

All errors are caught by the global error handler (`src/middlewares/errorHandler.ts`):

```typescript
// Catches and formats errors
// Logs errors with Winston
// Returns standardized error response
```

**Error Response Format:**
```json
{
  "statusCode": 400,
  "message": "Error description",
  "success": false,
  "errors": [
    {
      "field": "email",
      "message": "Invalid format"
    }
  ],
  "stack": "..." // Only in development
}
```

### Async Handler

Wraps async functions to catch errors automatically:

```typescript
import { asyncHandler } from 'utils';

// No need for try-catch
export const getUser = asyncHandler(async (req, res) => {
  const user = await UserService.getById(req.params.id);
  res.json(user);
});
```

### Zod Validation Errors

Validation errors are automatically formatted:

```typescript
import { validate } from 'utils/zodValidator';

router.post('/users', validate(createUserSchema), controller.create);
```

If validation fails:
```json
{
  "statusCode": 400,
  "message": "Validation Error",
  "success": false,
  "errors": [
    {
      "path": ["email"],
      "message": "Invalid email format"
    }
  ]
}
```

---

## 📝 Logging

### Winston Logger

Centralized logging with Winston (`src/config/logger.ts`):

**Log Levels:**
- `error`: Error messages (logged to error.log)
- `warn`: Warning messages
- `info`: Informational messages
- `debug`: Debug messages (development only)

**Log Files:**
- `logs/combined.log`: All logs
- `logs/error.log`: Error logs only

**Usage:**
```typescript
import logger from 'config/logger';

logger.info('User created', { userId: user._id, email: user.email });
logger.error('Database error', { error: err.message });
logger.warn('High memory usage', { usage: memoryUsage });
logger.debug('Request payload', { body: req.body });
```

### Morgan (HTTP Logging)

HTTP requests are logged with Morgan and piped to Winston:

```
GET /api/users 200 15ms
POST /api/auth/login 401 5ms
```

### Logging Best Practices

1. **Use appropriate log levels**
   - Error: Failures, exceptions
   - Warn: Deprecated usage, poor practices
   - Info: General informational messages
   - Debug: Detailed debug information

2. **Include context**
   ```typescript
   logger.info('User action', {
     userId: req.user._id,
     action: 'delete_post',
     postId: postId
   });
   ```

3. **Don't log sensitive data**
   ```typescript
   // ❌ Bad
   logger.info('Login attempt', { password: req.body.password });

   // ✅ Good
   logger.info('Login attempt', { email: req.body.email });
   ```

4. **Log at entry and exit points**
   ```typescript
   logger.info('Starting email send', { to: email });
   await sendEmail(email);
   logger.info('Email sent successfully', { to: email });
   ```

---

## 🧪 Testing

### Testing Strategy

**Recommended testing approach:**

1. **Unit Tests**: Test individual functions and methods
2. **Integration Tests**: Test API endpoints and database operations
3. **E2E Tests**: Test complete user flows

### Setting Up Tests

**Install testing dependencies:**
```bash
npm install --save-dev jest @types/jest ts-jest supertest @types/supertest
```

**Configure Jest** (`jest.config.js`):
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^utils$': '<rootDir>/src/utils',
    '^config/(.*)$': '<rootDir>/src/config/$1',
    '^models$': '<rootDir>/src/models',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.types.ts',
  ],
};
```

### Example Tests

**Unit Test (Service):**
```typescript
// src/modules/user/__tests__/user.service.test.ts
import { UserService } from '../user.service';
import { UserModel } from 'models';

jest.mock('models');

describe('UserService', () => {
  describe('getById', () => {
    it('should return user when found', async () => {
      const mockUser = { _id: '123', name: 'John', email: 'john@example.com' };
      (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await UserService.getById('123');

      expect(result.data).toEqual(mockUser);
      expect(UserModel.findById).toHaveBeenCalledWith('123');
    });

    it('should throw error when user not found', async () => {
      (UserModel.findById as jest.Mock).mockResolvedValue(null);

      await expect(UserService.getById('123')).rejects.toThrow('User not found');
    });
  });
});
```

**Integration Test (API):**
```typescript
// src/modules/auth/__tests__/auth.integration.test.ts
import request from 'supertest';
import app from '../../../app';
import { connectDB, closeDB } from '../../../config';

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await closeDB();
});

describe('POST /api/auth/register', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('_id');
    expect(response.body.data.email).toBe('test@example.com');
  });

  it('should fail with invalid email', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'invalid-email',
        password: 'Password123!',
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
```

### Running Tests

Add to `package.json`:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

Run tests:
```bash
npm test
npm run test:watch
npm run test:coverage
```

---

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT secrets (32+ characters, random)
- [ ] Enable HTTPS (TLS/SSL)
- [ ] Set secure cookie options (`httpOnly: true`, `secure: true`)
- [ ] Configure CORS for specific origins
- [ ] Set up MongoDB Atlas or managed MongoDB
- [ ] Set up Redis Cloud or managed Redis
- [ ] Configure environment variables securely
- [ ] Enable rate limiting
- [ ] Set up monitoring and alerts
- [ ] Configure log aggregation
- [ ] Set up automated backups
- [ ] Configure reverse proxy (Nginx)
- [ ] Enable compression
- [ ] Set up CI/CD pipeline

### Docker Deployment

**Dockerfile:**
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGO_URI=mongodb://mongo:27017
      - REDIS_HOST=redis
    depends_on:
      - mongo
      - redis

  worker:
    build: .
    command: node dist/consumer/index.js
    environment:
      - NODE_ENV=production
      - REDIS_HOST=redis
    depends_on:
      - redis

  mongo:
    image: mongo:8
    volumes:
      - mongo_data:/data/db

  redis:
    image: redis:7
    volumes:
      - redis_data:/data

volumes:
  mongo_data:
  redis_data:
```

**Build and run:**
```bash
docker-compose up -d
```

### PM2 Deployment

**ecosystem.config.js:**
```javascript
module.exports = {
  apps: [
    {
      name: 'nexus-api',
      script: './dist/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
    },
    {
      name: 'nexus-worker',
      script: './dist/consumer/index.js',
      instances: 2,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
```

**Deploy:**
```bash
npm run build
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Environment-Specific Configs

**Production (`config/env.ts`):**
```typescript
export const config = {
  // ... existing config
  COOKIE_OPTIONS: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
};
```

**CORS (`app.ts`):**
```typescript
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));
```

---

## 📋 Best Practices

### Code Organization

1. **Feature-based structure**: Group by feature, not by file type
2. **Single Responsibility**: Each module/function does one thing well
3. **DRY (Don't Repeat Yourself)**: Extract common logic
4. **Separation of Concerns**: Controllers handle HTTP, services handle business logic

### TypeScript

1. **Use explicit types**: Avoid `any`
2. **Define interfaces**: For all data structures
3. **Type guards**: For runtime type checking
4. **Generics**: For reusable type-safe code

```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
}

function getUser(id: string): Promise<User> {
  // ...
}

// ❌ Bad
function getUser(id: any): Promise<any> {
  // ...
}
```

### Async/Await

1. **Always use async/await**: Instead of callbacks or raw promises
2. **Wrap with asyncHandler**: For route handlers
3. **Handle errors properly**: Use try-catch for specific handling

```typescript
// ✅ Good
const getUser = asyncHandler(async (req, res) => {
  const user = await UserService.getById(req.params.id);
  res.json(user);
});

// ❌ Bad
const getUser = (req, res) => {
  UserService.getById(req.params.id)
    .then(user => res.json(user))
    .catch(err => res.status(500).json(err));
};
```

### Database

1. **Use indexes**: For frequently queried fields
2. **Avoid N+1 queries**: Use `populate()` wisely
3. **Validate at schema level**: Define constraints in schema
4. **Use transactions**: For multi-document operations

```typescript
// ✅ Good - Single query with populate
const users = await UserModel.find().populate('role');

// ❌ Bad - N+1 queries
const users = await UserModel.find();
for (const user of users) {
  user.role = await RoleModel.findById(user.role);
}
```

### Security

1. **Never trust user input**: Always validate
2. **Hash passwords**: Use bcrypt with high salt rounds
3. **Use HTTPS**: In production
4. **Sanitize data**: Prevent injection attacks
5. **Rate limiting**: Prevent abuse
6. **CORS**: Configure properly
7. **Helmet**: Use security headers
8. **Dependencies**: Keep updated

```typescript
// ✅ Good
const hashedPassword = await bcrypt.hash(password, 10);

// ❌ Bad
const user = await UserModel.create({ password: plainPassword });
```

### Error Messages

1. **User-friendly**: Clear and actionable
2. **Don't leak info**: No stack traces in production
3. **Use i18n**: For multi-language support
4. **Consistent format**: Use ApiError class

```typescript
// ✅ Good
throw new ApiError(400, 'Email is already registered');

// ❌ Bad
throw new Error('E11000 duplicate key error collection: nexus_db.users index: email_1');
```

### Performance

1. **Connection pooling**: Reuse database connections
2. **Caching**: Use Redis for frequently accessed data
3. **Pagination**: For large datasets
4. **Indexes**: On frequently queried fields
5. **Compression**: Use gzip for responses
6. **Lazy loading**: Load data when needed

```typescript
// ✅ Good - Paginated query
const users = await UserModel.find()
  .limit(limit)
  .skip(skip)
  .select('-password');

// ❌ Bad - Load everything
const users = await UserModel.find();
```

### Git Workflow

1. **Branch naming**: `feature/feature-name`, `fix/bug-name`
2. **Commit messages**: Clear and descriptive
3. **Pull requests**: Code review before merging
4. **Never commit**: `.env`, `node_modules`, logs

```bash
# Good commit messages
git commit -m "feat: add OTP authentication"
git commit -m "fix: resolve JWT expiry issue"
git commit -m "refactor: extract email service"
```

### Documentation

1. **Document complex logic**: Use comments
2. **API documentation**: Keep updated
3. **README**: Keep comprehensive and current
4. **Changelog**: Track major changes
5. **JSDoc**: For public APIs

```typescript
/**
 * Sends an OTP to the user's email
 * @param email - User's email address
 * @returns Promise that resolves when OTP is queued
 * @throws ApiError if email is invalid or user not found
 */
async function sendOTP(email: string): Promise<void> {
  // Implementation
}
```

---

## 🤝 Contributing

### Getting Started

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Ensure all tests pass
6. Submit a pull request

### Code Review Checklist

- [ ] Code follows project structure
- [ ] TypeScript types are properly defined
- [ ] Error handling is implemented
- [ ] Validation is added for inputs
- [ ] Tests are written/updated
- [ ] Documentation is updated
- [ ] No console.log statements (use logger)
- [ ] No commented-out code
- [ ] Environment variables documented

---

## 📞 Support

For questions or issues:
- Open an issue on GitHub
- Contact: Fahad Khan (author)

---

## 📄 License

ISC License

---

## 🔄 Changelog

### v1.0.0 (Current)
- Initial release
- JWT authentication
- OTP-based login
- LinkedIn OAuth
- Role-based authorization
- BullMQ job queue
- Comprehensive logging
- Error handling

---

## 🎯 Roadmap

### Upcoming Features
- [ ] Email verification
- [ ] Password reset flow
- [ ] Two-factor authentication (2FA)
- [ ] API rate limiting
- [ ] Admin dashboard
- [ ] API documentation (Swagger)
- [ ] Comprehensive test suite
- [ ] CI/CD pipeline
- [ ] Docker optimization
- [ ] Performance monitoring
- [ ] Audit logging
- [ ] File upload service
- [ ] WebSocket support
- [ ] GraphQL API

---

**Built with ❤️ by Fahad Khan**

