// Seed users script - TypeScript version
// Run with: ts-node -r tsconfig-paths/register scripts/seed-users.ts

import mongoose from "mongoose";
import { connectDB } from "../src/config";
import { UserModel } from "../src/models/user.model";
import { RoleModel } from "../src/models/role.model";

async function main() {
  try {
    console.log("🌱 Starting seed process...\n");

    // Connect DB
    await connectDB();

    // Ensure roles exist
    const roleNames = ["ADMIN", "MANAGER", "USER", "GUEST"] as const;
    const existingRoles = await RoleModel.find({ 
      name: { $in: roleNames as any } 
    });
    const existingRoleNames = existingRoles.map((r) => r.name);

    for (const rn of roleNames) {
      if (!existingRoleNames.includes(rn as any)) {
        console.log(`✨ Creating role: ${rn}`);
        await RoleModel.create({ name: rn, description: `${rn} role` });
      }
    }

    const roles = await RoleModel.find({ 
      name: { $in: roleNames as any } 
    });
    const roleByName = roles.reduce((acc: any, r: any) => {
      acc[r.name] = r._id;
      return acc;
    }, {});

    console.log(`✅ Roles ready: ${Object.keys(roleByName).join(", ")}\n`);

    // User templates
    const templates = [
      {
        email: "admin@example.com",
        name: "Admin User",
        firstName: "Admin",
        lastName: "User",
        password: "Admin@1234",
        age: 30,
        profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
        isVerified: true,
        role: [roleByName["ADMIN"]],
        permissions: [{ action: "manage", subject: "all" }],
        lastLoginAt: new Date("2025-10-31T10:30:00.000Z"),
        createdAt: new Date("2025-01-01T00:00:00.000Z"),
        updatedAt: new Date("2025-10-31T10:30:00.000Z"),
      },
      {
        email: "manager@example.com",
        name: "Manager User",
        firstName: "Manager",
        lastName: "User",
        password: "Manager@1234",
        age: 28,
        profileImage:
          "https://api.dicebear.com/7.x/avataaars/svg?seed=Manager",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Manager",
        isVerified: true,
        role: [roleByName["MANAGER"]],
        permissions: [
          { action: "read", subject: "Dashboard" },
          { action: "read", subject: "Chat" },
          { action: "read", subject: "Notifications" },
          { action: "read", subject: "Maps" },
          { action: "read", subject: "Hello" },
          { action: "read", subject: "UserForm" },
          { action: "create", subject: "UserForm" },
          { action: "update", subject: "UserForm" },
          { action: "delete", subject: "UserForm" },
          { action: "read", subject: "Settings" },
          { action: "update", subject: "Settings" },
        ],
        lastLoginAt: new Date("2025-10-31T09:15:00.000Z"),
        createdAt: new Date("2025-02-15T00:00:00.000Z"),
        updatedAt: new Date("2025-10-31T09:15:00.000Z"),
      },
      {
        email: "user@example.com",
        name: "Regular User",
        firstName: "Regular",
        lastName: "User",
        password: "User@1234",
        age: 25,
        profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=User",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=User",
        isVerified: true,
        role: [roleByName["USER"]],
        permissions: [
          { action: "read", subject: "Dashboard" },
          { action: "read", subject: "Chat" },
          { action: "read", subject: "Notifications" },
          { action: "read", subject: "Hello" },
          { action: "read", subject: "UserForm" },
          { action: "update", subject: "UserForm" },
          { action: "read", subject: "Settings" },
        ],
        lastLoginAt: new Date("2025-10-31T08:00:00.000Z"),
        createdAt: new Date("2025-03-20T00:00:00.000Z"),
        updatedAt: new Date("2025-10-31T08:00:00.000Z"),
      },
      {
        email: "guest@example.com",
        name: "Guest User",
        firstName: "Guest",
        lastName: "User",
        password: "Guest@1234",
        age: 22,
        profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest",
        isVerified: false,
        role: [roleByName["GUEST"]],
        permissions: [{ action: "read", subject: "Dashboard" }],
        lastLoginAt: new Date("2025-10-30T20:00:00.000Z"),
        createdAt: new Date("2025-10-28T00:00:00.000Z"),
        updatedAt: new Date("2025-10-30T20:00:00.000Z"),
      },
    ];

    const created = [];

    for (const t of templates) {
      // remove existing user if any
      await UserModel.deleteOne({ email: t.email });

      console.log(`🔨 Creating user: ${t.email}`);

      // Create user - set timestamps explicitly so mongoose uses them
      const u = new UserModel({
        name: t.name,
        firstName: t.firstName,
        lastName: t.lastName,
        email: t.email,
        password: t.password,
        age: t.age,
        profileImage: t.profileImage,
        avatar: t.avatar,
        isVerified: t.isVerified,
        role: t.role,
        permissions: t.permissions,
        lastLoginAt: t.lastLoginAt,
      });

      // Manually set timestamps to bypass auto timestamps
      (u as any).createdAt = t.createdAt;
      (u as any).updatedAt = t.updatedAt;

      await u.save();

      // Re-query to include password (select +password) and populate role
      const saved = await UserModel.findById(u._id)
        .populate("role", "name")
        .select("+password")
        .lean();

      if (!saved) continue;

      // Normalize output similar to provided samples
      const out = {
        _id: saved._id,
        email: saved.email,
        name: saved.name,
        firstName:
          saved.firstName || (saved.name ? saved.name.split(" ")[0] : ""),
        lastName:
          saved.lastName ||
          (saved.name ? saved.name.split(" ").slice(1).join(" ") : ""),
        password: saved.password, // hashed
        age: saved.age,
        profileImage: saved.profileImage,
        avatar: saved.avatar,
        isVerified: saved.isVerified,
        role: Array.isArray(saved.role)
          ? saved.role.map((r: any) => {
              // role might be ObjectId; if populated show name, otherwise id
              return r && r.name ? { name: r.name } : { _id: r };
            })
          : [],
        permissions: saved.permissions,
        lastLoginAt: saved.lastLoginAt,
        createdAt: saved.createdAt,
        updatedAt: saved.updatedAt,
      };

      created.push(out);
    }

    console.log("\n✅ Seed completed successfully!\n");
    console.log("📋 Created users:\n");
    console.log(JSON.stringify(created, null, 2));

    // Close mongoose
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
}

main();
