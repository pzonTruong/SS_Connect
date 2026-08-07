import { app } from './app';
import { connectDb } from './config/db';
import { env } from './config/env';
import { startReminderScheduler } from './services/reminder.service';

const start = async () => {
  await connectDb();
  startReminderScheduler(1);
  app.listen(env.port, () => {
    console.log(`Backend running at http://localhost:${env.port}`);
  });
};

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
