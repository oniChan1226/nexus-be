# Contributing to Nexus Backend

Thank you for your interest in contributing to Nexus Backend! This document provides guidelines and instructions for contributing to the project.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Commit Guidelines](#commit-guidelines)
6. [Pull Request Process](#pull-request-process)
7. [Testing Requirements](#testing-requirements)
8. [Documentation](#documentation)
9. [Issue Reporting](#issue-reporting)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of experience level, background, or identity.

### Expected Behavior

- Be respectful and considerate
- Welcome newcomers and help them get started
- Accept constructive criticism gracefully
- Focus on what's best for the project
- Show empathy towards other contributors

### Unacceptable Behavior

- Harassment or discrimination of any kind
- Trolling, insulting comments, or personal attacks
- Publishing others' private information
- Other conduct that would be inappropriate in a professional setting

---

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- Node.js 20.x or higher
- MongoDB 8.x or higher
- Redis 7.x or higher
- Git
- A code editor (VS Code recommended)

### Fork and Clone

1. **Fork the repository** on GitHub

2. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/nexus-be.git
   cd nexus-be
   ```

3. **Add upstream remote:**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/nexus-be.git
   ```

4. **Install dependencies:**
   ```bash
   npm install
   ```

5. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

6. **Start development:**
   ```bash
   npm run dev
   ```

---

## Development Workflow

### Branch Strategy

We use a feature branch workflow:

```
main
  ├── develop
  │   ├── feature/user-authentication
  │   ├── feature/email-service
  │   ├── fix/jwt-expiry-bug
  │   └── refactor/database-queries
```

### Creating a Branch

1. **Update your local repository:**
   ```bash
   git checkout develop
   git pull upstream develop
   ```

2. **Create a feature branch:**
   ```bash
   # For features
   git checkout -b feature/your-feature-name

   # For bug fixes
   git checkout -b fix/bug-description

   # For refactoring
   git checkout -b refactor/what-you-are-refactoring
   ```

### Branch Naming Convention

- `feature/feature-name` - New features
- `fix/bug-name` - Bug fixes
- `refactor/component-name` - Code refactoring
- `docs/section-name` - Documentation updates
- `test/feature-name` - Test additions/updates
- `chore/task-name` - Maintenance tasks

**Examples:**
- `feature/otp-authentication`
- `fix/jwt-token-expiry`
- `refactor/user-service`
- `docs/api-endpoints`

---

## Coding Standards

### TypeScript Guidelines

1. **Use explicit types:**
   ```typescript
   // ✅ Good
   function getUser(id: string): Promise<IUser> {
     // ...
   }

   // ❌ Bad
   function getUser(id: any): Promise<any> {
     // ...
   }
   ```

2. **Avoid `any` type:**
   ```typescript
   // ✅ Good
   const data: unknown = req.body;
   if (isValidUserData(data)) {
     processUser(data);
   }

   // ❌ Bad
   const data: any = req.body;
   processUser(data);
   ```

3. **Use interfaces for object shapes:**
   ```typescript
   // ✅ Good
   interface CreateUserRequest {
     name: string;
     email: string;
     password: string;
   }

   // ❌ Bad
   type CreateUserRequest = {
     name: string;
     email: string;
     password: string;
   };
   ```

### Code Style

We use ESLint and Prettier for code formatting:

```bash
# Check linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

**Key Style Rules:**
- 2 spaces for indentation
- Single quotes for strings
- Semicolons required
- Trailing commas in objects/arrays
- Max line length: 100 characters

### File Organization

```typescript
// 1. Imports (grouped and sorted)
import { Request, Response } from 'express';
import mongoose from 'mongoose';

import { ApiError, ApiResponse, asyncHandler } from 'utils';
import { UserModel } from 'models';
import { IUser } from '@types/models/user.types';

// 2. Type definitions
interface GetUserParams {
  id: string;
}

// 3. Constants
const DEFAULT_PAGE_SIZE = 10;

// 4. Main code
export const UserController = {
  // ...
};
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Variables | camelCase | `userName`, `isActive` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRIES`, `API_URL` |
| Functions | camelCase | `getUser`, `validateEmail` |
| Classes | PascalCase | `UserService`, `ApiError` |
| Interfaces | PascalCase with `I` prefix | `IUser`, `IConfig` |
| Types | PascalCase | `UserRole`, `JobStatus` |
| Enums | PascalCase | `UserRoleEnum` |
| Files | kebab-case | `user-service.ts`, `auth-middleware.ts` |
| Directories | kebab-case | `auth/`, `user-management/` |

### Error Handling

```typescript
// ✅ Good - Use ApiError
export const getUser = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.params.id);
  
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  
  res.json(new ApiResponse(200, 'User found', user));
});

// ❌ Bad - Generic error
export const getUser = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) {
      throw new Error('Not found');
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
```

### Async/Await

```typescript
// ✅ Good - Use async/await with asyncHandler
export const createUser = asyncHandler(async (req, res) => {
  const user = await UserService.create(req.body);
  res.status(201).json(user);
});

// ❌ Bad - Promise chains
export const createUser = (req, res) => {
  UserService.create(req.body)
    .then(user => res.status(201).json(user))
    .catch(err => res.status(500).json(err));
};
```

### Comments

```typescript
// ✅ Good - Explain "why", not "what"
// Retry 3 times because external API is sometimes unreliable
const MAX_RETRIES = 3;

// ✅ Good - Document complex logic
/**
 * Calculates user's tier based on activity score
 * Tier 1: 0-100 points
 * Tier 2: 101-500 points
 * Tier 3: 500+ points
 */
function calculateTier(score: number): number {
  // ...
}

// ❌ Bad - Obvious comments
// Increment counter by 1
counter++;

// ❌ Bad - Commented-out code (delete instead)
// const oldFunction = () => {
//   // ...
// };
```

---

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring (no feature change)
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (dependencies, config, etc.)
- `ci`: CI/CD changes

### Examples

```bash
# Feature
git commit -m "feat(auth): add OTP-based authentication"

# Bug fix
git commit -m "fix(jwt): resolve token expiry issue in refresh endpoint"

# Documentation
git commit -m "docs(api): add pagination examples to API documentation"

# Refactoring
git commit -m "refactor(user): extract email validation logic to utility"

# Breaking change
git commit -m "feat(auth): update JWT payload structure

BREAKING CHANGE: JWT tokens now include 'permissions' array instead of 'role'"
```

### Commit Best Practices

1. **Write clear, concise messages**
   - First line: 50 characters or less
   - Body: Wrap at 72 characters

2. **Use imperative mood**
   - ✅ "Add feature" (not "Added feature")
   - ✅ "Fix bug" (not "Fixes bug")

3. **One logical change per commit**
   - Don't mix features and bug fixes
   - Don't mix formatting and logic changes

4. **Reference issues when applicable**
   ```bash
   git commit -m "fix(auth): resolve JWT expiry bug

   Fixes #123"
   ```

---

## Pull Request Process

### Before Submitting

1. **Update from upstream:**
   ```bash
   git checkout develop
   git pull upstream develop
   git checkout your-branch
   git rebase develop
   ```

2. **Run tests:**
   ```bash
   npm test
   ```

3. **Check linting:**
   ```bash
   npm run lint
   ```

4. **Build the project:**
   ```bash
   npm run build
   ```

5. **Update documentation:**
   - Update README if needed
   - Add API documentation for new endpoints
   - Update CHANGELOG.md

### Creating a Pull Request

1. **Push to your fork:**
   ```bash
   git push origin your-branch
   ```

2. **Open a pull request** on GitHub

3. **Fill out the PR template:**

   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Changes Made
   - Added X feature
   - Fixed Y bug
   - Updated Z documentation

   ## Testing
   - [ ] Unit tests added/updated
   - [ ] Integration tests added/updated
   - [ ] Manual testing completed

   ## Checklist
   - [ ] Code follows project style guidelines
   - [ ] Self-review completed
   - [ ] Comments added for complex code
   - [ ] Documentation updated
   - [ ] No new warnings generated
   - [ ] Tests pass locally

   ## Screenshots (if applicable)

   ## Related Issues
   Closes #123
   ```

4. **Request review** from maintainers

### Pull Request Guidelines

- **Title:** Use conventional commit format
  - `feat: add user profile endpoint`
  - `fix: resolve database connection issue`

- **Description:** Explain what, why, and how
  - What changes were made?
  - Why were they necessary?
  - How do they work?

- **Size:** Keep PRs focused and reasonably sized
  - Aim for < 400 lines of code
  - Split large changes into multiple PRs

- **Testing:** All PRs must include tests

- **Documentation:** Update relevant documentation

### Review Process

1. **Automated checks** must pass:
   - Linting
   - Tests
   - Build

2. **Code review** by at least one maintainer

3. **Address feedback:**
   - Make requested changes
   - Push new commits (don't force push during review)
   - Request re-review

4. **Approval:** PR approved by maintainer(s)

5. **Merge:** Maintainer will merge the PR

---

## Testing Requirements

### Test Coverage

All new features must include:

- **Unit tests** for business logic
- **Integration tests** for API endpoints
- Aim for 80%+ code coverage

### Writing Tests

```typescript
// Unit test example
describe('UserService', () => {
  describe('getById', () => {
    it('should return user when found', async () => {
      const mockUser = { _id: '123', name: 'John' };
      jest.spyOn(UserModel, 'findById').mockResolvedValue(mockUser);

      const result = await UserService.getById('123');

      expect(result.data).toEqual(mockUser);
      expect(UserModel.findById).toHaveBeenCalledWith('123');
    });

    it('should throw error when user not found', async () => {
      jest.spyOn(UserModel, 'findById').mockResolvedValue(null);

      await expect(UserService.getById('123')).rejects.toThrow('User not found');
    });
  });
});

// Integration test example
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
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- user.service.test.ts
```

---

## Documentation

### What to Document

1. **Code comments** for complex logic
2. **JSDoc** for public functions
3. **README** for setup and usage
4. **API documentation** for endpoints
5. **Architecture decisions** in DEVELOPER_GUIDE.md

### JSDoc Example

```typescript
/**
 * Creates a new user account
 * 
 * @param userData - User registration data
 * @param userData.name - User's full name (3-100 characters)
 * @param userData.email - User's email address (must be unique)
 * @param userData.password - User's password (min 8 characters)
 * @returns Promise resolving to created user with tokens
 * @throws {ApiError} 409 if email already exists
 * @throws {ApiError} 400 if validation fails
 * 
 * @example
 * const result = await UserService.create({
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   password: 'SecurePass123!'
 * });
 */
export async function createUser(userData: CreateUserInput): Promise<ApiResponse<IUser>> {
  // ...
}
```

---

## Issue Reporting

### Before Opening an Issue

1. **Search existing issues** to avoid duplicates
2. **Check documentation** for known issues
3. **Try to reproduce** the issue

### Issue Template

**Bug Report:**
```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Step one
2. Step two
3. Step three

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: macOS 12.0
- Node: 20.0.0
- npm: 10.0.0

## Screenshots/Logs
If applicable

## Additional Context
Any other relevant information
```

**Feature Request:**
```markdown
## Feature Description
Clear description of the feature

## Use Case
Why is this feature needed?

## Proposed Solution
How should it work?

## Alternatives Considered
Other solutions you've thought of

## Additional Context
Any other relevant information
```

---

## Review Checklist

Before submitting your PR, ensure:

### Code Quality
- [ ] Code follows style guidelines
- [ ] No linting errors
- [ ] No TypeScript errors
- [ ] No console.log statements
- [ ] No commented-out code

### Functionality
- [ ] Feature works as intended
- [ ] No breaking changes (or documented if necessary)
- [ ] Edge cases handled
- [ ] Error handling implemented

### Testing
- [ ] Unit tests added
- [ ] Integration tests added (if applicable)
- [ ] All tests pass
- [ ] Test coverage maintained/improved

### Documentation
- [ ] Code comments added
- [ ] JSDoc added for public APIs
- [ ] README updated (if needed)
- [ ] API documentation updated (if needed)
- [ ] CHANGELOG updated

### Security
- [ ] No sensitive data in code
- [ ] Input validation implemented
- [ ] Authentication/authorization checked
- [ ] No SQL/NoSQL injection vulnerabilities

---

## Getting Help

- **Documentation**: Check [README.md](README.md) and [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)
- **Issues**: Search existing issues or open a new one
- **Discussions**: Use GitHub Discussions for questions
- **Contact**: Reach out to maintainers

---

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Credited in release notes
- Mentioned in project documentation

---

Thank you for contributing to Nexus Backend! 🎉

Your contributions make this project better for everyone.

