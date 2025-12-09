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