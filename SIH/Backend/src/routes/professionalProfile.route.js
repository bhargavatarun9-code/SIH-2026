import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import requireRole from "../middlewares/requireRole.js";
import {
  createProfessionalProfile,
  getProfessionals,
  getProfessional,
  updateProfessionalProfile,
  deleteProfessionalProfile,
} from "../controllers/professionalProfile.controller.js";

const router = express.Router();

router.post("/", authMiddleware, requireRole("professional"), createProfessionalProfile);
router.get("/", getProfessionals);
router.get("/:id", getProfessional);
router.put("/", authMiddleware, requireRole("professional"), updateProfessionalProfile);
router.delete("/", authMiddleware, requireRole("professional"), deleteProfessionalProfile);

export default router;