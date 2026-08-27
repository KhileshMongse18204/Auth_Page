import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";

const authRouter = Router();

// Post api/auth/register

authRouter.post("/register", authController.register);

// Post api/auth/login
authRouter.post("/login", authController.login);

// get api/auth/get-me
authRouter.get("/get-me", authController.getMe);


// get api/auth/refresh-token
authRouter.get("/refresh-token", authController.refreshToken);

// get api/auth/logout
authRouter.get("/logout", authController.logout);

// get api/auth/logout-all
authRouter.get("/logout-all", authController.logoutAll);

// Post api/auth/verify-email
authRouter.post("/verify-email", authController.verifyEmail);


export default authRouter;