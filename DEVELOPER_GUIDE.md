# Developer Guide - Nexus Backend

This guide provides in-depth implementation patterns, advanced techniques, and best practices for developing and maintaining the Nexus Backend application.

---

## Table of Contents

1. [Architecture Deep Dive](#architecture-deep-dive)
2. [Advanced TypeScript Patterns](#advanced-typescript-patterns)
3. [Database Design Patterns](#database-design-patterns)
4. [Advanced Queue Patterns](#advanced-queue-patterns)
5. [Security Best Practices](#security-best-practices)
6. [Performance Optimization](#performance-optimization)
7. [Monitoring & Observability](#monitoring--observability)
8. [Advanced Error Handling](#advanced-error-handling)
9. [Testing Strategies](#testing-strategies)
10. [Code Quality](#code-quality)
11. [Common Patterns](#common-patterns)
12. [Troubleshooting](#troubleshooting)

---

## Architecture Deep Dive

### Layered Architecture

The application follows a **4-layer architecture**:

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │  Controllers
│  (HTTP Request/Response Handling)       │  Route Handlers
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Business Logic Layer            │  Services
│  (Core Business Rules & Operations)     │  Business Logic
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Data Access Layer               │  Models
│  (Database Operations)                  │  Mongoose Schemas
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Infrastructure Layer            │  Database
│  (External Systems & Storage)           │  Redis, Email, etc.
└─────────────────────────────────────────┘
```

**Benefits:**
- Clear separation of concerns
- Easy to test each layer independently
- Changes in one layer don't affect others
- Scalable and maintainable

### Dependency Flow

**Rule:** Dependencies should flow downward only

```
Controllers → Services → Models → Database
     ↓           ↓          ↓
  Never ←    Never ←    Never ←
```

**Example:**

```typescript
// ✅ Good - Controller depends on Service
export const UserController = {
  getUser: asyncHandler(async (req, res) => {
    const user = await UserService.getById(req.params.id);
    res.json(user);
  }),
};

// ❌ Bad - Service depends on Controller
export const UserService = {
  getById: async (id: string, res: Response) => {
    // Service shouldn't know about HTTP response
  },
};
```

### Module Boundaries

Each module should be:
- **Self-contained**: All related code in one directory
- **Loosely coupled**: Minimal dependencies on other modules
- **Highly cohesive**: All code serves the same purpose

```typescript
// ✅ Good - Use services to communicate between modules
// In user.service.ts
import { RoleService } from '../role/role.service';

export const UserService = {
  assignRole: async (userId: string, roleId: string) => {
    const role = await RoleService.getById(roleId);
    // ...
  },
};

// ❌ Bad - Direct model access across modules
// In user.service.ts
import { RoleModel } from '../role/role.model';

export const UserService = {
  assignRole: async (userId: string, roleId: string) => {
    const role = await RoleModel.findById(roleId); // Breaks encapsulation
  },
};
```

---

## Advanced TypeScript Patterns

### Type-Safe Request Handlers

Define types for request parameters, body, and query:

```typescript
import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

// Define parameter types
interface GetUserParams extends ParamsDictionary {
  id: string;
}

// Define body types
interface UpdateUserBody {
  name?: string;
  age?: number;
}

// Define query types
interface GetUsersQuery {
  page?: string;
  limit?: string;
  search?: string;
}

// Type-safe controller
export const UserController = {
  getUser: asyncHandler(
    async (req: Request<GetUserParams>, res: Response) => {
      const userId = req.params.id; // Type-safe!
      // ...
    }
  ),

  updateUser: asyncHandler(
    async (req: Request<GetUserParams, any, UpdateUserBody>, res: Response) => {
      const userId = req.params.id;
      const updates = req.body; // Type-safe!
      // ...
    }
  ),

  getUsers: asyncHandler(
    async (req: Request<{}, any, any, GetUsersQuery>, res: Response) => {
      const page = parseInt(req.query.page || '1'); // Type-safe!
      // ...
    }
  ),
};
```

### Generic Response Type

Create type-safe API responses:

```typescript
// In utils/ApiResponse.ts
export class ApiResponse<T> {
  statusCode: number;
  message: string;
  success: boolean;
  data?: T;

  constructor(statusCode: number, message: string, data?: T) {
    this.statusCode = statusCode;
    this.message = message;
    this.success = statusCode < 400;
    this.data = data;
  }
}

// Usage in service
export const UserService = {
  getById: async (id: string): Promise<ApiResponse<IUser>> => {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return new ApiResponse(200, 'User found', user);
  },

  getAll: async (): Promise<ApiResponse<IUser[]>> => {
    const users = await UserModel.find();
    return new ApiResponse(200, 'Users retrieved', users);
  },
};
```

### Discriminated Unions

Use for type-safe state management:

```typescript
// Define job statuses
type JobStatus =
  | { status: 'pending'; queuedAt: Date }
  | { status: 'processing'; startedAt: Date }
  | { status: 'completed'; completedAt: Date; result: any }
  | { status: 'failed'; failedAt: Date; error: string };

// Type-safe handler
function handleJobStatus(job: JobStatus) {
  switch (job.status) {
    case 'pending':
      console.log(`Job queued at ${job.queuedAt}`);
      break;
    case 'processing':
      console.log(`Job started at ${job.startedAt}`);
      break;
    case 'completed':
      console.log(`Job completed with result: ${job.result}`);
      break;
    case 'failed':
      console.log(`Job failed: ${job.error}`);
      break;
  }
}
```

### Utility Types

Leverage TypeScript's utility types:

```typescript
// Pick specific properties
type UserProfile = Pick<IUser, 'name' | 'email' | 'profileImage'>;

// Omit sensitive properties
type SafeUser = Omit<IUser, 'password' | 'refreshToken'>;

// Make all properties optional
type PartialUser = Partial<IUser>;

// Make all properties required
type RequiredUser = Required<IUser>;

// Example usage
export const UserService = {
  getProfile: async (id: string): Promise<ApiResponse<UserProfile>> => {
    const user = await UserModel.findById(id).select('name email profileImage');
    return new ApiResponse(200, 'Profile retrieved', user as UserProfile);
  },

  updatePartial: async (id: string, updates: PartialUser) => {
    const user = await UserModel.findByIdAndUpdate(id, updates, { new: true });
    return new ApiResponse(200, 'User updated', user);
  },
};
```

### Branded Types

Create unique types for IDs:

```typescript
// Define branded types
type UserId = string & { readonly __brand: 'UserId' };
type RoleId = string & { readonly __brand: 'RoleId' };

// Type guard functions
function isUserId(id: string): id is UserId {
  return /^[0-9a-fA-F]{24}$/.test(id); // MongoDB ObjectId format
}

function toUserId(id: string): UserId {
  if (!isUserId(id)) {
    throw new Error('Invalid UserId');
  }
  return id as UserId;
}

// Usage
export const UserService = {
  getById: async (id: UserId): Promise<ApiResponse<IUser>> => {
    // id is guaranteed to be a valid UserId
    const user = await UserModel.findById(id);
    // ...
  },
};

// In controller
const userId = toUserId(req.params.id); // Validates and converts
const user = await UserService.getById(userId);
```

---

## Database Design Patterns

### Query Optimization

**1. Select only needed fields:**

```typescript
// ❌ Bad - Fetches all fields
const users = await UserModel.find();

// ✅ Good - Select specific fields
const users = await UserModel.find().select('name email role');

// ✅ Better - Exclude sensitive fields
const users = await UserModel.find().select('-password -refreshToken');
```

**2. Use lean() for read-only data:**

```typescript
// ❌ Bad - Returns full Mongoose document
const users = await UserModel.find();

// ✅ Good - Returns plain JavaScript object (faster)
const users = await UserModel.find().lean();
```

**3. Index frequently queried fields:**

```typescript
// In model definition
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    index: true, // ✅ Single field index
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    index: true,
  },
  status: String,
  createdAt: Date,
});

// ✅ Compound index for common queries
userSchema.index({ status: 1, createdAt: -1 });

// ✅ Text index for search
userSchema.index({ name: 'text', email: 'text' });
```

**4. Optimize populate:**

```typescript
// ❌ Bad - Fetches all role fields
const users = await UserModel.find().populate('role');

// ✅ Good - Select specific role fields
const users = await UserModel.find().populate('role', 'name permissions');

// ✅ Better - Nested populate
const users = await UserModel.find().populate({
  path: 'role',
  select: 'name permissions',
  populate: {
    path: 'permissions',
    select: 'resource action',
  },
});
```

### Pagination Pattern

```typescript
interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface PaginatedResult<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export async function paginate<T>(
  model: Model<T>,
  filter: any,
  options: PaginationOptions
): Promise<PaginatedResult<T>> {
  const { page, limit, sortBy = 'createdAt', sortOrder = 'desc' } = options;

  const skip = (page - 1) * limit;
  const sortOptions = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [data, totalItems] = await Promise.all([
    model.find(filter).sort(sortOptions).skip(skip).limit(limit).lean(),
    model.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return {
    data: data as T[],
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

// Usage
const result = await paginate(UserModel, { status: 'active' }, {
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc',
});
```

### Transaction Pattern

Use transactions for multi-document operations:

```typescript
import mongoose from 'mongoose';

export const transferUserRole = async (
  userId: string,
  oldRoleId: string,
  newRoleId: string
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Update user's role
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $pull: { role: oldRoleId }, $push: { role: newRoleId } },
      { session, new: true }
    );

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Log the change
    await AuditModel.create(
      [
        {
          userId,
          action: 'role_transfer',
          oldRole: oldRoleId,
          newRole: newRoleId,
          timestamp: new Date(),
        },
      ],
      { session }
    );

    // Commit transaction
    await session.commitTransaction();
    return new ApiResponse(200, 'Role transferred successfully', user);
  } catch (error) {
    // Rollback on error
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
```

### Soft Delete Pattern

Implement soft deletes instead of hard deletes:

```typescript
// Add to schema
const userSchema = new mongoose.Schema({
  // ... other fields
  isDeleted: {
    type: Boolean,
    default: false,
    index: true,
  },
  deletedAt: Date,
});

// Override find methods
userSchema.pre(/^find/, function (next) {
  // Only return non-deleted documents
  this.where({ isDeleted: { $ne: true } });
  next();
});

// Soft delete method
userSchema.methods.softDelete = async function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return await this.save();
};

// Restore method
userSchema.methods.restore = async function () {
  this.isDeleted = false;
  this.deletedAt = undefined;
  return await this.save();
};

// Usage
export const UserService = {
  delete: async (id: string) => {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    await user.softDelete();
    return new ApiResponse(200, 'User deleted successfully');
  },

  restore: async (id: string) => {
    const user = await UserModel.findOne({ _id: id, isDeleted: true });
    if (!user) {
      throw new ApiError(404, 'Deleted user not found');
    }
    await user.restore();
    return new ApiResponse(200, 'User restored successfully');
  },
};
```

### Aggregation Pipeline Pattern

Complex queries with aggregation:

```typescript
export const UserService = {
  getUserStatsByRole: async () => {
    const stats = await UserModel.aggregate([
      // Stage 1: Match active users
      {
        $match: {
          isDeleted: false,
        },
      },
      // Stage 2: Lookup role information
      {
        $lookup: {
          from: 'roles',
          localField: 'role',
          foreignField: '_id',
          as: 'roleInfo',
        },
      },
      // Stage 3: Unwind role array
      {
        $unwind: '$roleInfo',
      },
      // Stage 4: Group by role
      {
        $group: {
          _id: '$roleInfo.name',
          count: { $sum: 1 },
          avgAge: { $avg: '$age' },
          users: {
            $push: {
              name: '$name',
              email: '$email',
            },
          },
        },
      },
      // Stage 5: Sort by count
      {
        $sort: { count: -1 },
      },
      // Stage 6: Format output
      {
        $project: {
          _id: 0,
          role: '$_id',
          totalUsers: '$count',
          averageAge: { $round: ['$avgAge', 2] },
          users: 1,
        },
      },
    ]);

    return new ApiResponse(200, 'User statistics retrieved', stats);
  },
};
```

---

## Advanced Queue Patterns

### Job Priority

Implement priority queues:

```typescript
// Define priority levels
enum JobPriority {
  LOW = 1,
  NORMAL = 3,
  HIGH = 5,
  CRITICAL = 10,
}

// Add job with priority
export const addEmailJob = async (
  data: EmailJobData,
  priority: JobPriority = JobPriority.NORMAL
) => {
  await emailQueue.add('send-email', data, {
    priority,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  });
};

// Usage
await addEmailJob(
  { to: 'user@example.com', subject: 'Welcome', body: '...' },
  JobPriority.HIGH
);
```

### Job Scheduling

Schedule jobs for future execution:

```typescript
// Schedule job for specific time
export const scheduleEmailJob = async (
  data: EmailJobData,
  sendAt: Date
) => {
  const delay = sendAt.getTime() - Date.now();

  if (delay < 0) {
    throw new ApiError(400, 'Cannot schedule job in the past');
  }

  await emailQueue.add('send-email', data, {
    delay,
    attempts: 3,
  });
};

// Schedule recurring job
export const scheduleRecurringReport = async () => {
  await reportQueue.add(
    'weekly-report',
    { type: 'weekly' },
    {
      repeat: {
        pattern: '0 9 * * 1', // Every Monday at 9 AM (cron syntax)
      },
    }
  );
};

// Usage
await scheduleEmailJob(
  { to: 'user@example.com', subject: 'Reminder', body: '...' },
  new Date('2025-11-01T10:00:00Z')
);
```

### Job Progress Tracking

Track long-running job progress:

```typescript
// In worker
export const dataProcessingWorker = new Worker<DataProcessingJobData>(
  'data-processing',
  async (job) => {
    const { items } = job.data;
    const total = items.length;

    for (let i = 0; i < total; i++) {
      // Process item
      await processItem(items[i]);

      // Update progress
      const progress = Math.round(((i + 1) / total) * 100);
      await job.updateProgress(progress);

      logger.info(`Job ${job.id} progress: ${progress}%`);
    }

    return { processed: total };
  },
  {
    connection: getRedisConnection(),
  }
);

// Monitor progress
export const getJobProgress = async (jobId: string) => {
  const job = await dataProcessingQueue.getJob(jobId);

  if (!job) {
    throw new ApiError(404, 'Job not found');
  }

  const state = await job.getState();
  const progress = job.progress;

  return {
    id: job.id,
    state,
    progress,
    data: job.data,
  };
};
```

### Job Retry Strategies

Implement custom retry logic:

```typescript
export const emailQueue = new Queue<EmailJobData>('email', {
  connection: getRedisConnection(),
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'custom',
    },
  },
});

// Custom backoff strategy
emailQueue.on('failed', async (job, err) => {
  if (!job) return;

  const attemptCount = job.attemptsMade;

  // Exponential backoff: 1min, 5min, 15min, 1hr, 6hr
  const delays = [60000, 300000, 900000, 3600000, 21600000];
  const delay = delays[attemptCount - 1] || delays[delays.length - 1];

  logger.warn(
    `Job ${job.id} failed (attempt ${attemptCount}). Retrying in ${delay}ms`
  );

  if (attemptCount < 5) {
    await job.retry({ delay });
  } else {
    logger.error(`Job ${job.id} permanently failed after ${attemptCount} attempts`);
    // Send alert, log to monitoring system, etc.
  }
});
```

### Dead Letter Queue

Handle permanently failed jobs:

```typescript
// Create dead letter queue
export const deadLetterQueue = new Queue('dead-letter', {
  connection: getRedisConnection(),
});

// Move failed jobs to DLQ
emailWorker.on('failed', async (job, err) => {
  if (!job) return;

  const maxAttempts = job.opts.attempts || 3;

  if (job.attemptsMade >= maxAttempts) {
    logger.error(`Moving job ${job.id} to dead letter queue`);

    await deadLetterQueue.add('failed-email', {
      originalJob: {
        id: job.id,
        name: job.name,
        data: job.data,
        attemptsMade: job.attemptsMade,
      },
      error: {
        message: err.message,
        stack: err.stack,
      },
      failedAt: new Date(),
    });

    // Optionally, send alert
    await alertService.send({
      type: 'job_permanently_failed',
      jobId: job.id,
      error: err.message,
    });
  }
});

// Process DLQ jobs manually
export const retryDeadLetterJob = async (jobId: string) => {
  const job = await deadLetterQueue.getJob(jobId);

  if (!job) {
    throw new ApiError(404, 'Dead letter job not found');
  }

  const originalData = job.data.originalJob.data;

  // Re-queue with original data
  await emailQueue.add('send-email', originalData, {
    priority: JobPriority.HIGH,
  });

  // Remove from DLQ
  await job.remove();

  return new ApiResponse(200, 'Job requeued successfully');
};
```

---

## Security Best Practices

### Input Sanitization

Prevent injection attacks:

```typescript
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';

// In app.ts
app.use(helmet()); // Security headers
app.use(mongoSanitize()); // Prevent NoSQL injection

// Custom sanitization
export function sanitizeInput<T>(input: T): T {
  if (typeof input === 'string') {
    // Remove HTML tags
    return input.replace(/<[^>]*>/g, '') as any;
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeInput) as any;
  }

  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }

  return input;
}

// Usage in validator
export const createUserSchema = z.object({
  name: z.string().transform(sanitizeInput),
  email: z.string().email().transform(sanitizeInput),
});
```

### Rate Limiting

Implement rate limiting:

```typescript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { getRedisConnection } from './queues/connection';

// General rate limit
export const generalLimiter = rateLimit({
  store: new RedisStore({
    client: getRedisConnection(),
    prefix: 'rl:general:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limit for auth endpoints
export const authLimiter = rateLimit({
  store: new RedisStore({
    client: getRedisConnection(),
    prefix: 'rl:auth:',
  }),
  windowMs: 15 * 60 * 1000,
  max: 5, // Only 5 login attempts per 15 minutes
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Apply in app.ts
app.use('/api', generalLimiter);
app.use('/api/auth', authLimiter);
```

### CSRF Protection

Implement CSRF tokens:

```typescript
import csrf from 'csurf';
import cookieParser from 'cookie-parser';

// CSRF middleware
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  },
});

// Apply to state-changing routes
app.post('/api/users', csrfProtection, UserController.create);
app.put('/api/users/:id', csrfProtection, UserController.update);
app.delete('/api/users/:id', csrfProtection, UserController.delete);

// Endpoint to get CSRF token
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});
```

### Password Security

Implement strong password requirements:

```typescript
import zxcvbn from 'zxcvbn';

// Password strength validator
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .refine((password) => {
    // Check password strength
    const result = zxcvbn(password);
    return result.score >= 3; // Score 0-4, require at least 3
  }, 'Password is too weak. Use a mix of letters, numbers, and symbols.')
  .refine((password) => {
    // Require at least one uppercase, lowercase, number, and special char
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return hasUppercase && hasLowercase && hasNumber && hasSpecial;
  }, 'Password must contain uppercase, lowercase, number, and special character.');

// Password history (prevent reuse)
const passwordHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  hashedPassword: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 7776000, // Auto-delete after 90 days
  },
});

export const PasswordHistoryModel = mongoose.model(
  'PasswordHistory',
  passwordHistorySchema
);

// Check password history
export const checkPasswordHistory = async (
  userId: string,
  newPassword: string,
  historyCount: number = 5
) => {
  const history = await PasswordHistoryModel.find({ userId })
    .sort({ createdAt: -1 })
    .limit(historyCount);

  for (const record of history) {
    const isReused = await bcrypt.compare(newPassword, record.hashedPassword);
    if (isReused) {
      throw new ApiError(
        400,
        `Password cannot be one of your last ${historyCount} passwords`
      );
    }
  }
};
```

### API Key Management

Implement API key authentication:

```typescript
// API Key model
const apiKeySchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  name: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  permissions: [String],
  lastUsedAt: Date,
  expiresAt: Date,
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const ApiKeyModel = mongoose.model('ApiKey', apiKeySchema);

// Generate API key
export const generateApiKey = async (
  userId: string,
  name: string,
  expiresInDays: number = 365
) => {
  const key = `sk_${crypto.randomBytes(32).toString('hex')}`;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  const apiKey = await ApiKeyModel.create({
    key,
    name,
    userId,
    expiresAt,
  });

  return { key, expiresAt };
};

// API key middleware
export const verifyApiKey = asyncHandler(async (req, res, next) => {
  const apiKey = req.header('X-API-Key');

  if (!apiKey) {
    throw new ApiError(401, 'API key required');
  }

  const keyRecord = await ApiKeyModel.findOne({
    key: apiKey,
    isActive: true,
  }).populate('userId');

  if (!keyRecord) {
    throw new ApiError(401, 'Invalid API key');
  }

  if (keyRecord.expiresAt && keyRecord.expiresAt < new Date()) {
    throw new ApiError(401, 'API key expired');
  }

  // Update last used
  keyRecord.lastUsedAt = new Date();
  await keyRecord.save();

  req.user = keyRecord.userId as any;
  next();
});
```

---

## Performance Optimization

### Caching Strategy

Implement Redis caching:

```typescript
import { getRedisConnection } from './queues/connection';

// Cache helper
export class CacheService {
  private redis = getRedisConnection();
  private defaultTTL = 3600; // 1 hour

  async get<T>(key: string): Promise<T | null> {
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async set(key: string, value: any, ttl: number = this.defaultTTL): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async delPattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}

export const cacheService = new CacheService();

// Cache decorator
export function Cached(ttl: number = 3600) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `cache:${propertyKey}:${JSON.stringify(args)}`;

      // Try to get from cache
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        logger.debug(`Cache hit: ${cacheKey}`);
        return cached;
      }

      // Execute original method
      const result = await originalMethod.apply(this, args);

      // Store in cache
      await cacheService.set(cacheKey, result, ttl);
      logger.debug(`Cache set: ${cacheKey}`);

      return result;
    };

    return descriptor;
  };
}

// Usage
export const UserService = {
  @Cached(300) // Cache for 5 minutes
  async getById(id: string): Promise<ApiResponse<IUser>> {
    const user = await UserModel.findById(id);
    return new ApiResponse(200, 'User found', user);
  },

  async update(id: string, updates: Partial<IUser>) {
    const user = await UserModel.findByIdAndUpdate(id, updates, { new: true });

    // Invalidate cache
    await cacheService.del(`cache:getById:["${id}"]`);

    return new ApiResponse(200, 'User updated', user);
  },
};
```

### Database Connection Pooling

Optimize MongoDB connections:

```typescript
// In config/index.ts
export const connectDB = async () => {
  const options = {
    maxPoolSize: 10, // Maximum number of connections
    minPoolSize: 5, // Minimum number of connections
    maxIdleTimeMS: 30000, // Close idle connections after 30s
    serverSelectionTimeoutMS: 5000, // Timeout for server selection
    socketTimeoutMS: 45000, // Socket timeout
    family: 4, // Use IPv4
  };

  await mongoose.connect(config.MAIN.mongoUri, options);
  logger.info('✅ MongoDB connected with connection pooling');
};
```

### Query Result Streaming

Stream large datasets:

```typescript
export const exportUsers = asyncHandler(async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename=users.json');

  res.write('[');

  const cursor = UserModel.find().cursor();
  let isFirst = true;

  for await (const user of cursor) {
    if (!isFirst) {
      res.write(',');
    }
    res.write(JSON.stringify(user));
    isFirst = false;
  }

  res.write(']');
  res.end();
});
```

### Compression

Enable response compression:

```typescript
import compression from 'compression';

// In app.ts
app.use(
  compression({
    level: 6, // Compression level (0-9)
    threshold: 1024, // Only compress responses larger than 1KB
    filter: (req, res) => {
      // Don't compress if client doesn't support it
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
  })
);
```

---

## Monitoring & Observability

### Health Checks

Comprehensive health endpoint:

```typescript
export const healthCheck = asyncHandler(async (req, res) => {
  const checks = {
    database: false,
    redis: false,
    queue: false,
  };

  // Check MongoDB
  try {
    await mongoose.connection.db.admin().ping();
    checks.database = true;
  } catch (err) {
    logger.error('Database health check failed:', err);
  }

  // Check Redis
  try {
    await getRedisConnection().ping();
    checks.redis = true;
  } catch (err) {
    logger.error('Redis health check failed:', err);
  }

  // Check Queue
  try {
    const queueHealth = await emailQueue.getJobCounts();
    checks.queue = true;
  } catch (err) {
    logger.error('Queue health check failed:', err);
  }

  const allHealthy = Object.values(checks).every((v) => v === true);
  const statusCode = allHealthy ? 200 : 503;

  res.status(statusCode).json({
    status: allHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    checks,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});
```

### Metrics Collection

Track application metrics:

```typescript
// Simple metrics collector
class MetricsCollector {
  private metrics: Map<string, number> = new Map();

  increment(metric: string, value: number = 1) {
    const current = this.metrics.get(metric) || 0;
    this.metrics.set(metric, current + value);
  }

  gauge(metric: string, value: number) {
    this.metrics.set(metric, value);
  }

  getMetrics() {
    return Object.fromEntries(this.metrics);
  }

  reset() {
    this.metrics.clear();
  }
}

export const metrics = new MetricsCollector();

// Track in middleware
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    metrics.increment(`http_requests_total`);
    metrics.increment(`http_${res.statusCode}_total`);
    metrics.gauge(`http_request_duration_ms`, duration);
  });

  next();
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  res.json(metrics.getMetrics());
});
```

### Request Tracing

Implement request IDs:

```typescript
import { v4 as uuidv4 } from 'uuid';

// Request ID middleware
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = req.headers['x-request-id'] || uuidv4();
  req.headers['x-request-id'] = requestId as string;
  res.setHeader('X-Request-ID', requestId);
  next();
};

// Enhanced logger
export const logWithContext = (level: string, message: string, meta: any = {}) => {
  logger.log(level, message, {
    ...meta,
    requestId: meta.req?.headers['x-request-id'],
    userId: meta.req?.user?._id,
    ip: meta.req?.ip,
  });
};

// Usage
logWithContext('info', 'User login', { req, action: 'login' });
```

---

This developer guide provides comprehensive patterns and practices for building robust, scalable, and maintainable features in the Nexus Backend. Always refer to the main README for setup instructions and basic usage.

**Happy Coding! 🚀**

