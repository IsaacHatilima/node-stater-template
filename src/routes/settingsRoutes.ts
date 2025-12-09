import {Router} from "express";
import {AuthMiddleware} from "../middleware/authMiddleware";
import UpdatePasswordController from "../controllers/settings/UpdatePasswordController";
import UpdateProfileController from "../controllers/settings/UpdateProfileController";
import DeleteAccountController from "../controllers/settings/DeleteAccountController";
import {
    TwoFADisableController,
    TwoFAEnableController,
    TwoFARegenerateCodesController,
    TwoFASetupController
} from "../controllers/settings/TwoFactorController";

const router = Router();

/**
 * @openapi
 * /settings/update-password:
 *   put:
 *     tags: [Settings]
 *     summary: Update password for authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [current_password, password, password_confirm]
 *             properties:
 *               current_password:
 *                 type: string
 *               password:
 *                 type: string
 *               password_confirm:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid password
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 * /settings/update-profile:
 *   put:
 *     tags: [Settings]
 *     summary: Update profile fields for authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [first_name, last_name, email]
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Profile updated
 *       400:
 *         description: Validation or update failed
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 * /settings/delete-account:
 *   post:
 *     tags: [Settings]
 *     summary: Delete the authenticated user's account
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Account deleted
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 * /settings/2fa/setup:
 *   post:
 *     tags: [Settings]
 *     summary: Initiate 2FA setup
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 2FA setup initiated (secret/otpauth QR data)
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 * /settings/2fa/enable:
 *   post:
 *     tags: [Settings]
 *     summary: Verify token and enable 2FA
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code]
 *             properties:
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: 2FA enabled
 *       400:
 *         description: Setup not found or invalid token
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 * /settings/2fa/disable:
 *   post:
 *     tags: [Settings]
 *     summary: Disable 2FA using TOTP code or backup code
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               backup_code:
 *                 type: string
 *     responses:
 *       200:
 *         description: 2FA disabled
 *       400:
 *         description: Invalid token or backup code
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 * /settings/2fa/regenerate:
 *   post:
 *     tags: [Settings]
 *     summary: Regenerate 2FA backup codes
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Backup codes regenerated
 *       400:
 *         description: 2FA not enabled
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

router.use(AuthMiddleware);

router.put("/update-password", UpdatePasswordController);
router.put("/update-profile", UpdateProfileController)
router.post("/delete-account", DeleteAccountController);

// Two-Factor Authentication (2FA) settings
router.post("/2fa/setup", TwoFASetupController);
router.post("/2fa/enable", TwoFAEnableController);
router.post("/2fa/disable", TwoFADisableController);
router.post("/2fa/regenerate", TwoFARegenerateCodesController);

export default router;