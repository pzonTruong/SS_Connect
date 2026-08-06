import mongoose from 'mongoose';
import { env } from '../config/env';
import { UserModel } from '../models/user.model';

async function run() {
  const email = process.argv[2];
  if (!email) {
    console.error('Please specify email');
    process.exit(1);
  }
  await mongoose.connect(env.mongoUri);
  const user = await UserModel.findOne({ email }).select('otpCode');
  if (!user) {
    console.log('User not found');
  } else {
    console.log(`OTP_CODE:${user.otpCode}`);
  }
  await mongoose.disconnect();
}

run().catch(console.error);
