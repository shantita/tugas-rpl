import { z } from "zod";

export const CategorySchema = z.object({
  Name: z.string().trim().min(1, { message: "Nama kategori wajib diisi" }),
});

export type CategoryInput = z.infer<typeof CategorySchema>;
