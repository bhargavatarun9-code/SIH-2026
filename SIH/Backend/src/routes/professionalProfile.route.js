import express from "express";
import {
  createProfessionalProfile,
  getProfessionals,
  getProfessional,
  updateProfessionalProfile,
  deleteProfessionalProfile,
} from "../controllers/professionalProfile.controller.js";

const router = express.Router();

router.post("/", createProfessionalProfile);
router.get("/", getProfessionals);
router.get("/:id", getProfessional);
router.put("/", updateProfessionalProfile);
router.delete("/", deleteProfessionalProfile);

export default router;
