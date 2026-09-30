import { Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { ExpenseSchema } from "../validators/expense.validator";
import { PeriodQuerySchema } from "../validators/period.validator";
import { HttpException } from "../middlewares/error.middleware";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { Expense } from "@monthly-budgeting-app/shared";

export class ExpenseController {
  static async GetAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.User!.Id;
      const query = PeriodQuerySchema.parse(req.query);

      const whereClause: {
        UserId: number;
        Date?: { gte: Date; lt: Date };
      } = {
        UserId: userId,
      };

      if (query.Month && query.Year) {
        const startDate = new Date(Date.UTC(query.Year, query.Month - 1, 1, 0, 0, 0, 0));
        const endDate = new Date(Date.UTC(query.Year, query.Month, 1, 0, 0, 0, 0));
        whereClause.Date = {
          gte: startDate,
          lt: endDate,
        };
      }

      const expenses = await prisma.expense.findMany({
        where: whereClause,
        include: { Category: true },
        orderBy: { Date: "desc" },
      });

      const data: Expense[] = expenses.map((item) => ({
        Id: item.Id,
        UserId: item.UserId,
        CategoryId: item.CategoryId,
        Amount: Number(item.Amount),
        Date: item.Date.toISOString(),
        Description: item.Description,
        CreatedAt: item.CreatedAt.toISOString(),
        Category: {
          Id: item.Category.Id,
          Name: item.Category.Name,
        },
      }));

      return res.status(200).json({
        Success: true,
        Message: "Daftar pengeluaran berhasil diambil",
        Data: data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async GetById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.User!.Id;
      const id = parseInt(req.params.Id, 10);
      if (isNaN(id)) {
        throw new HttpException(400, "ID pengeluaran tidak valid");
      }

      const expense = await prisma.expense.findFirst({
        where: { Id: id, UserId: userId },
        include: { Category: true },
      });

      if (!expense) {
        throw new HttpException(404, "Data pengeluaran tidak ditemukan");
      }

      const data: Expense = {
        Id: expense.Id,
        UserId: expense.UserId,
        CategoryId: expense.CategoryId,
        Amount: Number(expense.Amount),
        Date: expense.Date.toISOString(),
        Description: expense.Description,
        CreatedAt: expense.CreatedAt.toISOString(),
        Category: {
          Id: expense.Category.Id,
          Name: expense.Category.Name,
        },
      };

      return res.status(200).json({
        Success: true,
        Message: "Detail pengeluaran berhasil diambil",
        Data: data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async Create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.User!.Id;
      const parsed = ExpenseSchema.parse(req.body);

      const category = await prisma.category.findUnique({
        where: { Id: parsed.CategoryId },
      });

      if (!category) {
        throw new HttpException(400, "Kategori yang dipilih tidak valid");
      }

      const expense = await prisma.expense.create({
        data: {
          UserId: userId,
          CategoryId: parsed.CategoryId,
          Amount: parsed.Amount,
          Date: parsed.Date,
          Description: parsed.Description,
        },
        include: { Category: true },
      });

      const data: Expense = {
        Id: expense.Id,
        UserId: expense.UserId,
        CategoryId: expense.CategoryId,
        Amount: Number(expense.Amount),
        Date: expense.Date.toISOString(),
        Description: expense.Description,
        CreatedAt: expense.CreatedAt.toISOString(),
        Category: {
          Id: expense.Category.Id,
          Name: expense.Category.Name,
        },
      };

      return res.status(201).json({
        Success: true,
        Message: "Pengeluaran berhasil ditambahkan",
        Data: data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async Update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.User!.Id;
      const id = parseInt(req.params.Id, 10);
      if (isNaN(id)) {
        throw new HttpException(400, "ID pengeluaran tidak valid");
      }

      const parsed = ExpenseSchema.parse(req.body);

      const existingExpense = await prisma.expense.findFirst({
        where: { Id: id, UserId: userId },
      });

      if (!existingExpense) {
        throw new HttpException(404, "Data pengeluaran tidak ditemukan");
      }

      const category = await prisma.category.findUnique({
        where: { Id: parsed.CategoryId },
      });

      if (!category) {
        throw new HttpException(400, "Kategori yang dipilih tidak valid");
      }

      const updated = await prisma.expense.update({
        where: { Id: id },
        data: {
          CategoryId: parsed.CategoryId,
          Amount: parsed.Amount,
          Date: parsed.Date,
          Description: parsed.Description,
        },
        include: { Category: true },
      });

      const data: Expense = {
        Id: updated.Id,
        UserId: updated.UserId,
        CategoryId: updated.CategoryId,
        Amount: Number(updated.Amount),
        Date: updated.Date.toISOString(),
        Description: updated.Description,
        CreatedAt: updated.CreatedAt.toISOString(),
        Category: {
          Id: updated.Category.Id,
          Name: updated.Category.Name,
        },
      };

      return res.status(200).json({
        Success: true,
        Message: "Pengeluaran berhasil diperbarui",
        Data: data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async Delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.User!.Id;
      const id = parseInt(req.params.Id, 10);
      if (isNaN(id)) {
        throw new HttpException(400, "ID pengeluaran tidak valid");
      }

      const existingExpense = await prisma.expense.findFirst({
        where: { Id: id, UserId: userId },
      });

      if (!existingExpense) {
        throw new HttpException(404, "Data pengeluaran tidak ditemukan");
      }

      await prisma.expense.delete({
        where: { Id: id },
      });

      return res.status(200).json({
        Success: true,
        Message: "Pengeluaran berhasil dihapus",
      });
    } catch (error) {
      next(error);
    }
  }
}
