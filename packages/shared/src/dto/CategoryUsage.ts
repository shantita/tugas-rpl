import { BudgetStatus } from "../enums/BudgetStatus";
import { BudgetType } from "../enums/BudgetType";

export interface CategoryUsage {
  CategoryId: number;
  CategoryName: string;
  BudgetAmount: number;
  ExpenseAmount: number;
  RemainingBudget: number;
  UsagePercentage: number;
  Status: BudgetStatus;
  BudgetType?: BudgetType;
  WarningMessage?: string;
}
