import reviewModel from "../models/review.model.js";
import bookingModel from "../models/booking.model.js";

export const createReview = async (req, res) => {
  try {
    const { booking, rating, comment } = req.body;

    // -----------------------------
    // Basic validation
    // -----------------------------
    if (!booking || rating === undefined || rating === null) {
      return res.status(400).json({
        success: false,
        message: "Booking and rating are required",
      });
    }

    const numericRating = Number(rating);

    if (
      Number.isNaN(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // -----------------------------
    // Find booking
    // -----------------------------
    const bookingData = await bookingModel.findById(booking);

    if (!bookingData) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // -----------------------------
    // Only the customer of the
    // booking can review it
    // -----------------------------
    if (bookingData.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You cannot review this booking",
      });
    }

    // -----------------------------
    // Only completed jobs can
    // receive reviews
    // -----------------------------
    if (bookingData.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "You can only review completed bookings",
      });
    }

    // -----------------------------
    // One review per booking
    // -----------------------------
    const existingReview = await reviewModel.findOne({
      booking,
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this booking",
      });
    }

    // -----------------------------
    // Create review
    // -----------------------------
    const review = await reviewModel.create({
      customer: req.user.id,
      professional: bookingData.professional,
      booking,
      rating: numericRating,
      comment: comment?.trim() || "",
    });

    // -----------------------------
    // Return populated review
    // -----------------------------
    const populatedReview = await reviewModel
      .findById(review._id)
      .populate("customer", "name profileImage");

    return res.status(201).json({
      success: true,
      message: "Review created successfully",
      review: populatedReview,
    });
  } catch (error) {
    console.log("CREATE REVIEW ERROR:", error);

    // Handles MongoDB unique-index duplicate
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this booking",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// =====================================================
// GET ALL REVIEWS FOR A PROFESSIONAL
// =====================================================

export const getProfessionalReviews = async (req, res) => {
  try {
    const reviews = await reviewModel
      .find({
        professional: req.params.id,
      })
      .populate("customer", "name profileImage")
      .sort({
        createdAt: -1,
      });

    // Calculate average rating
    const totalReviews = reviews.length;

    const totalRating = reviews.reduce(
      (sum, review) => sum + Number(review.rating || 0),
      0
    );

    const averageRating =
      totalReviews > 0
        ? Number((totalRating / totalReviews).toFixed(1))
        : 0;

    return res.status(200).json({
      success: true,
      reviews,
      stats: {
        averageRating,
        totalReviews,
      },
    });
  } catch (error) {
    console.log("GET PROFESSIONAL REVIEWS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};