import { z } from 'zod';

const id = z.coerce.number().int().positive();

export const registerSchema = z.object({ body: z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(72)
}) });

export const loginSchema = z.object({ body: z.object({
  email: z.string().email().transform((value) => value.toLowerCase()),
  password: z.string().min(1)
}) });

export const idSchema = z.object({ params: z.object({ id }) });

export const bookSchema = z.object({ body: z.object({
  isbn: z.string().min(10).max(17),
  title: z.string().min(2).max(200).trim(),
  author: z.string().min(2).max(150).trim(),
  genre: z.string().min(2).max(80).trim(),
  description: z.string().max(2000).optional(),
  publishedYear: z.number().int().min(1450).max(new Date().getFullYear()),
  copies: z.number().int().min(1).default(1)
}) });

export const updateBookSchema = z.object({ body: bookSchema.shape.body.partial(), params: z.object({ id }) });
export const loanSchema = z.object({ body: z.object({ bookId: id }) });
export const reviewSchema = z.object({
  params: z.object({ id }),
  body: z.object({ rating: z.number().int().min(1).max(5), comment: z.string().max(1000).optional() })
});
