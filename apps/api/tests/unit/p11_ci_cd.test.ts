import { describe, it, expect } from "vitest";
import { CalculationService } from "../../src/services/calculation.service";
import { BudgetSchema } from "../../src/validators/budget.validator";
import { IncomeSchema } from "../../src/validators/income.validator";
import { BudgetStatus, DailyLimitStatus, BudgetType } from "@monthly-budgeting-app/shared";

describe("Tugas P11: 139 Comprehensive CI/CD Unit Tests (Total Menjadi 200 UT)", () => {
  describe("1. Simulasi CI/CD Quality Gate (Bug Fixed)", () => {
    it("simulasi deteksi bug pengeluaran: harus PASSED setelah kalkulasi diperbaiki", () => {
      const budget = 1000000;
      const expense = 300000;
      const remaining = CalculationService.CalculateRemainingBudget(budget, expense);
      // SETELAH DIPERBAIKI (BUG FIXED): Mengharapkan nilai riil 700000
      // Unit test lulus (PASSED), pipeline CI/CD mengizinkan Auto-Build & Deploy!
      expect(remaining).toBe(700000);
    });
  });

  describe("2. Parameterized Tests: CalculateBalance (20 Kasus)", () => {
    const balanceCases = [
      [1000000, 500000, 500000],
      [5000000, 2000000, 3000000],
      [2500000, 2500000, 0],
      [1000000, 1500000, 0], // Saldo tidak boleh negatif (Math.max(0, ...))
      [0, 500000, 0],
      [10000000, 0, 10000000],
      [3500000, 1250000, 2250000],
      [4200000, 3100000, 1100000],
      [750000, 250000, 500000],
      [800000, 800000, 0],
      [900000, 950000, 0],
      [1200000, 300000, 900000],
      [6000000, 4500000, 1500000],
      [15000000, 5000000, 10000000],
      [200000, 50000, 150000],
      [300000, 100000, 200000],
      [450000, 150000, 300000],
      [100000, 20000, 80000],
      [50000, 50000, 0],
      [1000000, 1, 999999],
    ];

    balanceCases.forEach(([inc, exp, expected], idx) => {
      it(`kasus saldo #${idx + 1}: pemasukan ${inc} - pengeluaran ${exp} = ${expected}`, () => {
        expect(CalculationService.CalculateBalance(inc, exp)).toBe(expected);
      });
    });
  });

  describe("3. Parameterized Tests: CalculateUsagePercentage (20 Kasus)", () => {
    const usageCases = [
      [1000000, 0, 0],
      [1000000, 500000, 50],
      [1000000, 800000, 80],
      [1000000, 1000000, 100],
      [1000000, 1200000, 120],
      [0, 500000, 0], // budget 0 menghasilkan 0%
      [2000000, 500000, 25],
      [4000000, 3000000, 75],
      [500000, 450000, 90],
      [800000, 792000, 99],
      [5000000, 2500000, 50],
      [10000000, 1000000, 10],
      [3000000, 600000, 20],
      [2500000, 750000, 30],
      [1500000, 600000, 40],
      [1200000, 720000, 60],
      [700000, 490000, 70],
      [850000, 722500, 85],
      [900000, 855000, 95],
      [100000, 150000, 150],
    ];

    usageCases.forEach(([b, e, expected], idx) => {
      it(`kasus persentase #${idx + 1}: belanja ${e} dari budget ${b} = ${expected}%`, () => {
        expect(CalculationService.CalculateUsagePercentage(b, e)).toBe(expected);
      });
    });
  });

  describe("4. Parameterized Tests: DetermineBudgetStatus (20 Kasus)", () => {
    const statusCases = [
      [0, BudgetStatus.SAFE],
      [30, BudgetStatus.SAFE],
      [59.9, BudgetStatus.SAFE],
      [60, BudgetStatus.WARNING],
      [70, BudgetStatus.WARNING],
      [79.9, BudgetStatus.WARNING],
      [80, BudgetStatus.NEAR_LIMIT],
      [85, BudgetStatus.NEAR_LIMIT],
      [90, BudgetStatus.NEAR_LIMIT],
      [99.9, BudgetStatus.NEAR_LIMIT],
      [100, BudgetStatus.EXCEEDED],
      [105, BudgetStatus.EXCEEDED],
      [150, BudgetStatus.EXCEEDED],
      [10, BudgetStatus.SAFE],
      [25, BudgetStatus.SAFE],
      [40, BudgetStatus.SAFE],
      [65, BudgetStatus.WARNING],
      [75, BudgetStatus.WARNING],
      [95, BudgetStatus.NEAR_LIMIT],
      [200, BudgetStatus.EXCEEDED],
    ];

    statusCases.forEach(([pct, expected], idx) => {
      it(`ambang batas #${idx + 1}: persentase ${pct}% berstatus ${expected}`, () => {
        expect(CalculationService.DetermineBudgetStatus(pct)).toBe(expected);
      });
    });
  });

  describe("5. Parameterized Tests: CalculateRemainingDays (25 Kasus)", () => {
    const dayCases = [
      [1, 2026, new Date(2026, 0, 1), 31],
      [1, 2026, new Date(2026, 0, 15), 17],
      [1, 2026, new Date(2026, 0, 31), 1],
      [2, 2026, new Date(2026, 1, 1), 28], // Bukan kabisat: 28 hari
      [2, 2026, new Date(2026, 1, 28), 1],
      [2, 2024, new Date(2024, 1, 1), 29], // Tahun kabisat: 29 hari
      [2, 2024, new Date(2024, 1, 29), 1],
      [4, 2026, new Date(2026, 3, 1), 30],
      [4, 2026, new Date(2026, 3, 10), 21],
      [4, 2026, new Date(2026, 3, 30), 1],
      [5, 2026, new Date(2026, 4, 1), 31],
      [6, 2026, new Date(2026, 5, 1), 30],
      [7, 2026, new Date(2026, 6, 1), 31],
      [8, 2026, new Date(2026, 7, 1), 31],
      [9, 2026, new Date(2026, 8, 1), 30],
      [10, 2026, new Date(2026, 9, 1), 31],
      [11, 2026, new Date(2026, 10, 1), 30],
      [11, 2026, new Date(2026, 10, 21), 10],
      [12, 2026, new Date(2026, 11, 1), 31],
      [12, 2026, new Date(2026, 11, 31), 1],
      // Periode masa lalu menghasilkan 0 sisa hari
      [1, 2025, new Date(2026, 5, 1), 0],
      [10, 2025, new Date(2026, 0, 1), 0],
      // Periode masa depan menghasilkan jumlah hari penuh bulan tersebut
      [1, 2027, new Date(2026, 5, 1), 31],
      [2, 2028, new Date(2026, 5, 1), 29], // Kabisat 2028: 29 hari
      [4, 2027, new Date(2026, 5, 1), 30],
    ];

    dayCases.forEach(([m, y, curDate, expected], idx) => {
      it(`kasus sisa hari #${idx + 1}: bulan ${m}/${y} pada tanggal ${curDate.toISOString().slice(0, 10)} = ${expected} hari`, () => {
        expect(CalculationService.CalculateRemainingDays(m, y, curDate)).toBe(expected);
      });
    });
  });

  describe("6. Parameterized Tests: DailyLimit Formula (30 Kasus)", () => {
    for (let i = 1; i <= 30; i++) {
      const budget = 3000000;
      const expense = i * 50000;
      const remainingDays = 31 - i;
      it(`evaluasi batas harian iterasi #${i}: hari ke-${i}`, () => {
        const item = CalculationService.CalculateDailyLimit(budget, expense, remainingDays, true, "Total");
        expect(item.Status).toBeDefined();
        expect(item.DailyLimit).toBeGreaterThanOrEqual(0);
      });
    }
  });

  describe("7. Parameterized Tests: Budget & Income Schema Validation (23 Kasus)", () => {
    const validBudgets = [
      { CategoryId: 1, Amount: 500000, Month: 1, Year: 2026 },
      { CategoryId: 2, Amount: 1200000, Month: 6, Year: 2026 },
      { CategoryId: 3, Amount: 800000, Month: 12, Year: 2026 },
      { CategoryId: 4, Amount: 450000, Type: BudgetType.FIXED },
      { CategoryId: 5, Amount: 300000, Type: BudgetType.TEMPORARY, Month: 5, Year: 2026 },
      { CategoryId: 1, Amount: 1000000, Type: BudgetType.FIXED },
      { CategoryId: 2, Amount: 750000, Month: 2, Year: 2026 },
      { CategoryId: 3, Amount: 200000, Month: 3, Year: 2026 },
      { CategoryId: 4, Amount: 150000, Month: 4, Year: 2026 },
      { CategoryId: 5, Amount: 950000, Month: 7, Year: 2026 },
      { CategoryId: 1, Amount: 2500000, Month: 8, Year: 2026 },
      { CategoryId: 2, Amount: 350000, Month: 9, Year: 2026 },
    ];

    validBudgets.forEach((b, idx) => {
      it(`validasi anggaran valid #${idx + 1}`, () => {
        expect(BudgetSchema.safeParse(b).success).toBe(true);
      });
    });

    const validIncomes = [
      { Amount: 5000000, Date: new Date().toISOString(), Description: "[TETAP] Gaji Pokok" },
      { Amount: 1500000, Date: new Date().toISOString(), Description: "[TIDAK TETAP] Freelance Web" },
      { Amount: 750000, Date: new Date().toISOString(), Description: "[TIDAK TETAP] Bonus Kinerja" },
      { Amount: 2000000, Date: new Date().toISOString(), Description: "[TETAP] Uang Saku Bulanan" },
      { Amount: 300000, Date: new Date().toISOString(), Description: "[TIDAK TETAP] Jual Barang Bekas" },
      { Amount: 400000, Date: new Date().toISOString(), Description: "[TIDAK TETAP] Komisi Affiliate" },
      { Amount: 1000000, Date: new Date().toISOString(), Description: "[TETAP] Beasiswa Pendidikan" },
      { Amount: 500000, Date: new Date().toISOString(), Description: "Pemasukan Lainnya" },
      { Amount: 250000, Date: new Date().toISOString(), Description: "[TIDAK TETAP] Cashback Bank" },
      { Amount: 600000, Date: new Date().toISOString(), Description: "[TETAP] Honor Asisten Lab" },
      { Amount: 850000, Date: new Date().toISOString(), Description: "[TIDAK TETAP] Hadiah Lomba" },
    ];

    validIncomes.forEach((inc, idx) => {
      it(`validasi pemasukan valid #${idx + 1}`, () => {
        expect(IncomeSchema.safeParse(inc).success).toBe(true);
      });
    });
  });
});
