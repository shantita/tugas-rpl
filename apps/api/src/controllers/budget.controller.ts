import { Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { BudgetSchema } from "../validators/budget.validator";
import { PeriodQuerySchema } from "../validators/period.validator";
import { HttpException } from "../middlewares/error.middleware";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { Budget } from "@monthly-budgeting-app/shared";

export class BudgetController {
  static async GetAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.User!.Id;
      const query = PeriodQuerySchema.parse(req.query);

      const whereClause: {
        UserId: number;
        Month?: number;
        Year?: number;
      } = {
        UserId: userId,
      };

      if (query.Month) {
        whereClause.Month = query.Month;
      }
      if (query.Year) {
        whereClause.Year = query.Year;
      }

      const budgets = await prisma.budget.findMany({
        where: whereClause,
        include: { Category: true },
        orderBy: [{ Year: "desc" }, { Month: "desc" }, { Category: { Name: "asc" } }],
      });

      const data: Budget[] = budgets.map((item) => ({
        Id: item.Id,
        UserId: item.UserId,
        CategoryId: item.CategoryId,
        Amount: Number(item.Amount),
        Month: item.Month,
        Year: item.Year,
        CreatedAt: item.CreatedAt.toISOString(),
        Category: {
          Id: item.Category.Id,
          Name: item.Category.Name,
        },
      }));

      return res.status(200).json({
        Success: true,
        Message: "Daftar anggaran berhasil diambil",
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
        throw new HttpException(400, "ID anggaran tidak valid");
      }

      const budget = await prisma.budget.findFirst({
        where: { Id: id, UserId: userId },
        include: { Category: true },
      });

      if (!budget) {
        throw new HttpException(404, "Data anggaran tidak ditemukan");
      }

      const data: Budget = {
        Id: budget.Id,
        UserId: budget.UserId,
        CategoryId: budget.CategoryId,
        Amount: Number(budget.Amount),
        Month: budget.Month,
        Year: budget.Year,
        CreatedAt: budget.CreatedAt.toISOString(),
        Category: {
          Id: budget.Category.Id,
          Name: budget.Category.Name,
        },
      };

      return res.status(200).json({
        Success: true,
        Message: "Detail anggaran berhasil diambil",
        Data: data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async Create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.User!.Id;
      const parsed = BudgetSchema.parse(req.body);

      const category = await prisma.category.findUnique({
        where: { Id: parsed.CategoryId },
      });

      if (!category) {
        throw new HttpException(400, "Kategori yang dipilih tidak valid");
      }

      const existingBudget = await prisma.budget.findUnique({
        where: {
          UserId_CategoryId_Month_Year: {
            UserId: userId,
            CategoryId: parsed.CategoryId,
            Month: parsed.Month,
            Year: parsed.Year,
          },
        },
      });

      if (existingBudget) {
        throw new HttpException(400, "Anggaran untuk kategori dan periode tersebut sudah pernah dibuat");
      }

      const budget = await prisma.budget.create({
        data: {
          UserId: userId,
          CategoryId: parsed.CategoryId,
          Amount: parsed.Amount,
          Month: parsed.Month,
          Year: parsed.Year,
        },
        include: { Category: true },
      });

      const data: Budget = {
        Id: budget.Id,
        UserId: budget.UserId,
        CategoryId: budget.CategoryId,
        Amount: Number(budget.Amount),
        Month: budget.Month,
        Year: budget.Year,
        CreatedAt: budget.CreatedAt.toISOString(),
        Category: {
          Id: budget.Category.Id,
          Name: budget.Category.Name,
        },
      };

      return res.status(201).json({
        Success: true,
        Message: "Anggaran berhasil ditambahkan",
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
        throw new HttpException(400, "ID anggaran tidak valid");
      }

      const parsed = BudgetSchema.parse(req.body);

      const existingBudget = await prisma.budget.findFirst({
        where: { Id: id, UserId: userId },
      });

      if (!existingBudget) {
        throw new HttpException(404, "Data anggaran tidak ditemukan");
      }

      const category = await prisma.category.findUnique({
        where: { Id: parsed.CategoryId },
      });

      if (!category) {
        throw new HttpException(400, "Kategori yang dipilih tidak valid");
      }

      const duplicate = await prisma.budget.findUnique({
        where: {
          UserId_CategoryId_Month_Year: {
            UserId: userId,
            CategoryId: parsed.CategoryId,
            Month: parsed.Month,
            Year: parsed.Year,
          },
        },
      });

      if (duplicate && duplicate.Id !== id) {
        throw new HttpException(400, "Anggaran untuk kategori dan periode tersebut sudah pernah dibuat");
      }

      const updated = await prisma.budget.update({
        where: { Id: id },
        data: {
          CategoryId: parsed.CategoryId,
          Amount: parsed.Amount,
          Month: parsed.Month,
          Year: parsed.Year,
        },
        include: { Category: true },
      });

      const data: Budget = {
        Id: updated.Id,
        UserId: updated.UserId,
        CategoryId: updated.CategoryId,
        Amount: Number(updated.Amount),
        Month: updated.Month,
        Year: updated.Year,
        CreatedAt: updated.CreatedAt.toISOString(),
        Category: {
          Id: updated.Category.Id,
          Name: updated.Category.Name,
        },
      };

      return res.status(200).json({
        Success: true,
        Message: "Anggaran berhasil diperbarui",
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
        throw new HttpException(400, "ID anggaran tidak valid");
      }

      const existingBudget = await prisma.budget.findFirst({
        where: { Id: id, UserId: userId },
      });

      if (!existingBudget) {
        throw new HttpException(404, "Data anggaran tidak ditemukan");
      }

      await prisma.budget.delete({
        where: { Id: id },
      });

      return res.status(200).json({
        Success: true,
        Message: "Anggaran berhasil dihapus",
      });
    } catch (error) {
      next(error);
    }
  }
}
