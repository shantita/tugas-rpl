import { describe, it, expect } from "vitest";
import { IncomeSchema } from "../../src/validators/income.validator";
import { PeriodQuerySchema } from "../../src/validators/period.validator";
import { CalculationService } from "../../src/services/calculation.service";

describe("US-02: Unit Test Aturan Bisnis Pemasukan Mahasiswa", () => {
  describe("Validasi Input Pemasukan (IncomeSchema)", () => {
    it("menerima data pemasukan yang valid dengan nominal positif", () => {
      const validIncome = {
        Amount: 2500000,
        Date: "2025-05-01T08:00:00.000Z",
        Description: "Uang saku bulanan dari orang tua",
      };

      const result = IncomeSchema.safeParse(validIncome);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.Amount).toBe(2500000);
        expect(result.data.Description).toBe("Uang saku bulanan dari orang tua");
      }
    });

    it("menolak pemasukan dengan nominal 0 atau negatif", () => {
      const zeroIncome = {
        Amount: 0,
        Date: new Date().toISOString(),
        Description: "Pemasukan nol",
      };
      const negativeIncome = {
        Amount: -50000,
        Date: new Date().toISOString(),
        Description: "Pemasukan minus",
      };

      expect(IncomeSchema.safeParse(zeroIncome).success).toBe(false);
      expect(IncomeSchema.safeParse(negativeIncome).success).toBe(false);
    });

    it("menolak pemasukan jika keterangan kosong atau hanya spasi", () => {
      const emptyDescIncome = {
        Amount: 500000,
        Date: new Date().toISOString(),
        Description: "   ",
      };

      const result = IncomeSchema.safeParse(emptyDescIncome);
      expect(result.success).toBe(false);
    });

    it("menolak pemasukan jika format tanggal tidak valid", () => {
      const invalidDateIncome = {
        Amount: 500000,
        Date: "tanggal-tidak-valid-xyz",
        Description: "Honor mengajar",
      };

      const result = IncomeSchema.safeParse(invalidDateIncome);
      expect(result.success).toBe(false);
    });
  });

  describe("Aturan Perhitungan Saldo Kas (Balance Calculation)", () => {
    it("menghitung saldo positif saat pemasukan melebihi pengeluaran", () => {
      const totalIncome = 3000000;
      const totalExpense = 1750000;
      const balance = CalculationService.CalculateBalance(totalIncome, totalExpense);

      expect(balance).toBe(1250000);
    });

    it("menghitung saldo impas (0) saat pemasukan sama dengan pengeluaran", () => {
      const balance = CalculationService.CalculateBalance(2000000, 2000000);
      expect(balance).toBe(0);
    });

    it("menghitung saldo negatif (defisit) saat pengeluaran melampaui pemasukan", () => {
      const balance = CalculationService.CalculateBalance(1000000, 1400000);
      expect(balance).toBe(-400000);
    });
  });

  describe("Aturan Rentang Filter Periode Bulanan", () => {
    it("memvalidasi parameter Bulan (1-12) dan Tahun", () => {
      expect(PeriodQuerySchema.safeParse({ Month: "5", Year: "2025" }).success).toBe(true);
      expect(PeriodQuerySchema.safeParse({ Month: "13", Year: "2025" }).success).toBe(false);
      expect(PeriodQuerySchema.safeParse({ Month: "0", Year: "2025" }).success).toBe(false);
    });

    it("menghitung batas tanggal awal dan akhir bulan secara presisi (UTC boundary)", () => {
      const month = 5;
      const year = 2025;
      const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
      const endDate = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));

      expect(startDate.toISOString()).toBe("2025-05-01T00:00:00.000Z");
      expect(endDate.toISOString()).toBe("2025-06-01T00:00:00.000Z");

      // Verifikasi transaksi tepat di dalam batas
      const transactionInside = new Date(Date.UTC(2025, 4, 15)).getTime();
      expect(transactionInside >= startDate.getTime() && transactionInside < endDate.getTime()).toBe(true);

      // Verifikasi transaksi sebelum atau sesudah batas
      const transactionApril = new Date(Date.UTC(2025, 3, 30)).getTime();
      const transactionJune = new Date(Date.UTC(2025, 5, 1)).getTime();
      expect(transactionApril >= startDate.getTime()).toBe(false);
      expect(transactionJune < endDate.getTime()).toBe(false);
    });
  });
});
