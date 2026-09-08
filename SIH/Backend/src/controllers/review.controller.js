import reviewModel from "../models/review.model.js";
import bookingModel from "../models/booking.model.js";

export const createReview = async (req, res) => {
  try {
    const { booking, rating, comment } = req.body;

    if (!booking || !rating) {
      return res.status(400).json({
        success: false,
        message: "Booking and rating are required",
      });
    }

    const existingReview = await reviewModel.findOne({
      booking,
      customer: req.user.id,
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "You already reviewed this booking",
      });
    }

    const bookingData = await bookingModel.findById(booking);

    if (!bookingData) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (bookingData.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You cannot review this booking",
      });
    }

    if (bookingData.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "You can only review completed bookings",
      });
    }

    const review = await reviewModel.create({
      customer: req.user.id,
      professional: bookingData.professional,
      booking,
      rating,
      comment,
    });

    return res.status(201).json({
      success: true,
      message: "Review created successfully",
      review,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getProfessionalReviews = async (req, res) => {
  try {
    const reviews = await reviewModel
      .find({ professional: req.params.id })
      .populate("customer", "name profileImage");

    return res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};