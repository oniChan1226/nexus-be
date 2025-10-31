# Setup Guide - Nexus Backend

A step-by-step guide to get the Nexus Backend running on your local machine.

---

## ⏱️ Estimated Time: 30 minutes

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] **Node.js** 20.x or higher
  ```bash
  node --version  # Should show v20.x.x or higher
  ```

- [ ] **npm** 10.x or higher
  ```bash
  npm --version  # Should show 10.x.x or higher
  ```

- [ ] **MongoDB** 8.x or higher
  ```bash
  mongosh --version  # Should show 8.x.x or higher
  ```

- [ ] **Redis** 7.x or higher
  ```bash
  redis-cli --version  # Should show 7.x.x or higher
  ```

- [ ] **Git** (any recent version)
  ```bash
  git --version
  ```

- [ ] A code editor (VS Code recommended)

### Installing Prerequisites

#### macOS (using Homebrew)

```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node@20

# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community@8

# Install Redis
brew install redis

# Start services
brew services start mongodb-community@8
brew services start redis
```

#### Ubuntu/Debian

```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-8.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/8.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Install Redis
sudo apt-get install -y redis-server

# Start services
sudo systemctl start mongod
sudo systemctl start redis-server
```

#### Windows

1. **Node.js**: Download from [nodejs.org](https://nodejs.org/)
2. **MongoDB**: Download from [mongodb.com](https://www.mongodb.com/try/download/community)
3. **Redis**: Use Docker or WSL2
   ```bash
   # Using Docker
   docker run -d -p 6379:6379 redis:7
   ```

---

## 🚀 Step-by-Step Setup

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone <repository-url>
cd nexus-be

# Or if already cloned, navigate to the directory
cd /path/to/nexus-be
```

**Expected output:**
```
Cloning into 'nexus-be'...
remote: Enumerating objects: 100, done.
remote: Counting objects: 100% (100/100), done.
```

---

### Step 2: Install Dependencies

```bash
npm install
```

**Expected output:**
```
added 250 packages, and audited 251 packages in 15s

50 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

**If you see errors:**
- Make sure Node.js version is correct: `node --version`
- Try clearing cache: `npm cache clean --force`
- Delete node_modules and try again: `rm -rf node_modules && npm install`

---

### Step 3: Configure Environment Variables

```bash
# Create .env file from example (if .env.example exists)
cp .env.example .env

# Or create .env manually
touch .env
```

**Edit `.env` file with your favorite editor:**

```bash
# Using VS Code
code .env

# Using vim
vim .env

# Using nano
nano .env
```

**Minimum required configuration:**

```env
# Application
NODE_ENV=development
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017
DB_NAME=nexus_dev

# JWT (Generate secure secrets!)
ACCESS_TOKEN_SECRET=CHANGE_THIS_TO_RANDOM_STRING_32_CHARS_OR_MORE
REFRESH_TOKEN_SECRET=CHANGE_THIS_TO_DIFFERENT_RANDOM_STRING_32_CHARS

# Token Expiry
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_DB=0
```

**⚠️ IMPORTANT: Generate secure JWT secrets!**

```bash
# Generate random secrets (run twice for two different secrets)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and use it for `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET`.

---

### Step 4: Verify Services Are Running

#### MongoDB

```bash
# Try connecting
mongosh

# If connected, you'll see:
# test> 

# Exit with:
exit
```

**If not running:**
```bash
# macOS (Homebrew)
brew services start mongodb-community@8

# Ubuntu
sudo systemctl start mongod

# Docker
docker run -d -p 27017:27017 --name mongodb mongo:8
```

#### Redis

```bash
# Try connecting
redis-cli ping

# Should output:
# PONG
```

**If not running:**
```bash
# macOS (Homebrew)
brew services start redis

# Ubuntu
sudo systemctl start redis-server

# Docker
docker run -d -p 6379:6379 --name redis redis:7
```

---

### Step 5: Build the Project

```bash
npm run build
```

**Expected output:**
```
> nexus-be@1.0.0 build
> tsc && tsc-alias

Successfully compiled TypeScript files
```

**If you see TypeScript errors:**
- Make sure all dependencies are installed
- Check TypeScript version: `npx tsc --version`
- Review the error messages and fix type issues

---

### Step 6: Start the Development Server

Open **TWO terminal windows** in the project directory.

**Terminal 1: API Server**
```bash
npm run dev
```

**Expected output:**
```
[nodemon] 3.1.10
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): src/**/*
[nodemon] watching extensions: ts,js
[nodemon] starting `ts-node -r tsconfig-paths/register src/server.ts`
✅ MongoDB connected
✅ Redis connected
✅ Queues bootstrapped
🚀 Server running at http://localhost:5000
```

**Terminal 2: Worker Process**
```bash
npm run dev:worker
```

**Expected output:**
```
[nodemon] 3.1.10
[nodemon] starting `ts-node -r tsconfig-paths/register src/consumer/index.ts`
✅ Redis connected
✅ Workers started
👷 OTP worker listening for jobs
```

---

### Step 7: Test the API

#### Test 1: Health Check

```bash
curl http://localhost:5000/health
```

**Expected response:**
```json
{
  "statusCode": 200,
  "status": "OK",
  "message": "Server is healthy and running smoothly.",
  "environment": "development",
  "uptime": "5.23 seconds",
  ...
}
```

#### Test 2: API Root

```bash
curl http://localhost:5000/
```

**Expected response:**
```json
{
  "status": "OK",
  "message": "Mery Karan Arjun",
  "environment": "development"
}
```

#### Test 3: Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

**Expected response:**
```json
{
  "statusCode": 201,
  "message": "User registered successfully",
  "success": true,
  "data": {
    "_id": "...",
    "name": "Test User",
    "email": "test@example.com",
    ...
  }
}
```

---

## ✅ Verification Checklist

After setup, verify everything is working:

- [ ] MongoDB is running and connected
- [ ] Redis is running and connected
- [ ] API server starts without errors
- [ ] Worker process starts without errors
- [ ] `/health` endpoint returns 200
- [ ] Can register a new user
- [ ] Can login with registered user
- [ ] Logs are being written to `logs/` directory

---

## 🎉 Success! Next Steps

Your Nexus Backend is now running! Here's what to do next:

### 1. Explore the API

Use a tool like:
- **Postman** - Import collection (if available)
- **Insomnia** - Great REST client
- **cURL** - Command line
- **VS Code REST Client** - Extension

### 2. Read the Documentation

- [README.md](README.md) - Complete overview
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - API endpoints
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Common patterns

### 3. Try Creating a Feature

Follow the guide in [QUICK_REFERENCE.md](QUICK_REFERENCE.md#creating-new-features)

### 4. Set Up Your IDE

**Recommended VS Code Extensions:**
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- MongoDB for VS Code
- GitLens

**VS Code Settings** (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "non-relative"
}
```

---

## 🐛 Troubleshooting

### Issue: Port 5000 already in use

**Solution:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or use a different port in .env
PORT=5001
```

---

### Issue: MongoDB connection error

**Error:**
```
MongoServerError: Authentication failed
```

**Solution:**
```bash
# Check MongoDB is running
mongosh

# If not running, start it
brew services start mongodb-community@8  # macOS
sudo systemctl start mongod              # Linux

# Check connection string in .env
MONGO_URI=mongodb://localhost:27017
```

---

### Issue: Redis connection error

**Error:**
```
Error: Redis connection failed
```

**Solution:**
```bash
# Check Redis is running
redis-cli ping

# If not running, start it
brew services start redis       # macOS
sudo systemctl start redis     # Linux

# Check Redis config in .env
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

---

### Issue: TypeScript errors during build

**Error:**
```
error TS2304: Cannot find name 'IUser'
```

**Solution:**
```bash
# Clean build
rm -rf dist

# Reinstall dependencies
rm -rf node_modules
npm install

# Try building again
npm run build
```

---

### Issue: Module not found errors

**Error:**
```
Cannot find module '@types/...'
```

**Solution:**
```bash
# Install missing types
npm install --save-dev @types/missing-module

# Or reinstall all dependencies
rm -rf node_modules package-lock.json
npm install
```

---

### Issue: nodemon not restarting

**Solution:**
```bash
# Manually restart by typing in the terminal:
rs

# Or kill and restart
# Ctrl + C to stop
npm run dev
```

---

## 🔧 Optional Configuration

### Email Service (for OTP)

If you want to test OTP functionality:

1. **Using Gmail** (easiest for testing):

```env
# Add to .env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=your-app-password  # Not your Gmail password!
EMAIL_FROM=noreply@example.com
```

2. **Generate Gmail App Password**:
   - Go to Google Account Settings
   - Security → 2-Step Verification
   - App passwords → Generate
   - Copy and use as `EMAIL_PASSWORD`

### LinkedIn OAuth (optional)

1. Create LinkedIn App at [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Add credentials to `.env`:

```env
CLIENT_ID=your_linkedin_client_id
CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_REDIRECT_URI=http://localhost:5000/api/auth/linkedin/callback
```

---

## 📚 Additional Resources

### Database GUI Tools

- **MongoDB Compass** - Official MongoDB GUI
- **Robo 3T** - Lightweight MongoDB GUI
- **Studio 3T** - Advanced MongoDB IDE

### Redis GUI Tools

- **RedisInsight** - Official Redis GUI
- **Another Redis Desktop Manager** - Cross-platform Redis GUI

### API Testing Tools

- **Postman** - Popular API testing tool
- **Insomnia** - Modern REST client
- **Thunder Client** - VS Code extension

---

## 🆘 Getting Help

If you're still stuck:

1. **Check the logs:**
   ```bash
   # View combined logs
   tail -f logs/combined.log

   # View error logs
   tail -f logs/error.log
   ```

2. **Enable debug mode:**
   ```env
   # In .env
   LOG_LEVEL=debug
   ```

3. **Search the documentation:**
   - [README.md](README.md)
   - [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)
   - [TROUBLESHOOTING.md](TROUBLESHOOTING.md) (if available)

4. **Ask for help:**
   - Open a GitHub issue
   - Contact maintainers
   - Check existing issues

---

## ✨ You're All Set!

Congratulations! Your development environment is ready. Happy coding! 🚀

**Next Steps:**
1. Explore the codebase
2. Read [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
3. Create your first feature
4. Write tests
5. Submit your first PR!

---

**Setup Guide v1.0.0**  
**Last Updated:** October 30, 2025

