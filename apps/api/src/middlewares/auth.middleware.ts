import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtConfig } from "../config/jwt";
import { User } from "@monthly-budgeting-app/shared";

export interface AuthenticatedRequest extends Request {
  User?: User;
}

interface JwtPayload {
  UserId: number;
  Email: string;
  Name: string;
}

export function AuthenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      Success: false,
      Message: "Token autentikasi tidak ditemukan",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JwtConfig.Secret) as JwtPayload;
    req.User = {
      Id: decoded.UserId,
      Name: decoded.Name,
      Email: decoded.Email,
      CreatedAt: new Date(),
    };
    next();
  } catch {
    return res.status(401).json({
      Success: false,
      Message: "Token tidak valid atau telah kedaluwarsa",
    });
  }
}
