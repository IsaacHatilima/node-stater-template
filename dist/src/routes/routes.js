import { Router } from "express";
import authRoutes from "./authRoutes";
import settingsRoutes from "./settingsRoutes";
const router = Router();
router.use("/auth", authRoutes);
router.use("/settings", settingsRoutes);
export default router;
