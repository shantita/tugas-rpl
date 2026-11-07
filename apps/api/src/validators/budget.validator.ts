import { z } from "zod";
import { BudgetType } from "@monthly-budgeting-app/shared";

export const BudgetSchema = z
  .object({
    CategoryId: z.coerce.number().int().positive({ message: "Kategori wajib dipilih" }),
    Amount: z.coerce.number().positive({ message: "Jumlah anggaran harus lebih besar dari 0" }),
    Month: z.coerce
      .number()
      .int()
      .min(0, { message: "Bulan harus antara 1 sampai 12" })
      .max(12, { message: "Bulan harus antara 1 sampai 12" })
      .default(0),
    Year: z.coerce
      .number()
      .int()
      .min(0, { message: "Tahun tidak valid" })
      .max(2100, { message: "Tahun tidak valid" })
      .default(0),
    Type: z.nativeEnum(BudgetType).default(BudgetType.TEMPORARY),
  })
  .superRefine((data, ctx) => {
    if (data.Type === BudgetType.TEMPORARY) {
      if (data.Month < 1 || data.Month > 12) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Bulan harus antara 1 sampai 12",
          path: ["Month"],
        });
      }
      if (data.Year < 1900 || data.Year > 2100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Tahun tidak valid",
          path: ["Year"],
        });
      }
    }
  });

export type BudgetInput = z.infer<typeof BudgetSchema>;
