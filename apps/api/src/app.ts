import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { AuthRouter } from "./routes/auth.routes";
import { CategoryRouter } from "./routes/category.routes";
import { IncomeRouter } from "./routes/income.routes";
import { ExpenseRouter } from "./routes/expense.routes";
import { BudgetRouter } from "./routes/budget.routes";
import { DashboardRouter } from "./routes/dashboard.routes";
import { ReportRouter } from "./routes/report.routes";
import { ErrorHandler } from "./middlewares/error.middleware";

export const app = express();

const clientUrl = process.env.CLIENT_URL;
const allowedOrigins = [
  clientUrl,
  "https://tugas-rpl-chi.vercel.app",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Izinkan request tanpa origin (seperti mobile app, postman, curl) atau domain yang diizinkan
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/auth", AuthRouter);
app.use("/api/categories", CategoryRouter);
app.use("/api/incomes", IncomeRouter);
app.use("/api/expenses", ExpenseRouter);
app.use("/api/budgets", BudgetRouter);
app.use("/api/dashboard", DashboardRouter);
app.use("/api/reports", ReportRouter);

// Sajikan static frontend jika aplikasi di-deploy sebagai satu server (single service)
const distWebPath = path.resolve(__dirname, "../../web/dist");
if (fs.existsSync(distWebPath)) {
  app.use(express.static(distWebPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(distWebPath, "index.html"));
  });
}

app.use(ErrorHandler);

export default app;
