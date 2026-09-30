import { BudgetStatus } from "../enums/BudgetStatus";

export interface CategoryUsage {
  CategoryId: number;
  CategoryName: string;
  BudgetAmount: number;
  ExpenseAmount: number;
  RemainingBudget: number;
  UsagePercentage: number;
  Status: BudgetStatus;
  WarningMessage?: string;
}
