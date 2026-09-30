export interface ExpenseByCategoryItem {
  CategoryId: number;
  CategoryName: string;
  TotalAmount: number;
  Percentage: number;
}

export interface MonthlyReport {
  Month: number;
  Year: number;
  TotalIncome: number;
  TotalExpense: number;
  Balance: number;
  TotalBudget: number;
  RemainingBudget: number;
  ExpenseByCategory: ExpenseByCategoryItem[];
}
