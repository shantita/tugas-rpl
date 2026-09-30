import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export class HttpException extends Error {
  public StatusCode: number;
  public override message: string;

  constructor(statusCode: number, message: string) {
    super(message);
    this.StatusCode = statusCode;
    this.message = message;
  }
}

export function ErrorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof HttpException) {
    return res.status(err.StatusCode).json({
      Success: false,
      Message: err.message,
    });
  }

  if (err instanceof ZodError) {
    const errorMessages = err.errors.map((e) => e.message).join(", ");
    return res.status(400).json({
      Success: false,
      Message: errorMessages || "Data yang dikirimkan tidak valid",
    });
  }

  return res.status(500).json({
    Success: false,
    Message: "Terjadi kesalahan pada server",
  });
}
