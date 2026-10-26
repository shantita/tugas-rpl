import { Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { PeriodQuerySchema } from "../validators/period.validator";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { CalculationService } from "../services/calculation.service";
import {
  DashboardSummary,
  CategoryUsage,
  DailyLimitResponse,
  DailyLimitItem,
} from "@monthly-budgeting-app/shared";

export class DashboardController {
  static async GetSummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
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

      // Sisa anggaran memperhitungkan seluruh pengeluaran (baik yang ber-anggaran maupun non-anggaran)
      // dan tidak boleh melebihi sisa saldo kas riil pengguna jika pemasukan telah dicatat
      let remainingBudget = CalculationService.CalculateRemainingBudget(totalBudget, totalExpense);
      if (totalIncome > 0 && balance < remainingBudget) {
        remainingBudget = Math.max(0, balance);
      } else {
        remainingBudget = Math.max(0, remainingBudget);
      }

      const data: DashboardSummary = {
        TotalIncome: totalIncome,
        TotalExpense: totalExpense,
        Balance: balance,
        TotalBudget: totalBudget,
        RemainingBudget: remainingBudget,
      };

      return res.status(200).json({
        Success: true,
        Message: "Ringkasan dashboard berhasil diambil",
        Data: data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async GetCategories(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.User!.Id;
      const query = PeriodQuerySchema.parse(req.query);

      const now = new Date();
      const month = query.Month || now.getMonth() + 1;
      const year = query.Year || now.getFullYear();

      const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
      const endDate = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));

      const budgets = await prisma.budget.findMany({
        where: {
          UserId: userId,
          Month: month,
          Year: year,
        },
        include: { Category: true },
        orderBy: { Category: { Name: "asc" } },
      });

      const expenses = await prisma.expense.findMany({
        where: {
          UserId: userId,
          Date: { gte: startDate, lt: endDate },
        },
      });

      const expenseMap = new Map<number, number>();
      for (const expense of expenses) {
        const cur = expenseMap.get(expense.CategoryId) || 0;
        expenseMap.set(expense.CategoryId, cur + Number(expense.Amount));
      }

      const data: CategoryUsage[] = budgets.map((b) => {
        const budgetAmount = Number(b.Amount);
        const expenseAmount = expenseMap.get(b.CategoryId) || 0;
        const remainingBudget = CalculationService.CalculateRemainingBudget(budgetAmount, expenseAmount);
        const usagePercentage = CalculationService.CalculateUsagePercentage(budgetAmount, expenseAmount);
        const status = CalculationService.DetermineBudgetStatus(usagePercentage);
        const warningMessage = CalculationService.GetWarningMessage(status, b.Category.Name, usagePercentage);

        return {
          CategoryId: b.CategoryId,
          CategoryName: b.Category.Name,
          BudgetAmount: budgetAmount,
          ExpenseAmount: expenseAmount,
          RemainingBudget: remainingBudget,
          UsagePercentage: usagePercentage,
          Status: status,
          WarningMessage: warningMessage,
        };
      });

      return res.status(200).json({
        Success: true,
        Message: "Data penggunaan anggaran per kategori berhasil diambil",
        Data: data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async GetDailyLimit(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.User!.Id;
      const query = PeriodQuerySchema.parse(req.query);

      const now = new Date();
      const month = query.Month || now.getMonth() + 1;
      const year = query.Year || now.getFullYear();

      const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
      const endDate = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));

      const budgets = await prisma.budget.findMany({
        where: {
          UserId: userId,
          Month: month,
          Year: year,
        },
        include: { Category: true },
        orderBy: { Category: { Name: "asc" } },
      });

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
      });

      const totalIncome = incomes.reduce((sum, item) => sum + Number(item.Amount), 0);
      const totalExpense = expenses.reduce((sum, item) => sum + Number(item.Amount), 0);
      const balance = CalculationService.CalculateBalance(totalIncome, totalExpense);

      const expenseMap = new Map<number, number>();
      for (const expense of expenses) {
        const cur = expenseMap.get(expense.CategoryId) || 0;
        expenseMap.set(expense.CategoryId, cur + Number(expense.Amount));
      }

      const remainingDays = CalculationService.CalculateRemainingDays(month, year, now);
      const totalBudget = budgets.reduce((sum, item) => sum + Number(item.Amount), 0);

      const totalItem = CalculationService.CalculateDailyLimit(
        totalBudget,
        totalExpense,
        remainingDays,
        budgets.length > 0,
        "Total",
        undefined,
        totalIncome > 0 ? balance : undefined
      );

      const categoryItems: DailyLimitItem[] = budgets.map((b) => {
        const budgetAmount = Number(b.Amount);
        const expenseAmount = expenseMap.get(b.CategoryId) || 0;
        return CalculationService.CalculateDailyLimit(
          budgetAmount,
          expenseAmount,
          remainingDays,
          true,
          b.Category.Name,
          b.CategoryId,
          totalIncome > 0 ? balance : undefined
        );
      });

      const data: DailyLimitResponse = {
        Total: totalItem,
        Categories: categoryItems,
      };

      return res.status(200).json({
        Success: true,
        Message: "Data batas pengeluaran harian berhasil diambil",
        Data: data,
      });
    } catch (error) {
      next(error);
    }
  }
}
