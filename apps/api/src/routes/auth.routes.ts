import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { AuthenticateToken } from "../middlewares/auth.middleware";

export const AuthRouter = Router();

AuthRouter.post("/register", AuthController.Register);
AuthRouter.post("/login", AuthController.Login);
AuthRouter.get("/me", AuthenticateToken, AuthController.GetMe);
AuthRouter.put("/profile", AuthenticateToken, AuthController.UpdateProfile);
AuthRouter.put("/password", AuthenticateToken, AuthController.ChangePassword);
