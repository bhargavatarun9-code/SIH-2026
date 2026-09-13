import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import requireRole from "../middlewares/requireRole.js";
import {
  createService,
  getServices,
  getService,
  updateService,
  deleteService,
} from "../controllers/service.controller.js";

const router = express.Router();

router.post("/", authMiddleware, requireRole("admin"), createService);
router.get("/", getServices);
router.get("/:id", getService);
router.put("/:id", authMiddleware, requireRole("admin"), updateService);
router.delete("/:id", authMiddleware, requireRole("admin"), deleteService);

export default router;