import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'name is required'),
  phone: z.string().trim().regex(/^\+\d{10,15}$/, 'phone must be a valid E.164 number')
});

export type RegisterBody = z.infer<typeof registerSchema>;
