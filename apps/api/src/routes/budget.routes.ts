import { Router } from "express";
import { BudgetController } from "../controllers/budget.controller";
import { AuthenticateToken } from "../middlewares/auth.middleware";

export const BudgetRouter = Router();

BudgetRouter.use(AuthenticateToken);
BudgetRouter.get("/", BudgetController.GetAll);
BudgetRouter.get("/:Id", BudgetController.GetById);
BudgetRouter.post("/", BudgetController.Create);
BudgetRouter.put("/:Id", BudgetController.Update);
BudgetRouter.delete("/:Id", BudgetController.Delete);
