import { describe, it, expect } from "vitest";
import { BudgetSchema } from "../../src/validators/budget.validator";
import { CalculationService } from "../../src/services/calculation.service";
import { BudgetStatus, BudgetStatusLabels } from "@monthly-budgeting-app/shared";

describe("US-04: Unit Test Aturan Bisnis Anggaran & Ambang Batas Status", () => {
  describe("Validasi Input Anggaran (BudgetSchema)", () => {
    it("menerima alokasi budget dengan data valid", () => {
      const validBudget = {
        CategoryId: 1,
        Amount: 1000000,
        Month: 5,
        Year: 2025,
      };

      const result = BudgetSchema.safeParse(validBudget);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.Amount).toBe(1000000);
        expect(result.data.Month).toBe(5);
        expect(result.data.Year).toBe(2025);
      }
    });

    it("menolak bulan yang berada di luar rentang 1 sampai 12", () => {
      expect(BudgetSchema.safeParse({ CategoryId: 1, Amount: 500000, Month: 0, Year: 2025 }).success).toBe(false);
      expect(BudgetSchema.safeParse({ CategoryId: 1, Amount: 500000, Month: 13, Year: 2025 }).success).toBe(false);
      expect(BudgetSchema.safeParse({ CategoryId: 1, Amount: 500000, Month: -1, Year: 2025 }).success).toBe(false);
    });

    it("menolak anggaran dengan nominal 0 atau negatif", () => {
      expect(BudgetSchema.safeParse({ CategoryId: 1, Amount: 0, Month: 5, Year: 2025 }).success).toBe(false);
      expect(BudgetSchema.safeParse({ CategoryId: 1, Amount: -100000, Month: 5, Year: 2025 }).success).toBe(false);
    });
  });

  describe("Aturan Perhitungan Sisa Anggaran & Persentase", () => {
    it("menghitung sisa anggaran (RemainingBudget)", () => {
      // Normal
      expect(CalculationService.CalculateRemainingBudget(1000000, 600000)).toBe(400000);
      // Tepat habis
      expect(CalculationService.CalculateRemainingBudget(1000000, 1000000)).toBe(0);
      // Terlampaui (defisit)
      expect(CalculationService.CalculateRemainingBudget(1000000, 1250000)).toBe(-250000);
    });

    it("menghitung persentase penggunaan dengan pembagi 0 secara aman", () => {
      expect(CalculationService.CalculateUsagePercentage(1000000, 500000)).toBe(50);
      expect(CalculationService.CalculateUsagePercentage(1000000, 850000)).toBe(85);
      expect(CalculationService.CalculateUsagePercentage(0, 100000)).toBe(0);
    });
  });

  describe("Aturan 4 Ambang Batas Status Budget & Label Indonesia", () => {
    it("SAFE: Penggunaan < 60% berstatus Aman", () => {
      expect(CalculationService.DetermineBudgetStatus(0)).toBe(BudgetStatus.SAFE);
      expect(CalculationService.DetermineBudgetStatus(59.9)).toBe(BudgetStatus.SAFE);
      expect(BudgetStatusLabels[BudgetStatus.SAFE]).toBe("Aman");
    });

    it("WARNING: Penggunaan 60% s.d. < 80% berstatus Perlu Perhatian", () => {
      expect(CalculationService.DetermineBudgetStatus(60)).toBe(BudgetStatus.WARNING);
      expect(CalculationService.DetermineBudgetStatus(75)).toBe(BudgetStatus.WARNING);
      expect(CalculationService.DetermineBudgetStatus(79.9)).toBe(BudgetStatus.WARNING);
      expect(BudgetStatusLabels[BudgetStatus.WARNING]).toBe("Perlu Perhatian");
    });

    it("NEAR_LIMIT: Penggunaan 80% s.d. < 100% berstatus Mendekati Batas", () => {
      expect(CalculationService.DetermineBudgetStatus(80)).toBe(BudgetStatus.NEAR_LIMIT);
      expect(CalculationService.DetermineBudgetStatus(90)).toBe(BudgetStatus.NEAR_LIMIT);
      expect(CalculationService.DetermineBudgetStatus(99.9)).toBe(BudgetStatus.NEAR_LIMIT);
      expect(BudgetStatusLabels[BudgetStatus.NEAR_LIMIT]).toBe("Mendekati Batas");
    });

    it("EXCEEDED: Penggunaan >= 100% berstatus Melebihi Anggaran", () => {
      expect(CalculationService.DetermineBudgetStatus(100)).toBe(BudgetStatus.EXCEEDED);
      expect(CalculationService.DetermineBudgetStatus(120)).toBe(BudgetStatus.EXCEEDED);
      expect(BudgetStatusLabels[BudgetStatus.EXCEEDED]).toBe("Melebihi Anggaran");
    });
  });

  describe("Aturan Pembuatan Pesan Peringatan (Warning Messages)", () => {
    it("tidak memunculkan pesan peringatan jika status SAFE atau WARNING", () => {
      const msgSafe = CalculationService.GetWarningMessage(BudgetStatus.SAFE, "Makanan", 45);
      expect(msgSafe).toBeUndefined();

      const msgWarning = CalculationService.GetWarningMessage(BudgetStatus.WARNING, "Makanan", 70);
      expect(msgWarning).toBeUndefined();
    });

    it("memunculkan pesan peringatan saat mencapai status NEAR_LIMIT (>= 80%)", () => {
      const msgNearLimit = CalculationService.GetWarningMessage(BudgetStatus.NEAR_LIMIT, "Makanan", 82.4);
      expect(msgNearLimit).toBe("Perhatian! Penggunaan budget Makanan sudah mencapai 82%.");
    });

    it("memunculkan pesan peringatan saat mencapai status EXCEEDED (>= 100%)", () => {
      const msgExceeded = CalculationService.GetWarningMessage(BudgetStatus.EXCEEDED, "Transportasi", 115);
      expect(msgExceeded).toBe("Perhatian! Penggunaan budget Transportasi telah melebihi batas (115%).");
    });
  });
});
