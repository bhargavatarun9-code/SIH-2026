import bookingModel from "../models/booking.model.js";

export const createBooking = async (req, res) => {
  try {
    const {
      professional,
      service,
      address,
      date,
      description,
      price,
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
      description,
      price,
    });

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    console.log(error);

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
      .populate("service");

    return res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.log(error);

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
      .populate("service");

    return res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.log(error);

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
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const booking = await bookingModel.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Booking status updated",
      booking,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const booking = await bookingModel.findByIdAndUpdate(
      req.params.id,
      { status: "cancelled" },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Booking cancelled",
      booking,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};