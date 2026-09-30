import { z } from "zod";

export const IncomeSchema = z.object({
  Amount: z.coerce.number().positive({ message: "Jumlah pemasukan harus lebih besar dari 0" }),
  Date: z.coerce.date({ message: "Format tanggal tidak valid" }),
  Description: z.string().trim().min(1, { message: "Keterangan wajib diisi" }),
});

export type IncomeInput = z.infer<typeof IncomeSchema>;
