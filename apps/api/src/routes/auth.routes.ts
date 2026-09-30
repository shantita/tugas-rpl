import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { AuthenticateToken } from "../middlewares/auth.middleware";

export const AuthRouter = Router();

AuthRouter.post("/register", AuthController.Register);
AuthRouter.post("/login", AuthController.Login);
AuthRouter.get("/me", AuthenticateToken, AuthController.GetMe);
