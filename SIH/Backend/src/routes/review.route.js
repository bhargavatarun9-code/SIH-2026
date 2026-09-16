import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import requireRole from "../middlewares/requireRole.js";

import {
  createReview,
  getProfessionalReviews,
} from "../controllers/review.controller.js";

const router = express.Router();

// Customer creates a review
router.post(
  "/",
  authMiddleware,
  requireRole("customer"),
  createReview
);

// Anyone can view professional reviews
router.get(
  "/professional/:id",
  getProfessionalReviews
);

export default router;