import { Router } from "express";
import { CategoryController } from "../controllers/category.controller";
import { AuthenticateToken } from "../middlewares/auth.middleware";

export const CategoryRouter = Router();

CategoryRouter.use(AuthenticateToken);
CategoryRouter.get("/", CategoryController.GetAll);
CategoryRouter.post("/", CategoryController.Create);
CategoryRouter.put("/:Id", CategoryController.Update);
CategoryRouter.delete("/:Id", CategoryController.Delete);
