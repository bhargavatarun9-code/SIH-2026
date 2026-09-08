import express from "express";
import {
  createBooking,
  getCustomerBookings,
  getProfessionalBookings,
  getBooking,
  updateBookingStatus,
  cancelBooking,
} from "../controllers/booking.controller.js";

const router = express.Router();

router.post("/", createBooking);
router.get("/customer", getCustomerBookings);
router.get("/professional", getProfessionalBookings);
router.get("/:id", getBooking);
router.patch("/:id/status", updateBookingStatus);
router.patch("/:id/cancel", cancelBooking);

export default router;
