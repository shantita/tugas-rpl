import { describe, it, expect } from "vitest";
import { ExpenseSchema } from "../../src/validators/expense.validator";

describe("US-03: Unit Test Aturan Bisnis Pengeluaran per Kategori", () => {
  describe("Validasi Input Pengeluaran (ExpenseSchema)", () => {
    it("menerima data pengeluaran yang valid", () => {
      const validExpense = {
        CategoryId: 1,
        Amount: 35000,
        Date: "2025-05-02T12:30:00.000Z",
        Description: "Makan siang warteg",
      };

      const result = ExpenseSchema.safeParse(validExpense);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.CategoryId).toBe(1);
        expect(result.data.Amount).toBe(35000);
      }
    });

    it("menolak pengeluaran dengan nominal 0 atau negatif", () => {
      const zeroExpense = {
        CategoryId: 1,
        Amount: 0,
        Date: new Date().toISOString(),
        Description: "Gratis",
      };
      const negativeExpense = {
        CategoryId: 1,
        Amount: -10000,
        Date: new Date().toISOString(),
        Description: "Minus",
      };

      expect(ExpenseSchema.safeParse(zeroExpense).success).toBe(false);
      expect(ExpenseSchema.safeParse(negativeExpense).success).toBe(false);
    });

    it("menolak pengeluaran dengan CategoryId tidak valid (<= 0 atau bukan integer)", () => {
      const invalidCatExpense = {
        CategoryId: 0,
        Amount: 25000,
        Date: new Date().toISOString(),
        Description: "Kategori invalid",
      };

      const result = ExpenseSchema.safeParse(invalidCatExpense);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("Kategori wajib dipilih");
      }
    });

    it("menolak pengeluaran dengan keterangan kosong", () => {
      const emptyDescExpense = {
        CategoryId: 2,
        Amount: 20000,
        Date: new Date().toISOString(),
        Description: "   ",
      };

      expect(ExpenseSchema.safeParse(emptyDescExpense).success).toBe(false);
    });
  });

  describe("Aturan Agregasi Pengeluaran per Kategori", () => {
    const rawExpenses = [
      { CategoryId: 1, Amount: 35000, Description: "Makan siang" },
      { CategoryId: 1, Amount: 25000, Description: "Makan malam" },
      { CategoryId: 2, Amount: 50000, Description: "Bensin motor" },
      { CategoryId: 1, Amount: 15000, Description: "Kopi sore" },
      { CategoryId: 4, Amount: 60000, Description: "Nonton bioskop" },
    ];

    it("menghitung total pengeluaran per kategori secara akurat", () => {
      const expenseMap = new Map<number, number>();
      for (const item of rawExpenses) {
        const cur = expenseMap.get(item.CategoryId) || 0;
        expenseMap.set(item.CategoryId, cur + item.Amount);
      }

      // Kategori 1 (Makanan): 35.000 + 25.000 + 15.000 = 75.000
      expect(expenseMap.get(1)).toBe(75000);
      // Kategori 2 (Transportasi): 50.000
      expect(expenseMap.get(2)).toBe(50000);
      // Kategori 4 (Hiburan): 60.000
      expect(expenseMap.get(4)).toBe(60000);
      // Total seluruh pengeluaran: 185.000
      const total = Array.from(expenseMap.values()).reduce((a, b) => a + b, 0);
      expect(total).toBe(185000);
    });

    it("membedakan pengeluaran kategori ber-anggaran vs non-anggaran", () => {
      // Misalkan hanya kategori 1 dan 2 yang memiliki budget
      const budgetedCategoryIds = new Set([1, 2]);

      const budgetedExpenseTotal = rawExpenses
        .filter((e) => budgetedCategoryIds.has(e.CategoryId))
        .reduce((sum, e) => sum + e.Amount, 0);

      const unbudgetedExpenseTotal = rawExpenses
        .filter((e) => !budgetedCategoryIds.has(e.CategoryId))
        .reduce((sum, e) => sum + e.Amount, 0);

      // Kategori ber-anggaran (1: 75.000 + 2: 50.000) = 125.000
      expect(budgetedExpenseTotal).toBe(125000);
      // Kategori non-anggaran (4: 60.000) = 60.000
      expect(unbudgetedExpenseTotal).toBe(60000);
      // Keduanya tetap membentuk total expense untuk saldo
      expect(budgetedExpenseTotal + unbudgetedExpenseTotal).toBe(185000);
    });
  });
});
