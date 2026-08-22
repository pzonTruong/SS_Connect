import mongoose from 'mongoose';
import dns from 'dns';
import { env } from './env';

dns.setServers(['8.8.8.8', '8.8.4.4']);

export const connectDb = async () => {
  await mongoose.connect(env.mongoUri);
};

