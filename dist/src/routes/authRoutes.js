import { Router } from "express";
import RegisterController from "../controllers/auth/RegisterController";
import LoginController from "../controllers/auth/LoginController";
import MeController from "../controllers/auth/MeController";
import { AuthMiddleware } from "../middleware/authMiddleware";
import { AuthLimiter } from "../middleware/rateLimiter";
import VerifyEmailController from "../controllers/auth/VerifyEmailController";
import RefreshTokenController from "../controllers/auth/RefreshTokenController";
import LogoutController from "../controllers/auth/LogoutController";
import ForgotPasswordController from "../controllers/auth/ForgotPasswordController";
import ForgotPasswordTokenCheckerController from "../controllers/auth/ForgotPasswordTokenCheckerController";
import ChangePasswordController from "../controllers/auth/ChangePasswordController";
import { TwoFactorChallengeController } from "../controllers/auth/TwoFactorChallengeController";
import GoogleLoginController from "../controllers/auth/GoogleLoginController";
const router = Router();
/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [first_name, last_name, email, password, password_confirm]
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               password_confirm:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: Registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation or email taken
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Logged in or 2FA required
 *         content:
 *           application/json:
 *             oneOf:
 *               - type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                   user:
 *                     $ref: '#/components/schemas/User'
 *                   access_token:
 *                     type: string
 *                   refresh_token:
 *                     type: string
 *               - type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                   two_factor_required:
 *                     type: boolean
 *                   challenge_id:
 *                     type: string
 *                   user:
 *                     $ref: '#/components/schemas/User'
 *       404:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /auth/google:
 *   post:
 *     tags: [Auth]
 *     summary: Login with Google ID token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged in or 2FA required
 *       400:
 *         description: Invalid Google token
 *       404:
 *         description: No account connected
 *
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 * /auth/verify-email:
 *   get:
 *     tags: [Auth]
 *     summary: Verify email with token
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email verified
 *       400:
 *         description: Invalid or already verified
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 * /auth/refresh-tokens:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access and refresh tokens from cookie
 *     responses:
 *       200:
 *         description: Tokens refreshed
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout and clear cookies
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out
 *
 * /auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Request password reset email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Reset mail queued
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 * /auth/check-password-reset-token:
 *   get:
 *     tags: [Auth]
 *     summary: Check if a password reset token is valid
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Token valid
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 * /auth/change-password:
 *   post:
 *     tags: [Auth]
 *     summary: Change password using a reset token
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password, password_confirm]
 *             properties:
 *               password:
 *                 type: string
 *               password_confirm:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed
 *       400:
 *         description: Invalid token or password
 *
 * /auth/2fa/verify:
 *   post:
 *     tags: [Auth]
 *     summary: Verify 2FA challenge and complete login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [challenge_id, code]
 *             properties:
 *               challenge_id:
 *                 type: string
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: 2FA verified
 */
router.post("/login", AuthLimiter, LoginController);
router.post("/logout", AuthMiddleware, LogoutController);
router.post("/register", AuthLimiter, RegisterController);
router.get("/me", AuthMiddleware, MeController);
router.get("/verify-email", AuthLimiter, VerifyEmailController);
router.post("/refresh-tokens", RefreshTokenController);
router.post("/forgot-password", AuthLimiter, ForgotPasswordController);
router.get("/check-password-reset-token", AuthLimiter, ForgotPasswordTokenCheckerController);
router.post("/change-password", ChangePasswordController);
router.post("/2fa/verify", AuthLimiter, TwoFactorChallengeController);
router.post("/google", AuthLimiter, GoogleLoginController);
export default router;
