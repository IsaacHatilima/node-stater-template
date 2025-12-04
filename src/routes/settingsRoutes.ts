import {Router} from "express";
import {AuthMiddleware} from "../middleware/authMiddleware";
import UpdatePasswordController from "../controllers/settings/UpdatePasswordController";
import UpdateProfileController from "../controllers/settings/UpdateProfileController";

const router = Router();

router.use(AuthMiddleware);

router.put("/update-password", UpdatePasswordController);
router.put("/update-profile", UpdateProfileController)

export default router;