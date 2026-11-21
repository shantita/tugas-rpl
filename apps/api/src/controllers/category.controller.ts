import { Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { CategorySchema } from "../validators/category.validator";
import { HttpException } from "../middlewares/error.middleware";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { Category } from "@monthly-budgeting-app/shared";

const DEFAULT_SYSTEM_CATEGORIES = [
  "Makanan & Minuman",
  "Transportasi",
  "Kos/Tempat Tinggal",
  "Hiburan & Hobi",
  "Belanja Bulanan",
  "Tagihan & Utilitas",
  "Kesehatan",
  "Lainnya",
];

export class CategoryController {
  static async GetAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.User?.Id;
      const categories = await prisma.category.findMany({
        where: {
          OR: [
            { UserId: null },
            ...(userId ? [{ UserId: userId }] : []),
          ],
        },
        orderBy: [{ UserId: "asc" }, { Name: "asc" }],
      });

      const data: Category[] = categories.map((c: any) => ({
        Id: c.Id,
        Name: c.Name,
        UserId: c.UserId,
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
      const userId = req.User!.Id;
      const parsed = CategorySchema.parse(req.body);

      const existingCategory = await prisma.category.findFirst({
        where: {
          Name: parsed.Name,
          OR: [
            { UserId: null },
            { UserId: userId },
          ],
        },
      });

      if (existingCategory) {
        throw new HttpException(400, "Nama kategori sudah ada dalam daftar Anda");
      }

      const created = await prisma.category.create({
        data: {
          UserId: userId,
          Name: parsed.Name,
        },
      });

      const data: Category = {
        Id: created.Id,
        Name: created.Name,
        UserId: created.UserId,
      };

      return res.status(201).json({
        Success: true,
        Message: "Kategori pribadi berhasil ditambahkan",
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
        throw new HttpException(400, "ID kategori tidak valid");
      }

      const parsed = CategorySchema.parse(req.body);

      const category = await prisma.category.findUnique({
        where: { Id: id },
      });

      if (!category) {
        throw new HttpException(404, "Kategori tidak ditemukan");
      }

      if (category.UserId === null || DEFAULT_SYSTEM_CATEGORIES.includes(category.Name)) {
        throw new HttpException(400, "Kategori bawaan sistem tidak dapat diubah namanya");
      }

      if (category.UserId !== userId) {
        throw new HttpException(403, "Anda tidak memiliki izin untuk mengubah kategori milik pengguna lain");
      }

      const existingWithSameName = await prisma.category.findFirst({
        where: {
          Name: parsed.Name,
          OR: [
            { UserId: null },
            { UserId: userId },
          ],
          Id: { not: id },
        },
      });

      if (existingWithSameName) {
        throw new HttpException(400, "Nama kategori sudah digunakan dalam daftar Anda");
      }

      const updated = await prisma.category.update({
        where: { Id: id },
        data: { Name: parsed.Name },
      });

      const data: Category = {
        Id: updated.Id,
        Name: updated.Name,
        UserId: updated.UserId,
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
      const userId = req.User!.Id;
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

      if (category.UserId === null || DEFAULT_SYSTEM_CATEGORIES.includes(category.Name)) {
        throw new HttpException(400, "Kategori bawaan sistem tidak dapat dihapus");
      }

      if (category.UserId !== userId) {
        throw new HttpException(403, "Anda tidak memiliki izin untuk menghapus kategori milik pengguna lain");
      }

      if (category._count.Budgets > 0 || category._count.Expenses > 0) {
        throw new HttpException(400, "Kategori tidak dapat dihapus karena masih digunakan dalam anggaran atau pengeluaran");
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
