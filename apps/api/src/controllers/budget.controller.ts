import { Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { BudgetSchema } from "../validators/budget.validator";
import { PeriodQuerySchema } from "../validators/period.validator";
import { HttpException } from "../middlewares/error.middleware";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { Budget, BudgetType } from "@monthly-budgeting-app/shared";

export class BudgetController {
  static async GetAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.User!.Id;
      const query = PeriodQuerySchema.parse(req.query);

      let whereClause: {
        UserId: number;
        OR?: Array<{ Month?: number; Year?: number }>;
        Month?: number;
        Year?: number;
      } = {
        UserId: userId,
      };

      if (query.Month && query.Year) {
        // Ambil anggaran tetap (Month: 0, Year: 0) dan anggaran sementara untuk bulan & tahun yang diminta
        whereClause.OR = [
          { Month: 0, Year: 0 },
          { Month: query.Month, Year: query.Year },
        ];
      } else if (query.Year) {
        whereClause.OR = [
          { Month: 0, Year: 0 },
          { Year: query.Year },
        ];
      }

      const budgets = await prisma.budget.findMany({
        where: whereClause,
        include: { Category: true },
        orderBy: [{ Year: "desc" }, { Month: "desc" }, { Category: { Name: "asc" } }],
      });

      const data: Budget[] = budgets.map((item) => {
        const isFixed = item.Month === 0 && item.Year === 0;
        return {
          Id: item.Id,
          UserId: item.UserId,
          CategoryId: item.CategoryId,
          Amount: Number(item.Amount),
          Month: item.Month,
          Year: item.Year,
          Type: isFixed ? BudgetType.FIXED : BudgetType.TEMPORARY,
          CreatedAt: item.CreatedAt.toISOString(),
          Category: {
            Id: item.Category.Id,
            Name: item.Category.Name,
          },
        };
      });

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

      const isFixed = budget.Month === 0 && budget.Year === 0;
      const data: Budget = {
        Id: budget.Id,
        UserId: budget.UserId,
        CategoryId: budget.CategoryId,
        Amount: Number(budget.Amount),
        Month: budget.Month,
        Year: budget.Year,
        Type: isFixed ? BudgetType.FIXED : BudgetType.TEMPORARY,
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

      const isFixed = parsed.Type === BudgetType.FIXED;
      const budgetMonth = isFixed ? 0 : parsed.Month;
      const budgetYear = isFixed ? 0 : parsed.Year;

      if (isFixed) {
        const existingFixed = await prisma.budget.findUnique({
          where: {
            UserId_CategoryId_Month_Year: {
              UserId: userId,
              CategoryId: parsed.CategoryId,
              Month: 0,
              Year: 0,
            },
          },
        });

        if (existingFixed) {
          throw new HttpException(400, "Anggaran tetap untuk kategori tersebut sudah pernah dibuat");
        }
      } else {
        // Cek apakah sudah ada anggaran tetap untuk kategori ini
        const existingFixed = await prisma.budget.findUnique({
          where: {
            UserId_CategoryId_Month_Year: {
              UserId: userId,
              CategoryId: parsed.CategoryId,
              Month: 0,
              Year: 0,
            },
          },
        });

        if (existingFixed) {
          throw new HttpException(
            400,
            "Kategori ini sudah memiliki anggaran tetap yang berlaku setiap bulan. Silakan ubah anggaran tetap tersebut jika ingin menyesuaikan nominalnya."
          );
        }

        const existingBudget = await prisma.budget.findUnique({
          where: {
            UserId_CategoryId_Month_Year: {
              UserId: userId,
              CategoryId: parsed.CategoryId,
              Month: budgetMonth,
              Year: budgetYear,
            },
          },
        });

        if (existingBudget) {
          throw new HttpException(400, "Anggaran untuk kategori dan periode tersebut sudah pernah dibuat");
        }
      }

      const budget = await prisma.budget.create({
        data: {
          UserId: userId,
          CategoryId: parsed.CategoryId,
          Amount: parsed.Amount,
          Month: budgetMonth,
          Year: budgetYear,
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
        Type: isFixed ? BudgetType.FIXED : BudgetType.TEMPORARY,
        CreatedAt: budget.CreatedAt.toISOString(),
        Category: {
          Id: budget.Category.Id,
          Name: budget.Category.Name,
        },
      };

      return res.status(201).json({
        Success: true,
        Message: isFixed ? "Anggaran tetap berhasil ditambahkan" : "Anggaran sementara berhasil ditambahkan",
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

      const isFixed = parsed.Type === BudgetType.FIXED;
      const budgetMonth = isFixed ? 0 : parsed.Month;
      const budgetYear = isFixed ? 0 : parsed.Year;

      const duplicate = await prisma.budget.findUnique({
        where: {
          UserId_CategoryId_Month_Year: {
            UserId: userId,
            CategoryId: parsed.CategoryId,
            Month: budgetMonth,
            Year: budgetYear,
          },
        },
      });

      if (duplicate && duplicate.Id !== id) {
        throw new HttpException(
          400,
          isFixed
            ? "Anggaran tetap untuk kategori tersebut sudah pernah dibuat"
            : "Anggaran untuk kategori dan periode tersebut sudah pernah dibuat"
        );
      }

      const updated = await prisma.budget.update({
        where: { Id: id },
        data: {
          CategoryId: parsed.CategoryId,
          Amount: parsed.Amount,
          Month: budgetMonth,
          Year: budgetYear,
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
        Type: isFixed ? BudgetType.FIXED : BudgetType.TEMPORARY,
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
