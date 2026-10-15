import { describe, it, expect } from "vitest";
import { CalculationService } from "../../src/services/calculation.service";
import { DailyLimitStatus } from "@monthly-budgeting-app/shared";

describe("US-05: Unit Test Aturan Bisnis Daily Spending Limit (Fitur Utama)", () => {
  describe("Kasus Uji Standar & Formula Normal", () => {
    it("menghitung Daily Limit contoh spesifikasi (1.000.000 / 750.000 / 10 hari = 25.000)", () => {
      const result = CalculationService.CalculateDailyLimit(
        1000000,
        750000,
        10,
        true,
        "Makanan",
        1
      );

      expect(result.DailyLimit).toBe(25000);
      expect(result.RemainingBudget).toBe(250000);
      expect(result.RemainingDays).toBe(10);
      expect(result.Status).toBe(DailyLimitStatus.NORMAL);
      expect(result.Message).toBe("Budget dalam batas aman.");
    });

    it("melakukan pembulatan ke bawah (floor) ke Rupiah utuh", () => {
      // 100.000 / 3 hari = 33.333,333... -> 33.333
      const result = CalculationService.CalculateDailyLimit(100000, 0, 3, true, "Transportasi", 2);
      expect(result.DailyLimit).toBe(33333);
      expect(result.Status).toBe(DailyLimitStatus.NORMAL);
    });
  });

  describe("Aturan Urutan Kasus Khusus (Edge Cases)", () => {
    it("Kasus Khusus 1 (NO_BUDGET): Kategori tanpa budget mengembalikan limit 0", () => {
      const result = CalculationService.CalculateDailyLimit(0, 50000, 10, false, "Lainnya", 5);
      expect(result.DailyLimit).toBe(0);
      expect(result.Status).toBe(DailyLimitStatus.NO_BUDGET);
      expect(result.Message).toBe("Budget belum diatur untuk kategori ini.");
    });

    it("Kasus Khusus 2 (PERIOD_ENDED): Periode berakhir mengembalikan limit 0 tanpa pembagian nol", () => {
      const result = CalculationService.CalculateDailyLimit(1000000, 500000, 0, true, "Kos", 3);
      expect(result.DailyLimit).toBe(0);
      expect(result.RemainingDays).toBe(0);
      expect(result.Status).toBe(DailyLimitStatus.PERIOD_ENDED);
      expect(result.Message).toBe("Periode anggaran telah berakhir.");
    });

    it("Kasus Khusus 3 (BUDGET_EXCEEDED): Pengeluaran melebihi budget mengembalikan limit 0", () => {
      const result = CalculationService.CalculateDailyLimit(1000000, 1200000, 10, true, "Hiburan", 4);
      expect(result.DailyLimit).toBe(0);
      expect(result.RemainingBudget).toBe(-200000);
      expect(result.Status).toBe(DailyLimitStatus.BUDGET_EXCEEDED);
      expect(result.Message).toBe("Budget telah melebihi batas.");
    });

    it("Kasus Khusus 4 (BUDGET_EMPTY): Budget habis tepat (sisa 0) mengembalikan limit 0", () => {
      const result = CalculationService.CalculateDailyLimit(1000000, 1000000, 10, true, "Makanan", 1);
      expect(result.DailyLimit).toBe(0);
      expect(result.RemainingBudget).toBe(0);
      expect(result.Status).toBe(DailyLimitStatus.BUDGET_EMPTY);
      expect(result.Message).toBe("Budget sudah habis.");
    });
  });

  describe("Aturan Perhitungan Sisa Hari (RemainingDays)", () => {
    it("menghitung sisa hari inklusif hari ini pada bulan berjalan", () => {
      // Mei memiliki 31 hari. Tanggal 15 Mei -> Sisa hari: 31 - 15 + 1 = 17 hari
      const midMay = new Date(2024, 4, 15);
      expect(CalculationService.CalculateRemainingDays(5, 2024, midMay)).toBe(17);

      // Hari terakhir bulan berjalan: 31 Mei -> 31 - 31 + 1 = 1 hari
      const endMay = new Date(2024, 4, 31);
      expect(CalculationService.CalculateRemainingDays(5, 2024, endMay)).toBe(1);
    });

    it("mengembalikan 0 hari untuk bulan yang telah lewat", () => {
      const todayInMay = new Date(2024, 4, 15);
      // Cek April 2024 (sudah lewat)
      expect(CalculationService.CalculateRemainingDays(4, 2024, todayInMay)).toBe(0);
      // Cek Desember 2023 (tahun lalu)
      expect(CalculationService.CalculateRemainingDays(12, 2023, todayInMay)).toBe(0);
    });

    it("mengembalikan total hari sebulan penuh untuk bulan mendatang", () => {
      const todayInMay = new Date(2024, 4, 15);
      // Juni memiliki 30 hari
      expect(CalculationService.CalculateRemainingDays(6, 2024, todayInMay)).toBe(30);
      // Juli memiliki 31 hari
      expect(CalculationService.CalculateRemainingDays(7, 2024, todayInMay)).toBe(31);
    });

    it("menghitung Februari tahun kabisat (29 hari) vs non-kabisat (28 hari)", () => {
      const testDate = new Date(2023, 0, 1);
      // 2024 adalah kabisat
      expect(CalculationService.CalculateRemainingDays(2, 2024, testDate)).toBe(29);
      // 2023 adalah non-kabisat
      expect(CalculationService.CalculateRemainingDays(2, 2023, testDate)).toBe(28);
    });
  });
});
