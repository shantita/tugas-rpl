import { Router } from "express";
import { ReportController } from "../controllers/report.controller";
import { AuthenticateToken } from "../middlewares/auth.middleware";

export const ReportRouter = Router();

ReportRouter.use(AuthenticateToken);
ReportRouter.get("/monthly", ReportController.GetMonthlyReport);
