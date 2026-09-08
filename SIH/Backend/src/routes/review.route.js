import express from "express";
import {
  createReview,
  getProfessionalReviews,
} from "../controllers/review.controller.js";

const router = express.Router();

router.post("/", createReview);
router.get("/professional/:id", getProfessionalReviews);

export default router;
