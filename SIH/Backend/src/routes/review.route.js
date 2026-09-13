import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import requireRole from "../middlewares/requireRole.js";
import {
  createReview,
  getProfessionalReviews,
} from "../controllers/review.controller.js";

const router = express.Router();

router.post("/", authMiddleware, requireRole("customer"), createReview);
router.get("/professional/:id", getProfessionalReviews);

export default router;