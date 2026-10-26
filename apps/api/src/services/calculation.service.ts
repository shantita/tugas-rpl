import {
  BudgetStatus,
  DailyLimitStatus,
  BudgetThresholds,
  DailyLimitItem,
} from "@monthly-budgeting-app/shared";

export class CalculationService {
  static CalculateBalance(totalIncome: number, totalExpense: number): number {
    return Math.max(0, totalIncome - totalExpense);
  }

  static CalculateRemainingBudget(budgetAmount: number, expenseAmount: number): number {
    return budgetAmount - expenseAmount;
  }

  static CalculateUsagePercentage(budgetAmount: number, expenseAmount: number): number {
    if (budgetAmount <= 0) {
      return 0;
    }
    return (expenseAmount / budgetAmount) * 100;
  }

  static DetermineBudgetStatus(usagePercentage: number): BudgetStatus {
    if (usagePercentage < BudgetThresholds.SAFE_LIMIT) {
      return BudgetStatus.SAFE;
    }
    if (usagePercentage < BudgetThresholds.WARNING_LIMIT) {
      return BudgetStatus.WARNING;
    }
    if (usagePercentage < BudgetThresholds.MAX_LIMIT) {
      return BudgetStatus.NEAR_LIMIT;
    }
    return BudgetStatus.EXCEEDED;
  }

  static GetWarningMessage(status: BudgetStatus, categoryName: string, usagePercentage: number): string | undefined {
    const rounded = Math.round(usagePercentage);
    if (status === BudgetStatus.NEAR_LIMIT) {
      return `Perhatian! Penggunaan budget ${categoryName} sudah mencapai ${rounded}%.`;
    }
    if (status === BudgetStatus.EXCEEDED) {
      return `Perhatian! Penggunaan budget ${categoryName} telah melebihi batas (${rounded}%).`;
    }
    return undefined;
  }

  static CalculateRemainingDays(month: number, year: number, currentDate: Date = new Date()): number {
    const curYear = currentDate.getFullYear();
    const curMonth = currentDate.getMonth() + 1;
    const curDay = currentDate.getDate();

    if (year < curYear || (year === curYear && month < curMonth)) {
      return 0;
    }

    if (year > curYear || (year === curYear && month > curMonth)) {
      return new Date(year, month, 0).getDate();
    }

    const lastDayOfMonth = new Date(year, month, 0).getDate();
    return lastDayOfMonth - curDay + 1;
  }

  static CalculateDailyLimit(
    budgetAmount: number,
    expenseAmount: number,
    remainingDays: number,
    hasBudget: boolean = true,
    categoryName?: string,
    categoryId?: number,
    balance?: number
  ): DailyLimitItem {
    let remainingBudget = budgetAmount - expenseAmount;
    if (balance !== undefined && balance < remainingBudget) {
      remainingBudget = Math.max(0, balance);
    }

    // Aturan 1: Tidak ada budget yang diatur
    if (!hasBudget || budgetAmount <= 0) {
      return {
        CategoryId: categoryId,
        CategoryName: categoryName,
        BudgetAmount: budgetAmount,
        ExpenseAmount: expenseAmount,
        RemainingBudget: remainingBudget,
        RemainingDays: remainingDays,
        DailyLimit: 0,
        Status: DailyLimitStatus.NO_BUDGET,
        Message: "Budget belum diatur untuk kategori ini.",
      };
    }

    // Aturan 2: RemainingDays sama dengan 0 (periode telah berakhir)
    if (remainingDays <= 0) {
      return {
        CategoryId: categoryId,
        CategoryName: categoryName,
        BudgetAmount: budgetAmount,
        ExpenseAmount: expenseAmount,
        RemainingBudget: remainingBudget,
        RemainingDays: 0,
        DailyLimit: 0,
        Status: DailyLimitStatus.PERIOD_ENDED,
        Message: "Periode anggaran telah berakhir.",
      };
    }

    // Aturan 3: Expense lebih besar dari budget
    if (expenseAmount > budgetAmount) {
      return {
        CategoryId: categoryId,
        CategoryName: categoryName,
        BudgetAmount: budgetAmount,
        ExpenseAmount: expenseAmount,
        RemainingBudget: budgetAmount - expenseAmount,
        RemainingDays: remainingDays,
        DailyLimit: 0,
        Status: DailyLimitStatus.BUDGET_EXCEEDED,
        Message: "Budget telah melebihi batas.",
      };
    }

    // Aturan 4: Sisa budget sama dengan 0 ATAU Saldo kas habis (0)
    if (remainingBudget <= 0 || (balance !== undefined && balance <= 0)) {
      return {
        CategoryId: categoryId,
        CategoryName: categoryName,
        BudgetAmount: budgetAmount,
        ExpenseAmount: expenseAmount,
        RemainingBudget: 0,
        RemainingDays: remainingDays,
        DailyLimit: 0,
        Status: DailyLimitStatus.BUDGET_EMPTY,
        Message: "Budget sudah habis.",
      };
    }

    // Aturan 5: Kondisi normal, hitung sisa budget dibagi sisa hari dibulatkan ke bawah ke Rupiah utuh
    const dailyLimit = Math.floor(remainingBudget / remainingDays);
    return {
      CategoryId: categoryId,
      CategoryName: categoryName,
      BudgetAmount: budgetAmount,
      ExpenseAmount: expenseAmount,
      RemainingBudget: remainingBudget,
      RemainingDays: remainingDays,
      DailyLimit: dailyLimit,
      Status: DailyLimitStatus.NORMAL,
      Message: "Budget dalam batas aman.",
    };
  }
}
