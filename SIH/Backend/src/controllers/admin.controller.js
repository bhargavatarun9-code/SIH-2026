import userModel from "../models/user.model.js";
import bookingModel from "../models/booking.model.js";
import serviceModel from "../models/service.model.js";

export const getOverview = async (req, res) => {
  try {
    const [totalUsers, totalProfessionals, totalCustomers, totalBookings, completedBookings, totalServices] =
      await Promise.all([
        userModel.countDocuments(),
        userModel.countDocuments({ role: "professional" }),
        userModel.countDocuments({ role: "customer" }),
        bookingModel.countDocuments(),
        bookingModel.countDocuments({ status: "completed" }),
        serviceModel.countDocuments({ isActive: true }),
      ]);

    return res.status(200).json({
      success: true,
      overview: { totalUsers, totalProfessionals, totalCustomers, totalBookings, completedBookings, totalServices },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};