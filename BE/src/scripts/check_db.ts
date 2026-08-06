import mongoose from 'mongoose';
import { env } from '../config/env';
import { UserModel } from '../models/user.model';

async function check() {
  console.log('Connecting to database...');
  await mongoose.connect(env.mongoUri);
  console.log('Connected successfully!');

  const users = await UserModel.find({}).select('email role isEmailVerified createdAt');
  console.log('\n--- Registered Users ---');
  users.forEach((u) => {
    console.log(`- [${u.role}] ${u.email} | Verified: ${u.isEmailVerified} | Created: ${u.createdAt}`);
  });
  console.log('------------------------\n');

  await mongoose.disconnect();
  console.log('Disconnected.');
}

check().catch(console.error);
