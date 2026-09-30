import { z } from "zod";

export const ExpenseSchema = z.object({
  CategoryId: z.coerce.number().int().positive({ message: "Kategori wajib dipilih" }),
  Amount: z.coerce.number().positive({ message: "Jumlah pengeluaran harus lebih besar dari 0" }),
  Date: z.coerce.date({ message: "Format tanggal tidak valid" }),
  Description: z.string().trim().min(1, { message: "Keterangan wajib diisi" }),
});

export type ExpenseInput = z.infer<typeof ExpenseSchema>;
