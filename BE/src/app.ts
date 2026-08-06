import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorMiddleware } from './middlewares/error.middleware';
import { authRouter } from './routes/auth.route';
import { profileRouter } from './routes/profile.route';
import { bookingRouter } from './routes/booking.route';
import { adminRouter } from './routes/admin.route';

export const app = express();

const ALLOWED_ORIGINS = [
  env.clientUrl,                   // production URL (from .env)
  'http://localhost:5173',         // Vite dev server
  'http://localhost:4173',         // Vite preview
];

app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

app.get("/", (req, res) => {
    res.json({ message: "Welcome to the API" })
})

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/admin', adminRouter);
app.use(errorMiddleware);

