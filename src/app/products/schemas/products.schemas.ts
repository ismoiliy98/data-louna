import { z } from 'zod';

export const readProductSchema = z.object({
  id: z.coerce.number().min(1),
});

export const purchaseProductSchema = z.object({
  productId: z.coerce.number().min(1),
  quantity: z.coerce.number().min(1),
});
