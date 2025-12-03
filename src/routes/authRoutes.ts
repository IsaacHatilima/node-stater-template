import {Router} from "express";
import RegisterController from "../controllers/auth/RegisterController";
import LoginController from "../controllers/auth/LoginController";
import MeController from "../controllers/auth/MeController";
import {AuthMiddleware} from "../middleware/authMiddleware";
import {AuthLimiter} from "../middleware/rateLimiter";
import VerifyEmailController from "../controllers/auth/VerifyEmailController";
import RefreshTokenController from "../controllers/auth/RefreshTokenController";
import LogoutController from "../controllers/auth/LogoutController";
import ForgotPasswordController from "../controllers/auth/ForgotPasswordController";
import ForgotPasswordTokenCheckerController from "../controllers/auth/ForgotPasswordTokenCheckerController";
import ChangePasswordController from "../controllers/auth/ChangePasswordController";

const router = Router();

router.post("/login", AuthLimiter, LoginController);
router.post("/logout", AuthMiddleware, LogoutController);
router.post("/register", AuthLimiter, RegisterController);
router.get("/me", AuthMiddleware, MeController);
router.get("/verify-email", VerifyEmailController);
router.post("/refresh", RefreshTokenController);
router.post("/forgot-password", ForgotPasswordController);
router.get("/check-password-reset-token", ForgotPasswordTokenCheckerController);
router.post("/change-password", ChangePasswordController);

export default router;