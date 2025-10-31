# API Documentation - Nexus Backend

Complete API reference for all available endpoints.

---

## Base Information

- **Base URL**: `http://localhost:5000/api`
- **Content Type**: `application/json`
- **Authentication**: JWT Bearer Token or Cookie-based

---

## Table of Contents

1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [Response Format](#response-format)
4. [Error Codes](#error-codes)
5. [Rate Limits](#rate-limits)

---

## Authentication

### Register User

Create a new user account.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "age": 25
}
```

**Validation Rules:**
- `name`: Required, string, 3-100 characters
- `email`: Required, valid email format, unique
- `password`: Required, minimum 8 characters, must contain uppercase, lowercase, number, and special character
- `age`: Optional, positive integer

**Success Response (201):**
```json
{
  "statusCode": 201,
  "message": "User registered successfully",
  "success": true,
  "data": {
    "_id": "65f1234567890abcdef12345",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "age": 25,
    "role": ["65f0000000000000000"],
    "isVerified": false,
    "lastLoginAt": "2025-10-30T10:00:00.000Z",
    "createdAt": "2025-10-30T10:00:00.000Z",
    "updatedAt": "2025-10-30T10:00:00.000Z"
  }
}
```

**Error Responses:**

400 Bad Request - Invalid input
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

409 Conflict - Email already exists
```json
{
  "statusCode": 409,
  "message": "Email already registered",
  "success": false
}
```

---

### Login with Email & Password

Authenticate user and receive tokens.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "message": "Login successful",
  "success": true,
  "data": {
    "user": {
      "_id": "65f1234567890abcdef12345",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": [
        {
          "_id": "65f0000000000000000",
          "name": "USER"
        }
      ]
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

**Cookies Set:**
- `accessToken`: JWT access token (httpOnly, 15 minutes)
- `refreshToken`: JWT refresh token (httpOnly, 7 days)

**Error Responses:**

401 Unauthorized - Invalid credentials
```json
{
  "statusCode": 401,
  "message": "Invalid email or password",
  "success": false
}
```

429 Too Many Requests - Rate limit exceeded
```json
{
  "statusCode": 429,
  "message": "Too many login attempts, please try again later",
  "success": false
}
```

---

### Login with OTP

Request an OTP to be sent to email.

**Endpoint:** `POST /auth/login/otp`

**Request Body:**
```json
{
  "email": "john.doe@example.com"
}
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "message": "OTP sent to your email",
  "success": true,
  "data": {
    "email": "john.doe@example.com",
    "expiresIn": "5 minutes"
  }
}
```

**Notes:**
- OTP is valid for 5 minutes
- OTP is a 6-digit numeric code
- Email is sent asynchronously via job queue

**Error Responses:**

404 Not Found - User doesn't exist
```json
{
  "statusCode": 404,
  "message": "User not found",
  "success": false
}
```

---

### Verify OTP

Verify OTP and receive authentication tokens.

**Endpoint:** `POST /auth/verify-otp`

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "otp": "123456"
}
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "message": "OTP verified successfully",
  "success": true,
  "data": {
    "user": {
      "_id": "65f1234567890abcdef12345",
      "name": "John Doe",
      "email": "john.doe@example.com"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

**Error Responses:**

400 Bad Request - Invalid or expired OTP
```json
{
  "statusCode": 400,
  "message": "Invalid or expired OTP",
  "success": false
}
```

---

### LinkedIn OAuth - Initiate

Redirect to LinkedIn for authentication.

**Endpoint:** `GET /auth/linkedin`

**Response:**
Redirects to LinkedIn OAuth page

**Query Parameters Added:**
- `response_type=code`
- `client_id={CLIENT_ID}`
- `redirect_uri={REDIRECT_URI}`
- `state={STATE}`
- `scope=profile openid email w_member_social`

---

### LinkedIn OAuth - Callback

Handle LinkedIn OAuth callback.

**Endpoint:** `GET /auth/linkedin/callback`

**Query Parameters:**
- `code`: Authorization code from LinkedIn
- `state`: State parameter for CSRF protection

**Success Response (200):**
```json
{
  "statusCode": 200,
  "message": "LinkedIn authentication successful",
  "success": true,
  "data": {
    "user": {
      "_id": "65f1234567890abcdef12345",
      "name": "John Doe",
      "email": "john.doe@example.com"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

---

## User Management

All user endpoints require authentication. Include the JWT token in one of these ways:

1. **Authorization Header**: `Authorization: Bearer {access_token}`
2. **Cookie**: Automatically sent if logged in via web browser

### Get Current User

Get the authenticated user's profile.

**Endpoint:** `GET /users/me`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "message": "User profile retrieved",
  "success": true,
  "data": {
    "_id": "65f1234567890abcdef12345",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "age": 25,
    "profileImage": "https://example.com/avatar.jpg",
    "role": [
      {
        "_id": "65f0000000000000000",
        "name": "USER",
        "permissions": [...]
      }
    ],
    "isVerified": false,
    "lastLoginAt": "2025-10-30T10:00:00.000Z",
    "createdAt": "2025-10-30T10:00:00.000Z",
    "updatedAt": "2025-10-30T10:00:00.000Z"
  }
}
```

**Error Responses:**

401 Unauthorized - Missing or invalid token
```json
{
  "statusCode": 401,
  "message": "Authentication required",
  "success": false
}
```

---

### Update Current User

Update the authenticated user's profile.

**Endpoint:** `PATCH /users/me`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "name": "John Updated Doe",
  "age": 26,
  "profileImage": "https://example.com/new-avatar.jpg"
}
```

**Notes:**
- All fields are optional
- Cannot update `email`, `password`, `role` via this endpoint
- Only provided fields will be updated

**Success Response (200):**
```json
{
  "statusCode": 200,
  "message": "User updated successfully",
  "success": true,
  "data": {
    "_id": "65f1234567890abcdef12345",
    "name": "John Updated Doe",
    "email": "john.doe@example.com",
    "age": 26,
    "profileImage": "https://example.com/new-avatar.jpg",
    "updatedAt": "2025-10-30T11:00:00.000Z"
  }
}
```

---

### Get User by ID

Get any user's profile by ID (may require admin permissions).

**Endpoint:** `GET /users/:id`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**URL Parameters:**
- `id`: User's MongoDB ObjectId

**Success Response (200):**
```json
{
  "statusCode": 200,
  "message": "User found",
  "success": true,
  "data": {
    "_id": "65f1234567890abcdef12345",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": [...]
  }
}
```

**Error Responses:**

404 Not Found - User doesn't exist
```json
{
  "statusCode": 404,
  "message": "User not found",
  "success": false
}
```

---

### List All Users

Get a paginated list of all users (admin only).

**Endpoint:** `GET /users`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `search`: Search term (searches name and email)
- `role`: Filter by role ID
- `sortBy`: Field to sort by (default: createdAt)
- `sortOrder`: asc or desc (default: desc)

**Example Request:**
```
GET /users?page=1&limit=20&search=john&sortBy=name&sortOrder=asc
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "message": "Users retrieved",
  "success": true,
  "data": {
    "users": [
      {
        "_id": "65f1234567890abcdef12345",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "role": [...]
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 42,
      "itemsPerPage": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

### Delete User

Delete a user account (admin only or self-deletion).

**Endpoint:** `DELETE /users/:id`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**URL Parameters:**
- `id`: User's MongoDB ObjectId

**Success Response (200):**
```json
{
  "statusCode": 200,
  "message": "User deleted successfully",
  "success": true
}
```

**Error Responses:**

403 Forbidden - Insufficient permissions
```json
{
  "statusCode": 403,
  "message": "You don't have permission to delete this user",
  "success": false
}
```

---

## Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "statusCode": 200,
  "message": "Success message",
  "success": true,
  "data": {
    // Response data
  }
}
```

### Error Response

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

### Fields

- `statusCode` (number): HTTP status code
- `message` (string): Human-readable message
- `success` (boolean): `true` for success, `false` for error
- `data` (object): Response payload (success only)
- `errors` (array): Validation errors (error only)

---

## Error Codes

Common HTTP status codes used in the API:

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request succeeded |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input or validation error |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 422 | Unprocessable Entity | Invalid request data |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service temporarily unavailable |

---

## Rate Limits

API endpoints are rate-limited to prevent abuse:

### General Endpoints

- **Window**: 15 minutes
- **Limit**: 100 requests per IP
- **Headers**:
  - `X-RateLimit-Limit`: Total requests allowed
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Time when limit resets (Unix timestamp)

### Authentication Endpoints

More strict limits on authentication endpoints:

- **Window**: 15 minutes
- **Limit**: 5 requests per IP
- **Applies to**: `/auth/login`, `/auth/login/otp`, `/auth/verify-otp`

**Rate Limit Exceeded Response (429):**
```json
{
  "statusCode": 429,
  "message": "Too many requests, please try again later",
  "success": false
}
```

---

## Authentication Methods

### 1. Cookie-Based (Web Browsers)

Tokens are automatically sent in cookies after login:

```javascript
// Client-side (automatic)
fetch('http://localhost:5000/api/users/me', {
  credentials: 'include' // Include cookies
});
```

### 2. Bearer Token (Mobile/SPA)

Include token in Authorization header:

```javascript
// Client-side
fetch('http://localhost:5000/api/users/me', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

### 3. Token Refresh

When access token expires, use refresh token to get a new one:

**Endpoint:** `POST /auth/refresh`

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Token refreshed",
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## Pagination

List endpoints support pagination with consistent query parameters:

**Query Parameters:**
- `page` (number): Page number (1-indexed)
- `limit` (number): Items per page (1-100)
- `sortBy` (string): Field to sort by
- `sortOrder` (string): `asc` or `desc`

**Response Format:**
```json
{
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 42,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## Filtering & Search

List endpoints support filtering:

**Example:**
```
GET /users?search=john&role=65f0000000000000000&page=1&limit=10
```

**Common Filter Parameters:**
- `search`: Text search (searches multiple fields)
- `role`: Filter by role ID
- `status`: Filter by status
- `createdAfter`: ISO date string
- `createdBefore`: ISO date string

---

## Health Check

Check API health status.

**Endpoint:** `GET /health`

**No authentication required**

**Success Response (200):**
```json
{
  "statusCode": 200,
  "status": "OK",
  "message": "Server is healthy and running smoothly",
  "environment": "development",
  "uptime": "123.45 seconds",
  "timestamp": "2025-10-30T10:00:00.000Z",
  "memoryUsage": {
    "rss": "50.25 MB",
    "heapUsed": "30.15 MB",
    "heapTotal": "45.00 MB"
  },
  "pid": 12345,
  "version": "1.0.0"
}
```

---

## Postman Collection

A Postman collection is available for easy API testing:

1. Import the collection from `postman_collection.json`
2. Set up environment variables:
   - `base_url`: `http://localhost:5000/api`
   - `access_token`: (automatically set after login)
3. Run the authentication request first
4. Access token will be saved automatically

---

## Code Examples

### JavaScript/TypeScript (Fetch API)

```javascript
// Register
const register = async (userData) => {
  const response = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  return response.json();
};

// Login
const login = async (email, password) => {
  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies
    body: JSON.stringify({ email, password }),
  });
  return response.json();
};

// Get current user (with token)
const getMe = async (accessToken) => {
  const response = await fetch('http://localhost:5000/api/users/me', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  return response.json();
};
```

### Python (Requests)

```python
import requests

BASE_URL = "http://localhost:5000/api"

# Register
def register(user_data):
    response = requests.post(f"{BASE_URL}/auth/register", json=user_data)
    return response.json()

# Login
def login(email, password):
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": email, "password": password}
    )
    return response.json()

# Get current user
def get_me(access_token):
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(f"{BASE_URL}/users/me", headers=headers)
    return response.json()
```

### cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'

# Get current user (with cookie)
curl -X GET http://localhost:5000/api/users/me \
  -b cookies.txt

# Get current user (with token)
curl -X GET http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Webhooks (Future Feature)

Webhook endpoints for event notifications (planned for future release).

---

## API Versioning

Currently using implicit v1. Future versions will be prefixed:
- Current: `/api/endpoint`
- Future: `/api/v2/endpoint`

---

## Support

For API issues or questions:
- Check the main [README.md](README.md)
- Review [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)
- Open an issue on GitHub

---

**Last Updated:** October 30, 2025

