import { Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma";
import { JwtConfig } from "../config/jwt";
import { RegisterSchema, LoginSchema } from "../validators/auth.validator";
import { HttpException } from "../middlewares/error.middleware";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { AuthResponse, User } from "@monthly-budgeting-app/shared";

export class AuthController {
  static async Register(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const parsed = RegisterSchema.parse(req.body);
      const existingUser = await prisma.user.findUnique({
        where: { Email: parsed.Email },
      });

      if (existingUser) {
        throw new HttpException(400, "Email sudah digunakan oleh akun lain");
      }

      const passwordHash = await bcrypt.hash(parsed.Password, 10);
      const user = await prisma.user.create({
        data: {
          Name: parsed.Name,
          Email: parsed.Email,
          PasswordHash: passwordHash,
        },
      });

      const token = jwt.sign(
        { UserId: user.Id, Email: user.Email, Name: user.Name },
        JwtConfig.Secret,
        { expiresIn: JwtConfig.ExpiresIn }
      );

      const userDto: User = {
        Id: user.Id,
        Name: user.Name,
        Email: user.Email,
        CreatedAt: user.CreatedAt,
      };

      const authData: AuthResponse = {
        Token: token,
        User: userDto,
      };

      return res.status(201).json({
        Success: true,
        Message: "Pendaftaran akun berhasil",
        Data: authData,
      });
    } catch (error) {
      next(error);
    }
  }

  static async Login(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const parsed = LoginSchema.parse(req.body);
      const user = await prisma.user.findUnique({
        where: { Email: parsed.Email },
      });

      if (!user) {
        throw new HttpException(401, "Email atau password tidak sesuai");
      }

      const isPasswordMatch = await bcrypt.compare(parsed.Password, user.PasswordHash);
      if (!isPasswordMatch) {
        throw new HttpException(401, "Email atau password tidak sesuai");
      }

      const token = jwt.sign(
        { UserId: user.Id, Email: user.Email, Name: user.Name },
        JwtConfig.Secret,
        { expiresIn: JwtConfig.ExpiresIn }
      );

      const userDto: User = {
        Id: user.Id,
        Name: user.Name,
        Email: user.Email,
        CreatedAt: user.CreatedAt,
      };

      const authData: AuthResponse = {
        Token: token,
        User: userDto,
      };

      return res.status(200).json({
        Success: true,
        Message: "Login berhasil",
        Data: authData,
      });
    } catch (error) {
      next(error);
    }
  }

  static async GetMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.User?.Id;
      if (!userId) {
        throw new HttpException(401, "Pengguna tidak terautentikasi");
      }

      const user = await prisma.user.findUnique({
        where: { Id: userId },
      });

      if (!user) {
        throw new HttpException(404, "Data pengguna tidak ditemukan");
      }

      const userDto: User = {
        Id: user.Id,
        Name: user.Name,
        Email: user.Email,
        CreatedAt: user.CreatedAt,
      };

      return res.status(200).json({
        Success: true,
        Message: "Data pengguna berhasil diambil",
        Data: userDto,
      });
    } catch (error) {
      next(error);
    }
  }
}
