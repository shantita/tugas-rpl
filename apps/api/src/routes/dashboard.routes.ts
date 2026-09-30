import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller";
import { AuthenticateToken } from "../middlewares/auth.middleware";

export const DashboardRouter = Router();

DashboardRouter.use(AuthenticateToken);
DashboardRouter.get("/summary", DashboardController.GetSummary);
DashboardRouter.get("/categories", DashboardController.GetCategories);
DashboardRouter.get("/daily-limit", DashboardController.GetDailyLimit);
