/**
 * Script to add test permissions to users
 * Run: npx ts-node -r tsconfig-paths/register scripts/add-test-permissions.ts
 */

import mongoose from 'mongoose';
import { UserModel } from '../src/models';
import { config } from '../src/config/env';

const testPermissions = {
  admin: [
    { action: 'manage', subject: 'all' },
  ],
  manager: [
    { action: 'create', subject: 'Dashboard' },
    { action: 'read', subject: 'Dashboard' },
    { action: 'update', subject: 'Dashboard' },
    { action: 'delete', subject: 'Dashboard' },
    { action: 'create', subject: 'UserForm' },
    { action: 'read', subject: 'UserForm' },
    { action: 'update', subject: 'UserForm' },
    { action: 'read', subject: 'Settings' },
    { action: 'read', subject: 'Hello' },
  ],
  user: [
    { action: 'read', subject: 'Dashboard' },
    { action: 'read', subject: 'Hello' },
    { action: 'read', subject: 'UserForm' },
    { action: 'read', subject: 'Settings' },
    { action: 'update', subject: 'UserForm' },
  ],
};

async function addPermissions() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.MAIN.mongoUri, {
      dbName: config.MAIN.dbName,
    });
    console.log('✅ Connected to MongoDB');

    // Update admin@example.com with admin permissions
    const admin = await UserModel.findOneAndUpdate(
      { email: 'admin@example.com' },
      { 
        $set: { 
          permissions: testPermissions.admin,
          isVerified: true, // Auto-verify for testing
        } 
      },
      { new: true }
    );
    
    if (admin) {
      console.log('✅ Updated admin@example.com:', {
        email: admin.email,
        permissions: admin.permissions,
        isVerified: admin.isVerified,
      });
    } else {
      console.log('⚠️  admin@example.com not found');
    }

    // Update sohailtaha128@gmail.com with user permissions
    const user = await UserModel.findOneAndUpdate(
      { email: 'sohailtaha128@gmail.com' },
      { 
        $set: { 
          permissions: testPermissions.user,
          isVerified: true, // Auto-verify for testing
        } 
      },
      { new: true }
    );
    
    if (user) {
      console.log('✅ Updated sohailtaha128@gmail.com:', {
        email: user.email,
        permissions: user.permissions,
        isVerified: user.isVerified,
      });
    } else {
      console.log('⚠️  sohailtaha128@gmail.com not found');
    }

    // Update admin1@example.com with manager permissions
    const manager = await UserModel.findOneAndUpdate(
      { email: 'admin1@example.com' },
      { 
        $set: { 
          permissions: testPermissions.manager,
          isVerified: true, // Auto-verify for testing
        } 
      },
      { new: true }
    );
    
    if (manager) {
      console.log('✅ Updated admin1@example.com:', {
        email: manager.email,
        permissions: manager.permissions,
        isVerified: manager.isVerified,
      });
    } else {
      console.log('⚠️  admin1@example.com not found');
    }

    console.log('\n🎉 All permissions added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addPermissions();

