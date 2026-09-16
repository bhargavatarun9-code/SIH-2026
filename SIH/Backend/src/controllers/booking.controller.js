import bookingModel from "../models/booking.model.js";

export const createBooking = async (req, res) => {
  try {
    const {
      professional,
      service,
      address,
      date,
      timeSlot,
      description,
      price,
      paymentMethod,
      paymentStatus,
      photos,
    } = req.body;

    if (!professional || !service || !address || !date) {
      return res.status(400).json({
        success: false,
        message: "Professional, service, address and date are required",
      });
    }

    const booking = await bookingModel.create({
      customer: req.user.id,
      professional,
      service,
      address,
      date,
      timeSlot: timeSlot || "",
      description: description || "",
      price: price || 0,
      paymentMethod: paymentMethod || "Cash After Service",
      paymentStatus: paymentStatus || "PENDING",
      photos: photos || [],
      status: "pending",
    });

    const populatedBooking = await bookingModel
      .findById(booking._id)
      .populate("customer", "name email phone")
      .populate("professional", "name email phone")
      .populate("service");

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking: populatedBooking,
    });
  } catch (error) {
    console.log("CREATE BOOKING ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getCustomerBookings = async (req, res) => {
  try {
    const bookings = await bookingModel
      .find({ customer: req.user.id })
      .populate("professional", "name email phone")
      .populate("service")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.log("GET CUSTOMER BOOKINGS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getProfessionalBookings = async (req, res) => {
  try {
    const bookings = await bookingModel
      .find({ professional: req.user.id })
      .populate("customer", "name email phone")
      .populate("service")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.log("GET PROFESSIONAL BOOKINGS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getBooking = async (req, res) => {
  try {
    const booking = await bookingModel
      .findById(req.params.id)
      .populate("customer", "name email phone")
      .populate("professional", "name email phone")
      .populate("service");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    return res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.log("GET BOOKING ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "accepted",
      "in_progress",
      "completed",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status",
      });
    }

    const booking = await bookingModel.findOneAndUpdate(
      {
        _id: req.params.id,
        professional: req.user.id,
      },
      {
        status,
      },
      {
        new: true,
      }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      booking,
    });
  } catch (error) {
    console.log("UPDATE BOOKING STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const booking = await bookingModel.findOneAndUpdate(
      {
        _id: req.params.id,
        customer: req.user.id,
      },
      {
        status: "cancelled",
      },
      {
        new: true,
      }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    console.log("CANCEL BOOKING ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};