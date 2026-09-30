import { DailyLimitStatus } from "../enums/DailyLimitStatus";

export interface DailyLimitItem {
  CategoryId?: number;
  CategoryName?: string;
  BudgetAmount: number;
  ExpenseAmount: number;
  RemainingBudget: number;
  RemainingDays: number;
  DailyLimit: number;
  Status: DailyLimitStatus;
  Message: string;
}

export interface DailyLimitResponse {
  Total: DailyLimitItem;
  Categories: DailyLimitItem[];
}
