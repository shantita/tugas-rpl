import { describe, it, expect } from "vitest";
import { CalculationService } from "../../src/services/calculation.service";
import { BudgetStatus, DailyLimitStatus } from "@monthly-budgeting-app/shared";

describe("CalculationService Unit Tests", () => {
  it("menghitung saldo (Balance) dengan benar", () => {
    const balance = CalculationService.CalculateBalance(3000000, 1200000);
    expect(balance).toBe(1800000);

    const zeroBalance = CalculationService.CalculateBalance(1000000, 1500000);
    expect(zeroBalance).toBe(0);
  });

  it("menghitung sisa anggaran (RemainingBudget) dengan benar", () => {
    const remaining = CalculationService.CalculateRemainingBudget(1000000, 750000);
    expect(remaining).toBe(250000);

    const exceededRemaining = CalculationService.CalculateRemainingBudget(1000000, 1200000);
    expect(exceededRemaining).toBe(-200000);
  });

  it("menghitung persentase penggunaan (UsagePercentage) dengan benar", () => {
    const percentage = CalculationService.CalculateUsagePercentage(1000000, 750000);
    expect(percentage).toBe(75);

    const zeroBudget = CalculationService.CalculateUsagePercentage(0, 100000);
    expect(zeroBudget).toBe(0);
  });

  it("menentukan status budget sesuai batas ambang", () => {
    expect(CalculationService.DetermineBudgetStatus(0)).toBe(BudgetStatus.SAFE);
    expect(CalculationService.DetermineBudgetStatus(59.9)).toBe(BudgetStatus.SAFE);

    expect(CalculationService.DetermineBudgetStatus(60)).toBe(BudgetStatus.WARNING);
    expect(CalculationService.DetermineBudgetStatus(79.9)).toBe(BudgetStatus.WARNING);

    expect(CalculationService.DetermineBudgetStatus(80)).toBe(BudgetStatus.NEAR_LIMIT);
    expect(CalculationService.DetermineBudgetStatus(99.9)).toBe(BudgetStatus.NEAR_LIMIT);

    expect(CalculationService.DetermineBudgetStatus(100)).toBe(BudgetStatus.EXCEEDED);
    expect(CalculationService.DetermineBudgetStatus(120)).toBe(BudgetStatus.EXCEEDED);
  });

  it("menghitung Daily Spending Limit contoh spesifikasi (1.000.000 / 750.000 / 10 hari = 25.000)", () => {
    const result = CalculationService.CalculateDailyLimit(1000000, 750000, 10, true, "Makanan", 1);
    expect(result.DailyLimit).toBe(25000);
    expect(result.RemainingBudget).toBe(250000);
    expect(result.RemainingDays).toBe(10);
    expect(result.Status).toBe(DailyLimitStatus.NORMAL);
  });

  it("menghitung Daily Spending Limit saat tidak ada budget (NO_BUDGET)", () => {
    const result = CalculationService.CalculateDailyLimit(0, 50000, 10, false, "Lainnya", 2);
    expect(result.DailyLimit).toBe(0);
    expect(result.Status).toBe(DailyLimitStatus.NO_BUDGET);
    expect(result.Message).toBe("Budget belum diatur untuk kategori ini.");
  });

  it("menghitung Daily Spending Limit saat periode telah berakhir (PERIOD_ENDED)", () => {
    const result = CalculationService.CalculateDailyLimit(1000000, 500000, 0, true, "Makanan", 1);
    expect(result.DailyLimit).toBe(0);
    expect(result.RemainingDays).toBe(0);
    expect(result.Status).toBe(DailyLimitStatus.PERIOD_ENDED);
    expect(result.Message).toBe("Periode anggaran telah berakhir.");
  });

  it("menghitung Daily Spending Limit saat melebihi budget (BUDGET_EXCEEDED)", () => {
    const result = CalculationService.CalculateDailyLimit(1000000, 1200000, 10, true, "Makanan", 1);
    expect(result.DailyLimit).toBe(0);
    expect(result.RemainingBudget).toBe(-200000);
    expect(result.Status).toBe(DailyLimitStatus.BUDGET_EXCEEDED);
    expect(result.Message).toBe("Budget telah melebihi batas.");
  });

  it("menghitung Daily Spending Limit saat budget habis (BUDGET_EMPTY)", () => {
    const result = CalculationService.CalculateDailyLimit(1000000, 1000000, 10, true, "Makanan", 1);
    expect(result.DailyLimit).toBe(0);
    expect(result.RemainingBudget).toBe(0);
    expect(result.Status).toBe(DailyLimitStatus.BUDGET_EMPTY);
    expect(result.Message).toBe("Budget sudah habis.");
  });

  it("menghasilkan Daily Limit 0 saat saldo kas bernilai 0 meskipun ada sisa budget", () => {
    // Sisa budget: 1.000.000 - 500.000 = 500.000, tapi saldo kas 0
    const result = CalculationService.CalculateDailyLimit(1000000, 500000, 10, true, "Makanan", 1, 0);
    expect(result.DailyLimit).toBe(0);
    expect(result.RemainingBudget).toBe(0);
    expect(result.Status).toBe(DailyLimitStatus.BUDGET_EMPTY);
    expect(result.Message).toBe("Budget sudah habis.");
  });

  it("membatasi Daily Limit berdasarkan saldo kas jika saldo lebih kecil dari sisa budget", () => {
    // Sisa budget: 1.000.000 - 500.000 = 500.000, tapi saldo kas 200.000, sisa 10 hari -> 20.000/hari
    const result = CalculationService.CalculateDailyLimit(1000000, 500000, 10, true, "Makanan", 1, 200000);
    expect(result.DailyLimit).toBe(20000);
    expect(result.RemainingBudget).toBe(200000);
    expect(result.Status).toBe(DailyLimitStatus.NORMAL);
  });

  it("menghitung sisa hari dengan injeksi tanggal tetap", () => {
    const fixedDateMay = new Date(2024, 4, 15);
    const daysRemaining = CalculationService.CalculateRemainingDays(5, 2024, fixedDateMay);
    expect(daysRemaining).toBe(17);

    const daysPast = CalculationService.CalculateRemainingDays(4, 2024, fixedDateMay);
    expect(daysPast).toBe(0);

    const daysFuture = CalculationService.CalculateRemainingDays(6, 2024, fixedDateMay);
    expect(daysFuture).toBe(30);
  });
});
