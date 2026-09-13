import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import requireRole from "../middlewares/requireRole.js";
import { getOverview } from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/overview", authMiddleware, requireRole("admin"), getOverview);

export default router;