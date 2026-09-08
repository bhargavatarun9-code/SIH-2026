import express from "express";
import {
  createService,
  getServices,
  getService,
  updateService,
  deleteService,
} from "../controllers/service.controller.js";

const router = express.Router();

router.post("/", createService);
router.get("/", getServices);
router.get("/:id", getService);
router.put("/:id", updateService);
router.delete("/:id", deleteService);

export default router;
