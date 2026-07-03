import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i);
const address = z.object({
  street: z.string().min(2), number: z.string().min(1), postal: z.string().min(4),
  city: z.string().min(2), province: z.string().min(2)
});
export const idSchema = z.object({ params: z.object({ id: objectId }) });
export const clientSchema = z.object({ body: z.object({
  name: z.string().min(2).trim(),
  cif: z.string().min(8).max(12).transform((v) => v.toUpperCase()),
  email: z.string().email().transform((v) => v.toLowerCase()),
  phone: z.string().min(7).max(20).optional(),
  address
}) });
export const clientUpdateSchema = z.object({
  params: z.object({ id: objectId }), body: clientSchema.shape.body.partial()
});
export const projectSchema = z.object({ body: z.object({
  client: objectId,
  name: z.string().min(2).trim(),
  projectCode: z.string().min(2).max(30).transform((v) => v.toUpperCase()),
  address,
  email: z.string().email().optional(),
  notes: z.string().max(2000).optional(),
  active: z.boolean().optional()
}) });
export const projectUpdateSchema = z.object({
  params: z.object({ id: objectId }), body: projectSchema.shape.body.partial()
});
const common = {
  client: objectId, project: objectId, description: z.string().min(3).max(2000),
  workDate: z.coerce.date()
};
const deliveryBody = z.discriminatedUnion('format', [
  z.object({
    ...common, format: z.literal('material'), material: z.string().min(2),
    quantity: z.number().positive(), unit: z.string().min(1)
  }),
  z.object({
    ...common, format: z.literal('hours'), hours: z.number().positive().optional(),
    workers: z.array(z.object({ name: z.string().min(2), hours: z.number().positive() })).optional()
  })
]).refine((data) => data.format !== 'hours' || data.hours || data.workers?.length, {
  message: 'Indica horas o trabajadores'
});
export const deliverySchema = z.object({ body: deliveryBody });
