import { Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { PeriodQuerySchema } from "../validators/period.validator";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { CalculationService } from "../services/calculation.service";
import { MonthlyReport, ExpenseByCategoryItem } from "@monthly-budgeting-app/shared";

export class ReportController {
  static async GetMonthlyReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.User!.Id;
      const query = PeriodQuerySchema.parse(req.query);

      const now = new Date();
      const month = query.Month || now.getMonth() + 1;
      const year = query.Year || now.getFullYear();

      const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
      const endDate = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));

      const incomes = await prisma.income.findMany({
        where: {
          UserId: userId,
          Date: { gte: startDate, lt: endDate },
        },
      });

      const expenses = await prisma.expense.findMany({
        where: {
          UserId: userId,
          Date: { gte: startDate, lt: endDate },
        },
        include: { Category: true },
      });

      const budgets = await prisma.budget.findMany({
        where: {
          UserId: userId,
          Month: month,
          Year: year,
        },
      });

      const totalIncome = incomes.reduce((sum, item) => sum + Number(item.Amount), 0);
      const totalExpense = expenses.reduce((sum, item) => sum + Number(item.Amount), 0);
      const balance = CalculationService.CalculateBalance(totalIncome, totalExpense);

      const totalBudget = budgets.reduce((sum, item) => sum + Number(item.Amount), 0);
      let remainingBudget = CalculationService.CalculateRemainingBudget(totalBudget, totalExpense);
      if (totalIncome > 0 && balance < remainingBudget) {
        remainingBudget = Math.max(0, balance);
      } else {
        remainingBudget = Math.max(0, remainingBudget);
      }

      const categoryTotals = new Map<number, { name: string; amount: number }>();
      for (const expense of expenses) {
        const existing = categoryTotals.get(expense.CategoryId);
        if (existing) {
          existing.amount += Number(expense.Amount);
        } else {
          categoryTotals.set(expense.CategoryId, {
            name: expense.Category.Name,
            amount: Number(expense.Amount),
          });
        }
      }

      const expenseByCategory: ExpenseByCategoryItem[] = Array.from(categoryTotals.entries()).map(
        ([categoryId, item]) => {
          const percentage = totalExpense > 0 ? (item.amount / totalExpense) * 100 : 0;
          return {
            CategoryId: categoryId,
            CategoryName: item.name,
            TotalAmount: item.amount,
            Percentage: Math.round(percentage * 100) / 100,
          };
        }
      );

      const data: MonthlyReport = {
        Month: month,
        Year: year,
        TotalIncome: totalIncome,
        TotalExpense: totalExpense,
        Balance: balance,
        TotalBudget: totalBudget,
        RemainingBudget: remainingBudget,
        ExpenseByCategory: expenseByCategory,
      };

      return res.status(200).json({
        Success: true,
        Message: "Laporan bulanan berhasil diambil",
        Data: data,
      });
    } catch (error) {
      next(error);
    }
  }
}
