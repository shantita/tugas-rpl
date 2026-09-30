import { Router } from "express";
import { IncomeController } from "../controllers/income.controller";
import { AuthenticateToken } from "../middlewares/auth.middleware";

export const IncomeRouter = Router();

IncomeRouter.use(AuthenticateToken);
IncomeRouter.get("/", IncomeController.GetAll);
IncomeRouter.get("/:Id", IncomeController.GetById);
IncomeRouter.post("/", IncomeController.Create);
IncomeRouter.put("/:Id", IncomeController.Update);
IncomeRouter.delete("/:Id", IncomeController.Delete);
