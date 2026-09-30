import { Router } from "express";
import { ExpenseController } from "../controllers/expense.controller";
import { AuthenticateToken } from "../middlewares/auth.middleware";

export const ExpenseRouter = Router();

ExpenseRouter.use(AuthenticateToken);
ExpenseRouter.get("/", ExpenseController.GetAll);
ExpenseRouter.get("/:Id", ExpenseController.GetById);
ExpenseRouter.post("/", ExpenseController.Create);
ExpenseRouter.put("/:Id", ExpenseController.Update);
ExpenseRouter.delete("/:Id", ExpenseController.Delete);
