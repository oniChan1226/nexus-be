# Frontend Integration Guide

Complete guide to connect your frontend template with the nexus-be backend.

---

## 🎯 Overview

This guide shows you how to integrate the frontend template (`/frontend-template`) with the nexus-be backend for a complete authentication flow.

### What's Been Implemented ✅

**Backend (nexus-be):**
- ✅ User Registration with Email Verification
- ✅ Email Verification Flow
- ✅ Login with Email/Password
- ✅ Login with OTP
- ✅ Forgot Password Flow
- ✅ Reset Password
- ✅ Logout (Single & All Devices)
- ✅ Refresh Token
- ✅ Get Current User
- ✅ LinkedIn OAuth

**Frontend (frontend-template):**
- ✅ LoginPage
- ✅ SignupPage
- ✅ OtpPage
- ✅ EmailVerificationPage
- ✅ Auth API Service
- ✅ Auth Store (Zustand)

---

## 📋 Complete Authentication Flow

### Flow Diagram

```
User Registration
    ↓
POST /api/auth/register
    ↓
Email Sent (Verification Link)
    ↓
User Clicks Link → GET /api/auth/verify-email?token=xxx
    ↓
Email Verified
    ↓
User Can Now Login → POST /api/auth/login
    ↓
Receive Access + Refresh Tokens
    ↓
Access Protected Routes
    ↓
Token Expires → POST /api/auth/refresh-token
    ↓
New Access Token
    ↓
User Logout → POST /api/auth/logout
```

---

## 🔧 Backend API Endpoints

### Base URL
```
http://localhost:5000/api/auth
```

### Available Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/register` | No | Register new user |
| POST | `/login` | No | Login with email/password |
| POST | `/login-with-otp` | No | Request OTP login |
| POST | `/verify-otp` | No | Verify OTP and login |
| GET | `/verify-email?token=xxx` | No | Verify email address |
| POST | `/resend-verification` | No | Resend verification email |
| POST | `/forgot-password` | No | Request password reset |
| POST | `/reset-password` | No | Reset password with token |
| POST | `/refresh-token` | No | Get new access token |
| GET | `/me` | Yes | Get current user |
| POST | `/logout` | Yes | Logout from current device |
| POST | `/logout-all` | Yes | Logout from all devices |
| GET | `/linkedin` | No | LinkedIn OAuth |
| GET | `/linkedin/callback` | No | LinkedIn callback |

---

## 🛠️ Setup Instructions

### Step 1: Backend Setup

1. **Navigate to backend directory:**
```bash
cd /Users/adilali/Documents/prac/nexus-be
```

2. **Install dependencies (if not done):**
```bash
npm install
```

3. **Create `.env` file:**
```bash
# Copy this content to .env file
NODE_ENV=development
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017
DB_NAME=nexus_db

# JWT Secrets (generate with: openssl rand -base64 32)
ACCESS_TOKEN_SECRET=your_access_secret_here
REFRESH_TOKEN_SECRET=your_refresh_secret_here
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_DB=0

# BullMQ
BULLMQ_PREFIX=bullmq
BULLMQ_MAX_RETRIES=3
BULLMQ_BACKOFF_DELAY=1000

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

4. **Start MongoDB and Redis:**
```bash
# MongoDB
mongod --dbpath /path/to/data

# Redis
redis-server
```

5. **Start backend server:**
```bash
# Terminal 1: API Server
npm run dev

# Terminal 2: Worker (for emails)
npm run dev:worker
```

Backend should now be running on `http://localhost:5000`

---

### Step 2: Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd /Users/adilali/Documents/prac/frontend-template
```

2. **Update API base URL:**

Create or update `/src/lib/axios/axios.config.ts`:
```typescript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important: Send cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          { refreshToken }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;
        
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Redirect to login
        localStorage.clear();
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export { axiosInstance as axios };
```

3. **Update Auth API Service:**

Update `/src/features/auth/authapi.ts`:
```typescript
import { axios } from '@/lib/axios';

class AuthApiService {
  // Register
  async register(data: {
    name: string;
    email: string;
    password: string;
  }) {
    const response = await axios.post('/auth/register', data);
    return response.data;
  }

  // Login
  async login(data: { email: string; password: string }) {
    const response = await axios.post('/auth/login', data);
    
    // Store tokens
    const { accessToken, refreshToken } = response.data.data.tokens;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    
    return response.data;
  }

  // Login with OTP
  async loginWithOtp(email: string) {
    const response = await axios.post('/auth/login-with-otp', { email });
    return response.data;
  }

  // Verify OTP
  async verifyOtp(data: { email: string; otp: string }) {
    const response = await axios.post('/auth/verify-otp', data);
    
    // Store tokens
    const { accessToken, refreshToken } = response.data.data.tokens;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    
    return response.data;
  }

  // Verify Email
  async verifyEmail(token: string) {
    const response = await axios.get(`/auth/verify-email?token=${token}`);
    return response.data;
  }

  // Resend Verification
  async resendVerification(email: string) {
    const response = await axios.post('/auth/resend-verification', { email });
    return response.data;
  }

  // Forgot Password
  async forgotPassword(email: string) {
    const response = await axios.post('/auth/forgot-password', { email });
    return response.data;
  }

  // Reset Password
  async resetPassword(token: string, password: string) {
    const response = await axios.post('/auth/reset-password', {
      token,
      password,
    });
    return response.data;
  }

  // Logout
  async logout() {
    await axios.post('/auth/logout');
    localStorage.clear();
  }

  // Refresh Token
  async refreshToken(refreshToken: string) {
    const response = await axios.post('/auth/refresh-token', { refreshToken });
    return response.data;
  }

  // Get Current User
  async getCurrentUser() {
    const response = await axios.get('/auth/me');
    return response.data;
  }
}

export const authApi = new AuthApiService();
```

4. **Start frontend:**
```bash
npm run dev
```

Frontend should now be running on `http://localhost:3000` or `http://localhost:5173`

---

## 🔐 Complete Authentication Examples

### 1. User Registration

**Frontend:**
```typescript
// In your SignupPage component
import { authApi } from '@/features/auth/authapi';

const handleSignup = async (data: SignupFormData) => {
  try {
    const response = await authApi.register({
      name: data.name,
      email: data.email,
      password: data.password,
    });

    // Show success message
    toast.success(response.message);
    
    // Redirect to check email page
    navigate('/auth/check-email');
  } catch (error) {
    toast.error(error.response?.data?.message || 'Registration failed');
  }
};
```

**API Request:**
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**API Response:**
```json
{
  "statusCode": 201,
  "message": "Registration successful! Please check your email to verify your account.",
  "success": true,
  "data": {
    "_id": "65f123...",
    "name": "John Doe",
    "email": "john@example.com",
    "isVerified": false,
    "createdAt": "2025-10-30T..."
  }
}
```

---

### 2. Email Verification

**Frontend:**
```typescript
// In your EmailVerificationPage component
import { useSearchParams } from 'react-router-dom';

const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await authApi.verifyEmail(token!);
        toast.success(response.message);
        navigate('/auth/login');
      } catch (error) {
        toast.error('Verification failed');
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token]);

  return <div>Verifying your email...</div>;
};
```

**User Flow:**
1. User receives email with link: `http://localhost:3000/auth/verify-email?token=abc123...`
2. User clicks link
3. Frontend extracts token and calls API
4. Backend verifies token and marks email as verified
5. User redirected to login page

---

### 3. Login with Email/Password

**Frontend:**
```typescript
const handleLogin = async (data: LoginFormData) => {
  try {
    const response = await authApi.login({
      email: data.email,
      password: data.password,
    });

    // Tokens are automatically stored in localStorage
    // by the authApi.login method

    // Update auth state
    authStore.setUser(response.data);
    authStore.setIsAuthenticated(true);

    toast.success('Login successful!');
    navigate('/dashboard');
  } catch (error) {
    if (error.response?.status === 403) {
      toast.error('Please verify your email first');
      // Offer to resend verification email
    } else {
      toast.error('Invalid email or password');
    }
  }
};
```

---

### 4. Login with OTP

**Step 1: Request OTP**
```typescript
const handleRequestOtp = async () => {
  try {
    await authApi.loginWithOtp(email);
    toast.success('OTP sent to your email!');
    navigate('/auth/verify-otp');
  } catch (error) {
    toast.error('Failed to send OTP');
  }
};
```

**Step 2: Verify OTP**
```typescript
const handleVerifyOtp = async () => {
  try {
    const response = await authApi.verifyOtp({
      email,
      otp: otpCode,
    });

    authStore.setUser(response.data);
    authStore.setIsAuthenticated(true);

    navigate('/dashboard');
  } catch (error) {
    toast.error('Invalid or expired OTP');
  }
};
```

---

### 5. Forgot Password

**Step 1: Request Reset**
```typescript
const handleForgotPassword = async () => {
  try {
    await authApi.forgotPassword(email);
    toast.success('Reset link sent to your email!');
    navigate('/auth/check-email');
  } catch (error) {
    toast.error('Failed to send reset link');
  }
};
```

**Step 2: Reset Password**
```typescript
// User receives email with link: http://localhost:3000/auth/reset-password?token=xyz789...

const [searchParams] = useSearchParams();
const token = searchParams.get('token');

const handleResetPassword = async () => {
  try {
    await authApi.resetPassword(token!, newPassword);
    toast.success('Password reset successful!');
    navigate('/auth/login');
  } catch (error) {
    toast.error('Invalid or expired reset link');
  }
};
```

---

### 6. Protected Routes

**Create Auth Guard:**
```typescript
// /src/components/AuthGuard.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authStore } from '@/features/auth/store';
import { authApi } from '@/features/auth/authapi';

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { isAuthenticated, setUser, setIsAuthenticated } = authStore();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
          navigate('/auth/login');
          return;
        }

        // Verify token is still valid
        const response = await authApi.getCurrentUser();
        setUser(response.data);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.clear();
        navigate('/auth/login');
      }
    };

    if (!isAuthenticated) {
      checkAuth();
    }
  }, [isAuthenticated]);

  return isAuthenticated ? children : <div>Loading...</div>;
};
```

**Use in Routes:**
```typescript
import { AuthGuard } from '@/components/AuthGuard';

<Route
  path="/dashboard"
  element={
    <AuthGuard>
      <Dashboard />
    </AuthGuard>
  }
/>
```

---

### 7. Logout

```typescript
const handleLogout = async () => {
  try {
    await authApi.logout();
    
    // Clear auth state
    authStore.setUser(null);
    authStore.setIsAuthenticated(false);
    
    toast.success('Logged out successfully');
    navigate('/auth/login');
  } catch (error) {
    // Clear local storage anyway
    localStorage.clear();
    navigate('/auth/login');
  }
};
```

---

## 🧪 Testing the Integration

### 1. Test User Registration

```bash
# Backend running on http://localhost:5000
# Frontend running on http://localhost:3000

# 1. Open browser: http://localhost:3000/auth/signup
# 2. Fill in form and submit
# 3. Check backend logs for email preview URL
# 4. Click verification link from email
# 5. Verify user in database: db.users.findOne({ email: "user@example.com" })
```

### 2. Check Email Preview

Since we're using Ethereal (test email service), you can view emails at:

**Backend logs will show:**
```
[EmailService] Preview URL: https://ethereal.email/message/xxx
```

Click that URL to see the email!

### 3. Test Complete Flow

1. ✅ Register → Check email → Verify email
2. ✅ Login → Get tokens → Access dashboard
3. ✅ Logout → Clear tokens → Redirect to login
4. ✅ Forgot password → Check email → Reset password
5. ✅ Login with OTP → Enter OTP → Access dashboard

---

## 🐛 Troubleshooting

### Issue: CORS Error

**Problem:** `Access to XMLHttpRequest has been blocked by CORS policy`

**Solution:**
1. Add your frontend URL to `.env`:
```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

2. Update backend `src/app.ts`:
```typescript
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));
```

---

### Issue: Tokens Not Being Saved

**Problem:** Tokens not persisting after login

**Solution:** Ensure `withCredentials: true` in axios config:
```typescript
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // This is important!
});
```

---

### Issue: 401 Unauthorized on Protected Routes

**Problem:** Getting 401 even after login

**Solution:**
1. Check token is being sent:
```typescript
// In axios interceptor
config.headers.Authorization = `Bearer ${token}`;
```

2. Check token in browser DevTools:
   - Application → Local Storage → Check for `accessToken`

---

### Issue: Email Not Being Sent

**Problem:** Verification/reset emails not arriving

**Solution:**
1. Check backend logs for email preview URL
2. Make sure worker process is running: `npm run dev:worker`
3. Check Redis is running: `redis-cli ping`
4. View email at Ethereal preview URL

---

## 📚 Additional Resources

### Backend Files Created/Updated:
- ✅ `/src/models/verification-token.model.ts` - Token storage
- ✅ `/src/modules/auth/auth.validator.ts` - Request validation
- ✅ `/src/modules/auth/auth.service.ts` - Business logic
- ✅ `/src/modules/auth/auth.controller.ts` - HTTP handlers
- ✅ `/src/modules/auth/auth.route.ts` - Route definitions
- ✅ `/src/services/email.service.ts` - Email sending

### API Documentation:
See `API_DOCUMENTATION.md` for complete API reference

### Environment Variables:
See `.env.example` for all required variables

---

## 🎉 Success Checklist

After completing this guide, you should have:

- ✅ Backend running on port 5000
- ✅ Frontend running on port 3000/5173
- ✅ MongoDB connected
- ✅ Redis connected
- ✅ Worker process running
- ✅ User registration working
- ✅ Email verification working
- ✅ Login working
- ✅ Password reset working
- ✅ Protected routes working
- ✅ Logout working
- ✅ Token refresh working

---

## 💡 Next Steps

1. **Configure Real Email Provider**
   - Use SendGrid, Mailgun, or AWS SES
   - Update email service configuration

2. **Add Rate Limiting**
   - Protect against brute force attacks
   - See `ACTION_PLAN.md` for implementation

3. **Add Testing**
   - Write integration tests
   - Test complete auth flows

4. **Deploy**
   - Set up production environment
   - Configure environment variables
   - Deploy backend and frontend

---

**Need Help?** Check:
- `README.md` - Main documentation
- `DEVELOPER_GUIDE.md` - Advanced patterns
- `API_DOCUMENTATION.md` - API reference
- `TROUBLESHOOTING.md` - Common issues

**Happy coding! 🚀**

