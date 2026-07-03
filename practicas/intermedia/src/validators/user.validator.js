import { z } from 'zod';

const email = z.string().email().transform((v) => v.trim().toLowerCase());
const address = z.object({
  street: z.string().min(2).trim(),
  number: z.string().min(1).trim(),
  postal: z.string().min(4).max(10).trim(),
  city: z.string().min(2).trim(),
  province: z.string().min(2).trim()
});

export const registerSchema = z.object({ body: z.object({
  email, password: z.string().min(8).max(72)
}) });
export const validationSchema = z.object({ body: z.object({ code: z.string().regex(/^\d{6}$/) }) });
export const loginSchema = registerSchema;
export const personalSchema = z.object({ body: z.object({
  name: z.string().min(2).trim(),
  lastName: z.string().min(2).trim(),
  nif: z.string().min(8).max(12).trim().transform((v) => v.toUpperCase()),
  address: address.optional()
}) });
export const companySchema = z.object({ body: z.discriminatedUnion('isFreelance', [
  z.object({ isFreelance: z.literal(true) }),
  z.object({
    isFreelance: z.literal(false),
    name: z.string().min(2).trim(),
    cif: z.string().min(8).max(12).trim().transform((v) => v.toUpperCase()),
    address
  })
]) });
export const refreshSchema = z.object({ body: z.object({ refreshToken: z.string().min(20) }) });
export const passwordSchema = z.object({ body: z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8).max(72)
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'La nueva contraseña debe ser diferente', path: ['newPassword']
}) });
export const inviteSchema = z.object({ body: z.object({
  email,
  password: z.string().min(8).max(72)
}) });
export const deleteSchema = z.object({ query: z.object({
  soft: z.enum(['true', 'false']).optional().default('true')
}) });
