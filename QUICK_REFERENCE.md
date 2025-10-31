# Quick Reference Guide - Nexus Backend

A cheat sheet for common tasks and patterns.

---

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Development mode (API server)
npm run dev

# Development mode (Worker process)
npm run dev:worker

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Lint code
npm run lint
```

---

## 📁 Project Structure Quick Reference

```
src/
├── @types/          # TypeScript type definitions
├── config/          # Configuration files
├── middlewares/     # Express middlewares
├── models/          # Mongoose models
├── modules/         # Feature modules (auth, user, etc.)
│   └── feature/
│       ├── *.controller.ts   # HTTP handlers
│       ├── *.service.ts      # Business logic
│       ├── *.route.ts        # Route definitions
│       └── *.validator.ts    # Zod schemas
├── queues/          # BullMQ queue definitions
├── consumer/        # Queue workers
├── services/        # Shared business services
├── lib/             # Utility libraries
├── utils/           # Helper utilities
├── routes/          # Route aggregation
├── app.ts           # Express app setup
└── server.ts        # Server entry point
```

---

## 🔧 Creating New Features

### 1. Create Module Structure

```bash
mkdir -p src/modules/feature-name
cd src/modules/feature-name
touch feature-name.controller.ts
touch feature-name.service.ts
touch feature-name.route.ts
touch feature-name.validator.ts
```

### 2. Define Validator (Zod Schema)

```typescript
// feature-name.validator.ts
import { z } from 'zod';

export const createFeatureSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
});

export type CreateFeatureInput = z.infer<typeof createFeatureSchema>;
```

### 3. Create Service

```typescript
// feature-name.service.ts
import { ApiError, ApiResponse } from 'utils';
import { FeatureModel } from 'models';
import { CreateFeatureInput } from './feature-name.validator';

export const FeatureService = {
  create: async (data: CreateFeatureInput) => {
    const feature = await FeatureModel.create(data);
    return new ApiResponse(201, 'Feature created', feature);
  },

  getAll: async () => {
    const features = await FeatureModel.find();
    return new ApiResponse(200, 'Features retrieved', features);
  },

  getById: async (id: string) => {
    const feature = await FeatureModel.findById(id);
    if (!feature) {
      throw new ApiError(404, 'Feature not found');
    }
    return new ApiResponse(200, 'Feature found', feature);
  },
};
```

### 4. Create Controller

```typescript
// feature-name.controller.ts
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

  getById: asyncHandler(async (req, res) => {
    const response = await FeatureService.getById(req.params.id);
    return res.status(response.status).json(response);
  }),
};
```

### 5. Create Routes

```typescript
// feature-name.route.ts
import { Router } from 'express';
import { FeatureController } from './feature-name.controller';
import { validate } from 'utils/zodValidator';
import { createFeatureSchema } from './feature-name.validator';
import { verifyJWT } from 'middlewares/auth.middleware';

const router = Router();

router.post(
  '/',
  verifyJWT,
  validate(createFeatureSchema),
  FeatureController.create
);

router.get('/', FeatureController.getAll);
router.get('/:id', FeatureController.getById);

export default router;
```

### 6. Register Routes

```typescript
// src/routes/index.ts
import featureRoutes from '../modules/feature-name/feature-name.route';

router.use('/features', featureRoutes);
```

---

## 🗃️ Database Patterns

### Create Model

```typescript
// src/models/feature.model.ts
import mongoose from 'mongoose';
import { IFeature, FeatureDocument, FeatureModelType } from '@types/models/feature.types';

const featureSchema = new mongoose.Schema<IFeature>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      unique: true,
      index: true,
    },
    description: String,
    isActive: {
      type: Boolean,
      default: true,
    },
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
featureSchema.methods.activate = async function() {
  this.isActive = true;
  return await this.save();
};

export const FeatureModel = mongoose.model<IFeature, FeatureModelType>(
  'Feature',
  featureSchema
);
```

### Common Queries

```typescript
// Find all
const items = await Model.find();

// Find with filter
const items = await Model.find({ status: 'active' });

// Find one
const item = await Model.findOne({ email: 'user@example.com' });

// Find by ID
const item = await Model.findById(id);

// Create
const item = await Model.create({ name: 'Test' });

// Update
const item = await Model.findByIdAndUpdate(
  id,
  { name: 'Updated' },
  { new: true } // Return updated document
);

// Delete
await Model.findByIdAndDelete(id);

// Count
const count = await Model.countDocuments({ status: 'active' });

// Populate
const item = await Model.findById(id).populate('userId');

// Select fields
const items = await Model.find().select('name email -_id');

// Lean (plain JS object, faster)
const items = await Model.find().lean();

// Pagination
const items = await Model.find()
  .skip((page - 1) * limit)
  .limit(limit)
  .sort({ createdAt: -1 });
```

---

## 🔄 Queue Patterns

### Create Queue

```typescript
// src/queues/email-queue.ts
import { Queue } from 'bullmq';
import { getRedisConnection } from './connection';

export interface EmailJobData {
  to: string;
  subject: string;
  body: string;
}

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

### Create Worker

```typescript
// src/consumer/email-worker.ts
import { Worker, Job } from 'bullmq';
import { getRedisConnection } from '../queues/connection';
import { EmailJobData } from '../queues/email-queue';
import logger from '../config/logger';

export const emailWorker = new Worker<EmailJobData>(
  'email',
  async (job: Job<EmailJobData>) => {
    logger.info(`Processing email job ${job.id}`);
    // Send email logic
    await sendEmail(job.data);
    logger.info(`Email sent to ${job.data.to}`);
  },
  {
    connection: getRedisConnection(),
    concurrency: 5,
  }
);

emailWorker.on('completed', (job) => {
  logger.info(`Job ${job.id} completed`);
});

emailWorker.on('failed', (job, err) => {
  logger.error(`Job ${job?.id} failed:`, err);
});
```

### Add Job

```typescript
import { addEmailJob } from 'queues/email-queue';

await addEmailJob({
  to: 'user@example.com',
  subject: 'Welcome',
  body: 'Welcome to our app!',
});
```

---

## 🔒 Authentication Patterns

### Protect Routes

```typescript
import { verifyJWT } from 'middlewares/auth.middleware';

// Single protected route
router.get('/protected', verifyJWT, controller.handler);

// Protect all routes in router
router.use(verifyJWT);
router.get('/route1', controller.handler1);
router.get('/route2', controller.handler2);
```

### Access User in Controller

```typescript
export const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id; // User attached by verifyJWT
  const profile = await UserService.getProfile(userId);
  res.json(profile);
});
```

### Generate Tokens

```typescript
const user = await UserModel.findById(userId);
const accessToken = await user.generateAccessToken();
const refreshToken = await user.generateRefreshToken();
```

---

## ⚠️ Error Handling

### Throw Errors

```typescript
import { ApiError } from 'utils';

// Simple error
throw new ApiError(404, 'User not found');

// With validation errors
throw new ApiError(400, 'Validation failed', [
  { field: 'email', message: 'Invalid email' }
]);
```

### Async Handler

```typescript
import { asyncHandler } from 'utils';

// Wraps async functions to catch errors
export const handler = asyncHandler(async (req, res) => {
  // No try-catch needed
  const data = await someAsyncOperation();
  res.json(data);
});
```

---

## 📝 Logging

```typescript
import logger from 'config/logger';

// Info
logger.info('User logged in', { userId: user._id });

// Error
logger.error('Database error', { error: err.message });

// Warning
logger.warn('High memory usage', { usage: memoryUsage });

// Debug (development only)
logger.debug('Request payload', { body: req.body });
```

---

## ✅ Validation

### Define Schema

```typescript
import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().min(3).max(100),
  email: z.string().email(),
  age: z.number().int().positive().optional(),
});
```

### Use in Routes

```typescript
import { validate } from 'utils/zodValidator';

router.post('/users', validate(userSchema), controller.create);
```

---

## 🧪 Testing

### Unit Test

```typescript
import { UserService } from '../user.service';
import { UserModel } from 'models';

jest.mock('models');

describe('UserService', () => {
  it('should get user by id', async () => {
    const mockUser = { _id: '123', name: 'John' };
    (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);

    const result = await UserService.getById('123');

    expect(result.data).toEqual(mockUser);
  });
});
```

### Integration Test

```typescript
import request from 'supertest';
import app from '../../../app';

describe('POST /api/users', () => {
  it('should create a user', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ name: 'John', email: 'john@example.com' });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
```

---

## 🔐 Environment Variables

```env
# Required
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017
DB_NAME=nexus_db
ACCESS_TOKEN_SECRET=your_secret
REFRESH_TOKEN_SECRET=your_secret

# Optional
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

---

## 🐛 Common Issues

### Port Already in Use

```bash
# Find process using port
lsof -i :5000

# Kill process
kill -9 <PID>
```

### MongoDB Connection Error

```bash
# Check MongoDB is running
mongosh

# Start MongoDB
mongod --dbpath /path/to/data
```

### Redis Connection Error

```bash
# Check Redis is running
redis-cli ping

# Start Redis
redis-server
```

### Module Not Found

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Useful Commands

### Database

```bash
# Connect to MongoDB
mongosh "mongodb://localhost:27017/nexus_db"

# Show collections
show collections

# Query users
db.users.find()

# Drop database (CAREFUL!)
db.dropDatabase()
```

### Redis

```bash
# Connect to Redis
redis-cli

# View all keys
KEYS *

# Get value
GET key_name

# Delete key
DEL key_name

# Flush all (CAREFUL!)
FLUSHALL
```

### Git

```bash
# Create branch
git checkout -b feature/feature-name

# Commit
git add .
git commit -m "feat: add feature"

# Push
git push origin feature/feature-name

# Update from main
git checkout main
git pull
git checkout feature/feature-name
git rebase main
```

---

## 🎯 Response Formats

### Success

```json
{
  "statusCode": 200,
  "message": "Success message",
  "success": true,
  "data": { }
}
```

### Error

```json
{
  "statusCode": 400,
  "message": "Error message",
  "success": false,
  "errors": [
    {
      "field": "email",
      "message": "Invalid email"
    }
  ]
}
```

---

## 📚 Additional Resources

- **Main Documentation**: [README.md](README.md)
- **Developer Guide**: [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)
- **API Documentation**: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- **Contributing**: [CONTRIBUTING.md](CONTRIBUTING.md)
- **Security**: [SECURITY.md](SECURITY.md)

---

## 💡 Tips

1. **Always use asyncHandler** for async route handlers
2. **Validate all inputs** with Zod schemas
3. **Never commit .env** files
4. **Use logger** instead of console.log
5. **Keep controllers thin** - business logic in services
6. **Write tests** for new features
7. **Follow naming conventions** consistently
8. **Document complex logic** with comments
9. **Run linter** before committing
10. **Update documentation** when adding features

---

**Quick Reference Guide v1.0.0**

