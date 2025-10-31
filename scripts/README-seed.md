# Seed Users Script

This script creates the following roles (if missing): ADMIN, MANAGER, USER, GUEST
and then creates 4 users with sample permissions:

- **admin@example.com** (ADMIN role) - Password: `Admin@1234`
- **manager@example.com** (MANAGER role) - Password: `Manager@1234`
- **user@example.com** (USER role) - Password: `User@1234`
- **guest@example.com** (GUEST role) - Password: `Guest@1234`

## How to run

1. Ensure your `.env` is configured with MONGO_URI and DB_NAME. Example:

   ```env
   MONGO_URI=mongodb://localhost:27017
   DB_NAME=nexus_dev
   ```

2. Start MongoDB if it isn't running.

3. Run the TypeScript seed script from project root:

   ```bash
   npx ts-node -r tsconfig-paths/register -r dotenv/config scripts/seed-users.ts
   ```

## Output

The script will print a JSON array with created users. Each object includes:
- `_id` - MongoDB ObjectId
- `email` - User email
- `name`, `firstName`, `lastName` - User names
- `password` - Hashed password (bcrypt)
- `age` - User age
- `profileImage`, `avatar` - Profile images from dicebear
- `isVerified` - Email verification status
- `role` - Array with role name (e.g., `[{ "name": "ADMIN" }]`)
- `permissions` - Array of permission objects with `action` and `subject`
- `lastLoginAt`, `createdAt`, `updatedAt` - Timestamps

## Notes

- The script **deletes** any existing users with the same email before creating new ones
- Passwords are plain text in the script (e.g., `Admin@1234`) and are hashed automatically by Mongoose pre-save hooks
- Role names are now uppercase: ADMIN, MANAGER, USER, GUEST
- The script populates role names for nicer output
- You can run this while the server is running; it connects directly to MongoDB

## Customize

Edit `scripts/seed-users.ts` to:
- Change passwords
- Add more users
- Modify permissions
- Change profile images or other fields
