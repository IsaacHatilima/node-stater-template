import {Router} from "express";
import {AuthMiddleware} from "../middleware/authMiddleware";
import UpdatePasswordController from "../controllers/settings/UpdatePasswordController";

const router = Router();

router.use(AuthMiddleware);

router.post("/update-password", UpdatePasswordController);

export default router;