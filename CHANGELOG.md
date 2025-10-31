# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- Email verification flow
- Password reset functionality
- Two-factor authentication (2FA)
- API rate limiting improvements
- Admin dashboard
- Comprehensive test suite
- CI/CD pipeline
- Docker optimization
- API documentation (Swagger/OpenAPI)
- Performance monitoring
- Audit logging system
- File upload service
- WebSocket support
- GraphQL API

---

## [1.0.0] - 2025-10-30

### Added

#### Authentication
- JWT-based authentication with access and refresh tokens
- User registration with email and password
- Login with email and password
- OTP-based authentication via email
- LinkedIn OAuth integration
- Token refresh mechanism
- Secure cookie-based token storage
- Session management

#### User Management
- User model with role-based permissions
- User profile endpoints
- User CRUD operations
- Soft delete support
- User audit fields (lastLoginAt, createdAt, updatedAt)

#### Authorization
- Role-based access control (RBAC)
- Permission model
- Role model with permission assignments
- Default role assignment for new users
- JWT middleware for protected routes

#### Queue System
- BullMQ integration for background jobs
- Redis connection management
- OTP email queue with worker
- Job retry mechanisms
- Exponential backoff for failed jobs
- Queue monitoring capabilities
- Separate worker process support

#### Email Service
- Nodemailer integration
- OTP email templates
- Asynchronous email sending via queue
- Email service abstraction

#### Security
- Password hashing with bcrypt (10 rounds)
- JWT token signing and verification
- httpOnly cookies for token storage
- Input validation with Zod
- MongoDB sanitization
- CORS support
- Helmet security headers
- Environment-based configuration

#### Error Handling
- Centralized error handling middleware
- Custom ApiError class
- Standardized error responses
- Error logging with Winston
- Async handler wrapper for route handlers
- Zod validation error formatting

#### Logging
- Winston logger with file rotation
- Console and file logging
- Separate error log file
- HTTP request logging with Morgan
- Environment-based log levels
- Structured logging support

#### Configuration
- Environment-based configuration
- Centralized config management
- TypeScript config types
- MongoDB connection configuration
- Redis connection configuration
- JWT configuration
- BullMQ configuration
- LinkedIn OAuth configuration

#### Database
- MongoDB integration with Mongoose
- User schema with indexes
- Role schema with permissions
- Permission schema
- Pre-save hooks for password hashing
- Pre-save hooks for default role assignment
- Instance methods for password verification
- Instance methods for token generation
- Static methods for custom queries
- Connection pooling
- Graceful shutdown handling

#### API Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/login/otp` - Request OTP
- `POST /api/auth/verify-otp` - Verify OTP and login
- `GET /api/auth/linkedin` - LinkedIn OAuth initiation
- `GET /api/auth/linkedin/callback` - LinkedIn OAuth callback
- `GET /api/users/me` - Get current user
- `PATCH /api/users/me` - Update current user
- `GET /health` - Health check endpoint
- `GET /` - API root endpoint

#### Documentation
- Comprehensive README.md
- Developer guide (DEVELOPER_GUIDE.md)
- API documentation (API_DOCUMENTATION.md)
- Contributing guidelines (CONTRIBUTING.md)
- Security policy (SECURITY.md)
- Environment variable example (.env.example)
- Code of conduct

#### Development Tools
- TypeScript configuration
- ESLint configuration
- Nodemon for hot reload
- Separate nodemon configs for API and worker
- Path aliases with tsconfig-paths
- Build scripts with tsc-alias
- npm scripts for development and production

#### Infrastructure
- Modular folder structure
- Feature-based organization
- Separation of concerns (Controller -> Service -> Model)
- Type definitions in @types directory
- Utility functions and helpers
- Middleware directory
- Queue and consumer separation
- Configuration directory

### Changed
- N/A (Initial release)

### Deprecated
- N/A (Initial release)

### Removed
- N/A (Initial release)

### Fixed
- N/A (Initial release)

### Security
- Implemented bcrypt password hashing
- Added JWT token security
- Configured httpOnly cookies
- Added input validation
- Implemented CORS
- Added security headers with Helmet
- Sanitized MongoDB inputs
- Added rate limiting preparation

---

## Version History

- **1.0.0** (2025-10-30) - Initial release

---

## How to Read This Changelog

### Types of Changes

- **Added** - New features
- **Changed** - Changes in existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Security improvements

### Version Numbers

We use [Semantic Versioning](https://semver.org/):
- **MAJOR** version (1.x.x) - Incompatible API changes
- **MINOR** version (x.1.x) - New functionality (backwards-compatible)
- **PATCH** version (x.x.1) - Bug fixes (backwards-compatible)

---

## Contributing

When contributing, please update this changelog:

1. Add your changes under **[Unreleased]**
2. Follow the existing format
3. Group changes by type (Added, Changed, Fixed, etc.)
4. Be concise but descriptive
5. Include issue/PR numbers if applicable

Example:
```markdown
### Added
- User profile image upload (#123)
- Email verification flow (#124)

### Fixed
- JWT token expiry bug in refresh endpoint (#125)
```

---

## Notes

- All dates in YYYY-MM-DD format
- Keep the latest version at the top
- Compare versions: `[version]: https://github.com/user/repo/compare/v1.0.0...v1.1.0`
- Link to issues and PRs when relevant

---

**Last Updated:** 2025-10-30

