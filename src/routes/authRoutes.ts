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
import {TwoFactorChallengeController} from "../controllers/auth/TwoFactorChallengeController";
import GoogleLoginController from "../controllers/auth/GoogleLoginController";


const router = Router();

router.post("/login", AuthLimiter, LoginController);
router.post("/logout", AuthMiddleware, LogoutController);
router.post("/register", AuthLimiter, RegisterController);
router.get("/me", AuthMiddleware, MeController);
router.get("/verify-email", AuthLimiter, VerifyEmailController);
router.post("/refresh-tokens", AuthMiddleware, RefreshTokenController);
router.post("/forgot-password", AuthLimiter, ForgotPasswordController);
router.get("/check-password-reset-token", AuthLimiter, ForgotPasswordTokenCheckerController);
router.post("/change-password", ChangePasswordController);
router.post("/2fa/verify", AuthLimiter, TwoFactorChallengeController);
router.post("/google", AuthLimiter, GoogleLoginController);

export default router;