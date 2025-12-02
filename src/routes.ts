import {Router} from "express";
import RegisterController from "./controllers/auth/RegisterController";
import LoginController from "./controllers/auth/LoginController";
import MeController from "./controllers/auth/MeController";
import {AuthMiddleware} from "./middleware/authMiddleware";
import {AuthLimiter} from "./middleware/rateLimiter";
import VerifyEmailController from "./controllers/auth/VerifyEmailController";
import RefreshTokenController from "./controllers/auth/RefreshTokenController";
import LogoutController from "./controllers/auth/LogoutController";
import ForgotPasswordController from "./controllers/auth/ForgotPasswordController";
import ForgotPasswordTokenCheckerController from "./controllers/auth/ForgotPasswordTokenCheckerController";
import ChangePasswordController from "./controllers/auth/ChangePasswordController";

const router = Router();

router.post("/auth/login", AuthLimiter, LoginController);
router.post("/auth/logout", AuthMiddleware, LogoutController);
router.post("/auth/register", AuthLimiter, RegisterController);
router.get("/auth/me", AuthMiddleware, MeController);
router.get("/auth/verify-email", VerifyEmailController);
router.post("/auth/refresh", RefreshTokenController);
router.post("/auth/forgot-password", ForgotPasswordController);
router.get("/auth/check-password-reset-token", ForgotPasswordTokenCheckerController);
router.post("/auth/change-password", ChangePasswordController);

export default router;
