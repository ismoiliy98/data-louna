import { z } from 'zod';

export const authCredentialsSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters long')
    .max(64, 'Username must be at most 64 characters long'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .max(64, 'Password must be at most 64 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one digit')
    .regex(
      /[!@#$%\^&*]/,
      'Password must contain at least one special character (!@#$%^&*)'
    ),
});

export const authChangePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: authCredentialsSchema.shape.password,
});
