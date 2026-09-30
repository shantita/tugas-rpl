import { z } from "zod";

export const PeriodQuerySchema = z.object({
  Month: z.coerce.number().int().min(1).max(12).optional(),
  Year: z.coerce.number().int().min(1900).max(2100).optional(),
});

export type PeriodQueryInput = z.infer<typeof PeriodQuerySchema>;
