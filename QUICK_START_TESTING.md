# 🚀 Quick Start Testing Guide

**Goal:** Get your complete auth system running in 5 minutes!

---

## ⚡ Super Quick Start

### 1. Start Services (3 terminals)

**Terminal 1: MongoDB**
```bash
mongod --dbpath /path/to/data
# Or if using brew: brew services start mongodb-community
```

**Terminal 2: Redis**
```bash
redis-server
# Or if using brew: brew services start redis
```

**Terminal 3: Backend API + Worker**
```bash
cd /Users/adilali/Documents/prac/nexus-be

# Start API server (Terminal 3a)
npm run dev

# In another terminal, start worker (Terminal 3b)
npm run dev:worker
```

**Terminal 4: Frontend**
```bash
cd /Users/adilali/Documents/prac/frontend-template
npm run dev
```

---

## 🧪 Test in 2 Minutes

### Option A: Using Frontend (Easiest)

1. **Open browser:** `http://localhost:5173/auth/signup`

2. **Register:**
   - Name: Test User
   - Email: test@example.com  
   - Password: Test123!@#
   - Click Register

3. **Check Backend Terminal** - Look for:
   ```
   [EmailService] Preview URL: https://ethereal.email/message/xxx
   ```

4. **Click the Preview URL** - Opens email in browser

5. **Click "Verify Email" button** in email

6. **Login:**
   - Email: test@example.com
   - Password: Test123!@#
   - Click Login

7. **Success!** 🎉 You should be logged in and see dashboard

---

### Option B: Using cURL (Fast Testing)

```bash
# 1. Register User
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123!@#"
  }'

# 2. Check backend logs for email preview URL
# Copy the token from the URL

# 3. Verify Email (replace TOKEN with actual token)
curl "http://localhost:5000/api/auth/verify-email?token=TOKEN"

# 4. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'

# Copy the accessToken from response

# 5. Get Current User
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🎯 Quick Feature Tests

### Test 1: OTP Login (30 seconds)

```bash
# Request OTP
curl -X POST http://localhost:5000/api/auth/login-with-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Check backend logs for email with OTP code

# Verify OTP (replace 123456 with actual OTP)
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456"
  }'
```

### Test 2: Password Reset (30 seconds)

```bash
# Request reset
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Check backend logs for email with reset link
# Copy token from link

# Reset password
curl -X POST http://localhost:5000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_RESET_TOKEN",
    "password": "NewPass123!@#"
  }'

# Login with new password
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "NewPass123!@#"
  }'
```

### Test 3: Protected Routes (10 seconds)

```bash
# Get current user (requires token)
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Should return user data

# Try without token (should fail)
curl http://localhost:5000/api/auth/me

# Should return 401 Unauthorized
```

### Test 4: Logout (10 seconds)

```bash
# Logout
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Try to access protected route (should fail)
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## ✅ Verification Checklist

After running tests, verify:

- [ ] User created in MongoDB
- [ ] Email verification works
- [ ] Login returns tokens
- [ ] Protected routes require auth
- [ ] Token refresh works automatically (frontend)
- [ ] OTP login works
- [ ] Password reset works
- [ ] Logout clears tokens
- [ ] Emails are being sent (check logs for preview URLs)

---

## 🔍 Quick Debugging

### Check if Backend is Running:
```bash
curl http://localhost:5000/health
```

Should return:
```json
{
  "statusCode": 200,
  "status": "OK",
  "message": "Server is healthy and running smoothly."
}
```

### Check if MongoDB is Connected:
```bash
mongosh nexus_db
db.users.countDocuments()
```

Should return a number (0 if no users yet)

### Check if Redis is Running:
```bash
redis-cli ping
```

Should return: `PONG`

### Check Frontend API Config:
```bash
cat frontend-template/.env
```

Should have: `VITE_API_BASE_URL=http://localhost:5000/api`

---

## 🐛 Common Quick Fixes

### "Cannot connect to MongoDB"
```bash
# Start MongoDB
brew services start mongodb-community
# Or
mongod --dbpath /path/to/data
```

### "Cannot connect to Redis"
```bash
# Start Redis
brew services start redis
# Or
redis-server
```

### "CORS Error"
```bash
# Check .env has:
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### "Emails not sending"
```bash
# Make sure worker is running:
cd /Users/adilali/Documents/prac/nexus-be
npm run dev:worker
```

### "401 Unauthorized"
```bash
# Check token is being sent:
# In browser DevTools → Network → Request Headers
# Should have: Authorization: Bearer xxx
```

---

## 📊 What You've Built

```
Frontend (React + Vite)
    ↓
  Axios (with auto token refresh)
    ↓
Backend API (Express + TypeScript)
    ↓
├── MongoDB (User storage)
├── Redis (OTP + Queue storage)
└── BullMQ (Email jobs)
    ↓
Email Service (Nodemailer + Ethereal)
```

---

## 🎉 Success Criteria

You'll know everything is working when:

1. ✅ You can register a new user
2. ✅ You receive a verification email (preview URL in logs)
3. ✅ You can verify your email
4. ✅ You can login and receive tokens
5. ✅ You can access protected routes
6. ✅ Frontend automatically refreshes expired tokens
7. ✅ You can logout successfully

---

## 📚 Full Documentation

For complete details, see:

- **Complete Flow:** `COMPLETE_AUTH_FLOW.md`
- **Frontend Integration:** `FRONTEND_INTEGRATION_GUIDE.md`
- **API Reference:** `API_DOCUMENTATION.md`
- **Setup Guide:** `SETUP_GUIDE.md`

---

## 💡 Pro Tips

1. **View Emails:** Always check backend logs for email preview URLs
2. **Test Tokens:** Use jwt.io to decode and inspect tokens
3. **Monitor Logs:** Keep backend terminal visible to see requests
4. **Use DevTools:** Browser Network tab shows all API calls
5. **Clean Slate:** Clear MongoDB/Redis to start fresh testing

---

## 🚀 Ready to Test?

Run these 4 commands in order:

```bash
# Terminal 1
mongod --dbpath /path/to/data

# Terminal 2  
redis-server

# Terminal 3
cd /Users/adilali/Documents/prac/nexus-be && npm run dev

# Terminal 4 (new terminal)
cd /Users/adilali/Documents/prac/nexus-be && npm run dev:worker

# Terminal 5
cd /Users/adilali/Documents/prac/frontend-template && npm run dev
```

Then open: `http://localhost:5173/auth/signup`

**That's it! Your complete auth system is ready! 🎊**

