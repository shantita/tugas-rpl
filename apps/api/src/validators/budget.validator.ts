import { z } from "zod";

export const BudgetSchema = z.object({
  CategoryId: z.coerce.number().int().positive({ message: "Kategori wajib dipilih" }),
  Amount: z.coerce.number().positive({ message: "Jumlah anggaran harus lebih besar dari 0" }),
  Month: z.coerce.number().int().min(1, { message: "Bulan harus antara 1 sampai 12" }).max(12, { message: "Bulan harus antara 1 sampai 12" }),
  Year: z.coerce.number().int().min(1900, { message: "Tahun tidak valid" }).max(2100, { message: "Tahun tidak valid" }),
});

export type BudgetInput = z.infer<typeof BudgetSchema>;
