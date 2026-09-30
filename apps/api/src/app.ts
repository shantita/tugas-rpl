import express from "express";
import cors from "cors";
import { AuthRouter } from "./routes/auth.routes";
import { CategoryRouter } from "./routes/category.routes";
import { IncomeRouter } from "./routes/income.routes";
import { ExpenseRouter } from "./routes/expense.routes";
import { BudgetRouter } from "./routes/budget.routes";
import { DashboardRouter } from "./routes/dashboard.routes";
import { ReportRouter } from "./routes/report.routes";
import { ErrorHandler } from "./middlewares/error.middleware";

export const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", AuthRouter);
app.use("/api/categories", CategoryRouter);
app.use("/api/incomes", IncomeRouter);
app.use("/api/expenses", ExpenseRouter);
app.use("/api/budgets", BudgetRouter);
app.use("/api/dashboard", DashboardRouter);
app.use("/api/reports", ReportRouter);

app.use(ErrorHandler);
