import { z } from 'zod';

export const updateProfileSchema = z.object({
  // Allow empty string OR a non-empty string; treat empty as "clear the field"
  displayName: z.string().trim().max(100).optional(),
  bio: z.string().trim().max(200).optional(),
  // Phone: either omitted, empty (to clear), or a valid-length number string
  phone: z
    .string()
    .trim()
    .transform((v) => (v === '' ? undefined : v))
    .pipe(z.string().min(7).max(20).optional())
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
