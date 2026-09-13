import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import requireRole from "../middlewares/requireRole.js";
import {
  createBooking,
  getCustomerBookings,
  getProfessionalBookings,
  getBooking,
  updateBookingStatus,
  cancelBooking,
} from "../controllers/booking.controller.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", requireRole("customer"), createBooking);
router.get("/customer", requireRole("customer"), getCustomerBookings);
router.get("/professional", requireRole("professional"), getProfessionalBookings);
router.get("/:id", getBooking);
router.patch("/:id/status", requireRole("professional"), updateBookingStatus);
router.patch("/:id/cancel", cancelBooking);

export default router;