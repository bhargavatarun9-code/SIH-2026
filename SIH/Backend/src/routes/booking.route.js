import express from "express";

import authMiddleware from "../middlewares/authMiddleware.js";
import requireRole from "../middlewares/requireRole.js";

import {
  createBooking,
  getCustomerBookings,
  getProfessionalBookings,
  getBooking,
  updateBookingStatus,
  declineBookingRequest,
  cancelBooking,
} from "../controllers/booking.controller.js";

const router = express.Router();

router.use(authMiddleware);

/*
|--------------------------------------------------------------------------
| CREATE
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  requireRole("customer"),
  createBooking
);

/*
|--------------------------------------------------------------------------
| CUSTOMER
|--------------------------------------------------------------------------
*/

router.get(
  "/customer",
  requireRole("customer"),
  getCustomerBookings
);

/*
|--------------------------------------------------------------------------
| WORKER
|--------------------------------------------------------------------------
*/

router.get(
  "/professional",
  requireRole("professional"),
  getProfessionalBookings
);

/*
|--------------------------------------------------------------------------
| BROADCAST DECLINE
|--------------------------------------------------------------------------
|
| Must be BEFORE /:id routes.
|
*/

router.patch(
  "/:id/decline",
  requireRole("professional"),
  declineBookingRequest
);

/*
|--------------------------------------------------------------------------
| SINGLE BOOKING
|--------------------------------------------------------------------------
*/

router.get(
  "/:id",
  getBooking
);

/*
|--------------------------------------------------------------------------
| WORKER STATUS
|--------------------------------------------------------------------------
*/

router.patch(
  "/:id/status",
  requireRole("professional"),
  updateBookingStatus
);

/*
|--------------------------------------------------------------------------
| CUSTOMER CANCEL
|--------------------------------------------------------------------------
*/

router.patch(
  "/:id/cancel",
  cancelBooking
);

export default router;