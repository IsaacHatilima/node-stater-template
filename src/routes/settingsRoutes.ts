import {Router} from "express";
import {AuthMiddleware} from "../middleware/authMiddleware";
import UpdatePasswordController from "../controllers/settings/UpdatePasswordController";
import UpdateProfileController from "../controllers/settings/UpdateProfileController";
import DeleteAccountController from "../controllers/settings/DeleteAccountController";

const router = Router();

router.use(AuthMiddleware);

router.put("/update-password", UpdatePasswordController);
router.put("/update-profile", UpdateProfileController)
router.post("/delete-account", DeleteAccountController);

export default router;