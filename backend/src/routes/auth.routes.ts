import { Router, type Router as RouterType } from "express";
import { register, login, logout, getMe, changePassword } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router: RouterType = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protect, getMe);
router.patch("/change-password", protect, changePassword);

export default router;
