import { Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { IncomeSchema } from "../validators/income.validator";
import { PeriodQuerySchema } from "../validators/period.validator";
import { HttpException } from "../middlewares/error.middleware";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { Income } from "@monthly-budgeting-app/shared";

export class IncomeController {
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

      const incomes = await prisma.income.findMany({
        where: whereClause,
        orderBy: { Date: "desc" },
      });

      const data: Income[] = incomes.map((item) => ({
        Id: item.Id,
        UserId: item.UserId,
        Amount: Number(item.Amount),
        Date: item.Date.toISOString(),
        Description: item.Description,
        CreatedAt: item.CreatedAt.toISOString(),
      }));

      return res.status(200).json({
        Success: true,
        Message: "Daftar pemasukan berhasil diambil",
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
        throw new HttpException(400, "ID pemasukan tidak valid");
      }

      const income = await prisma.income.findFirst({
        where: { Id: id, UserId: userId },
      });

      if (!income) {
        throw new HttpException(404, "Data pemasukan tidak ditemukan");
      }

      const data: Income = {
        Id: income.Id,
        UserId: income.UserId,
        Amount: Number(income.Amount),
        Date: income.Date.toISOString(),
        Description: income.Description,
        CreatedAt: income.CreatedAt.toISOString(),
      };

      return res.status(200).json({
        Success: true,
        Message: "Detail pemasukan berhasil diambil",
        Data: data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async Create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.User!.Id;
      const parsed = IncomeSchema.parse(req.body);

      const income = await prisma.income.create({
        data: {
          UserId: userId,
          Amount: parsed.Amount,
          Date: parsed.Date,
          Description: parsed.Description,
        },
      });

      const data: Income = {
        Id: income.Id,
        UserId: income.UserId,
        Amount: Number(income.Amount),
        Date: income.Date.toISOString(),
        Description: income.Description,
        CreatedAt: income.CreatedAt.toISOString(),
      };

      return res.status(201).json({
        Success: true,
        Message: "Pemasukan berhasil ditambahkan",
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
        throw new HttpException(400, "ID pemasukan tidak valid");
      }

      const parsed = IncomeSchema.parse(req.body);

      const existingIncome = await prisma.income.findFirst({
        where: { Id: id, UserId: userId },
      });

      if (!existingIncome) {
        throw new HttpException(404, "Data pemasukan tidak ditemukan");
      }

      const updated = await prisma.income.update({
        where: { Id: id },
        data: {
          Amount: parsed.Amount,
          Date: parsed.Date,
          Description: parsed.Description,
        },
      });

      const data: Income = {
        Id: updated.Id,
        UserId: updated.UserId,
        Amount: Number(updated.Amount),
        Date: updated.Date.toISOString(),
        Description: updated.Description,
        CreatedAt: updated.CreatedAt.toISOString(),
      };

      return res.status(200).json({
        Success: true,
        Message: "Pemasukan berhasil diperbarui",
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
        throw new HttpException(400, "ID pemasukan tidak valid");
      }

      const existingIncome = await prisma.income.findFirst({
        where: { Id: id, UserId: userId },
      });

      if (!existingIncome) {
        throw new HttpException(404, "Data pemasukan tidak ditemukan");
      }

      await prisma.income.delete({
        where: { Id: id },
      });

      return res.status(200).json({
        Success: true,
        Message: "Pemasukan berhasil dihapus",
      });
    } catch (error) {
      next(error);
    }
  }
}
