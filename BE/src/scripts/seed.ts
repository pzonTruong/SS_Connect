/**
 * Seed script — creates a regular user and an admin account for testing.
 * Run with:  npx tsx src/scripts/seed.ts
 */

import mongoose from 'mongoose';
import { env } from '../config/env';
import { UserModel } from '../models/user.model';
import { hashPassword } from '../utils/hash';

const TEST_ACCOUNTS = [
  {
    email: 'user@ssconnect.dev',
    password: 'User1234!',
    displayName: 'Test User',
    role: 'user' as const,
  },
  {
    email: 'admin@ssconnect.dev',
    password: 'Admin1234!',
    displayName: 'Admin',
    role: 'admin' as const,
  },
];

async function seed() {
  console.log('🌱 Connecting to database…');
  await mongoose.connect(env.mongoUri);
  console.log('✅ Connected.\n');

  for (const account of TEST_ACCOUNTS) {
    const existing = await UserModel.findOne({ email: account.email });

    if (existing) {
      // Update password in case it changed, and ensure role/verified flags are correct
      existing.password = await hashPassword(account.password);
      existing.isEmailVerified = true;
      existing.role = account.role;
      existing.displayName = account.displayName;
      await existing.save();
      console.log(`🔄 Updated  [${account.role}] ${account.email}`);
    } else {
      await UserModel.create({
        email: account.email,
        password: await hashPassword(account.password),
        displayName: account.displayName,
        role: account.role,
        isEmailVerified: true,
      });
      console.log(`➕ Created  [${account.role}] ${account.email}`);
    }
  }

  console.log('\n--- Test Credentials ---');
  for (const a of TEST_ACCOUNTS) {
    console.log(`  ${a.role.padEnd(6)} → ${a.email}  /  ${a.password}`);
  }
  console.log('------------------------\n');

  await mongoose.disconnect();
  console.log('👋 Done.');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
