import { z } from 'zod';

export const sendCodeSchema = z.object({
  phone: z.string().trim().regex(/^\+\d{10,15}$/, 'phone must be a valid E.164 number')
});

export const verifyCodeSchema = z.object({
  phone: z.string().trim().regex(/^\+\d{10,15}$/, 'phone must be a valid E.164 number'),
  code: z.string().trim().regex(/^\d{6}$/, 'code must be a 6-digit number')
});

export type SendCodeBody = z.infer<typeof sendCodeSchema>;
export type VerifyCodeBody = z.infer<typeof verifyCodeSchema>;
