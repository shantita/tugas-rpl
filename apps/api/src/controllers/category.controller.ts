import { Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { CategorySchema } from "../validators/category.validator";
import { HttpException } from "../middlewares/error.middleware";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { Category } from "@monthly-budgeting-app/shared";

export class CategoryController {
  static async GetAll(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const categories = await prisma.category.findMany({
        orderBy: { Name: "asc" },
      });

      const data: Category[] = categories.map((c) => ({
        Id: c.Id,
        Name: c.Name,
      }));

      return res.status(200).json({
        Success: true,
        Message: "Daftar kategori berhasil diambil",
        Data: data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async Create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const parsed = CategorySchema.parse(req.body);

      const existingCategory = await prisma.category.findUnique({
        where: { Name: parsed.Name },
      });

      if (existingCategory) {
        throw new HttpException(400, "Nama kategori sudah ada");
      }

      const created = await prisma.category.create({
        data: { Name: parsed.Name },
      });

      const data: Category = {
        Id: created.Id,
        Name: created.Name,
      };

      return res.status(201).json({
        Success: true,
        Message: "Kategori berhasil ditambahkan",
        Data: data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async Update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.Id, 10);
      if (isNaN(id)) {
        throw new HttpException(400, "ID kategori tidak valid");
      }

      const parsed = CategorySchema.parse(req.body);

      const category = await prisma.category.findUnique({
        where: { Id: id },
      });

      if (!category) {
        throw new HttpException(404, "Kategori tidak ditemukan");
      }

      const existingWithSameName = await prisma.category.findUnique({
        where: { Name: parsed.Name },
      });

      if (existingWithSameName && existingWithSameName.Id !== id) {
        throw new HttpException(400, "Nama kategori sudah digunakan");
      }

      const updated = await prisma.category.update({
        where: { Id: id },
        data: { Name: parsed.Name },
      });

      const data: Category = {
        Id: updated.Id,
        Name: updated.Name,
      };

      return res.status(200).json({
        Success: true,
        Message: "Kategori berhasil diperbarui",
        Data: data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async Delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.Id, 10);
      if (isNaN(id)) {
        throw new HttpException(400, "ID kategori tidak valid");
      }

      const category = await prisma.category.findUnique({
        where: { Id: id },
        include: {
          _count: {
            select: { Budgets: true, Expenses: true },
          },
        },
      });

      if (!category) {
        throw new HttpException(404, "Kategori tidak ditemukan");
      }

      if (category._count.Budgets > 0 || category._count.Expenses > 0) {
        throw new HttpException(400, "Kategori tidak dapat dihapus karena masih digunakan");
      }

      await prisma.category.delete({
        where: { Id: id },
      });

      return res.status(200).json({
        Success: true,
        Message: "Kategori berhasil dihapus",
      });
    } catch (error) {
      next(error);
    }
  }
}
