import bookingModel from "../models/booking.model.js";
import serviceModel from "../models/service.model.js";
import professionalProfileModel from "../models/professionalProfile.model.js";

/*
|--------------------------------------------------------------------------
| CREATE BOOKING
|--------------------------------------------------------------------------
|
| Individual:
|   professional = selected worker
|   requestMode = individual
|
| Raised:
|   professional = null
|   requestMode = broadcast
|
*/

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
      requestMode,
    } = req.body;

    const mode =
      requestMode === "broadcast"
        ? "broadcast"
        : "individual";

    if (!service || !address || !date) {
      return res.status(400).json({
        success: false,
        message: "Service, address and date are required",
      });
    }

    /*
     * Individual booking MUST have a worker.
     */
    if (mode === "individual" && !professional) {
      return res.status(400).json({
        success: false,
        message:
          "Professional is required for an individual booking",
      });
    }

    /*
     * Broadcast booking MUST NOT have a worker.
     */
    const professionalId =
      mode === "broadcast"
        ? null
        : professional;

    const booking = await bookingModel.create({
      customer: req.user.id,
      professional: professionalId,
      service,
      requestMode: mode,
      declinedBy: [],
      address,
      date,
      timeSlot: timeSlot || "",
      description: description || "",
      price: price || 0,
      paymentMethod:
        paymentMethod || "Cash After Service",
      paymentStatus:
        paymentStatus || "PENDING",
      photos: photos || [],
      status: "pending",
    });

    const populatedBooking =
      await bookingModel
        .findById(booking._id)
        .populate(
          "customer",
          "name email phone"
        )
        .populate(
          "professional",
          "name email phone"
        )
        .populate("service");

    return res.status(201).json({
      success: true,
      message:
        mode === "broadcast"
          ? "Request raised successfully"
          : "Booking created successfully",
      booking: populatedBooking,
    });
  } catch (error) {
    console.log(
      "CREATE BOOKING ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/*
|--------------------------------------------------------------------------
| CUSTOMER BOOKINGS
|--------------------------------------------------------------------------
*/

export const getCustomerBookings = async (
  req,
  res
) => {
  try {
    const bookings =
      await bookingModel
        .find({
          customer: req.user.id,
        })
        .populate(
          "professional",
          "name email phone"
        )
        .populate("service")
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.log(
      "GET CUSTOMER BOOKINGS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/*
|--------------------------------------------------------------------------
| WORKER BOOKINGS
|--------------------------------------------------------------------------
|
| Returns TWO kinds of pending requests:
|
| 1. Individual:
|      professional === current worker
|
| 2. Raised:
|      professional === null
|      service.category === worker.category
|      worker has not declined it
|
| Accepted/active/completed jobs are returned
| only when already assigned to this worker.
|
*/

export const getProfessionalBookings = async (
  req,
  res
) => {
  try {
    const workerId = req.user.id;

    const profile =
      await professionalProfileModel.findOne({
        user: workerId,
      });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message:
          "Professional profile not found",
      });
    }

    const workerCategory =
      String(profile.category || "")
        .trim()
        .toLowerCase();

    /*
     * Find services belonging to worker's category.
     */
    const categoryServices =
      await serviceModel.find({
        category: workerCategory,
        isActive: true,
      }).select("_id");

    const serviceIds =
      categoryServices.map(
        (service) => service._id
      );

    /*
     * IMPORTANT:
     *
     * Individual bookings:
     *   already assigned to worker.
     *
     * Broadcast requests:
     *   no professional yet
     *   matching service category
     *   worker has not declined
     */
    const bookings =
      await bookingModel
        .find({
          $or: [
            {
              professional: workerId,
            },

            {
              professional: null,
              requestMode: "broadcast",
              service: {
                $in: serviceIds,
              },
              status: "pending",
              declinedBy: {
                $ne: workerId,
              },
            },
          ],
        })
        .populate(
          "customer",
          "name email phone"
        )
        .populate("service")
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.log(
      "GET PROFESSIONAL BOOKINGS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET SINGLE BOOKING
|--------------------------------------------------------------------------
*/

export const getBooking = async (
  req,
  res
) => {
  try {
    const booking =
      await bookingModel
        .findById(req.params.id)
        .populate(
          "customer",
          "name email phone"
        )
        .populate(
          "professional",
          "name email phone"
        )
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
    console.log(
      "GET BOOKING ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE BOOKING STATUS
|--------------------------------------------------------------------------
|
| Individual booking:
|   Existing behavior preserved.
|
| Broadcast booking + ACCEPTED:
|   Atomically assign worker.
|
| This atomic query is what makes:
|
| Worker A clicks Accept
| Worker B clicks Accept
|
| only ONE worker win.
|
*/

export const updateBookingStatus = async (
  req,
  res
) => {
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

    /*
     * ACCEPT BROADCAST REQUEST
     */
    if (status === "accepted") {
      const broadcastBooking =
        await bookingModel.findOne({
          _id: req.params.id,
          professional: null,
          requestMode: "broadcast",
          status: "pending",
        });

      if (broadcastBooking) {
        /*
         * Verify worker profile.
         */
        const profile =
          await professionalProfileModel.findOne({
            user: req.user.id,
          });

        if (!profile) {
          return res.status(404).json({
            success: false,
            message:
              "Professional profile not found",
          });
        }

        /*
         * Verify service category.
         */
        const service =
          await serviceModel.findById(
            broadcastBooking.service
          );

        if (!service) {
          return res.status(404).json({
            success: false,
            message: "Service not found",
          });
        }

        const workerCategory =
          String(profile.category || "")
            .trim()
            .toLowerCase();

        const serviceCategory =
          String(service.category || "")
            .trim()
            .toLowerCase();

        if (
          workerCategory !==
          serviceCategory
        ) {
          return res.status(403).json({
            success: false,
            message:
              "This request is not for your service category",
          });
        }

        /*
         * ATOMIC CLAIM
         *
         * professional:null + status:pending
         *
         * Only first successful worker gets it.
         */
        const claimedBooking =
          await bookingModel.findOneAndUpdate(
            {
              _id: req.params.id,
              professional: null,
              requestMode: "broadcast",
              status: "pending",
              declinedBy: {
                $ne: req.user.id,
              },
            },
            {
              $set: {
                professional: req.user.id,
                status: "accepted",
              },
            },
            {
              new: true,
            }
          );

        /*
         * Someone else already accepted it.
         */
        if (!claimedBooking) {
          return res.status(409).json({
            success: false,
            message:
              "This request has already been accepted by another worker",
          });
        }

        const populatedBooking =
          await bookingModel
            .findById(claimedBooking._id)
            .populate(
              "customer",
              "name email phone"
            )
            .populate(
              "professional",
              "name email phone"
            )
            .populate("service");

        return res.status(200).json({
          success: true,
          message:
            "Request accepted successfully",
          booking: populatedBooking,
        });
      }
    }

    /*
     * EXISTING INDIVIDUAL BOOKING FLOW
     *
     * Kept intact.
     */
    const booking =
      await bookingModel.findOneAndUpdate(
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

    const populatedBooking =
      await bookingModel
        .findById(booking._id)
        .populate(
          "customer",
          "name email phone"
        )
        .populate(
          "professional",
          "name email phone"
        )
        .populate("service");

    return res.status(200).json({
      success: true,
      message:
        "Booking status updated successfully",
      booking: populatedBooking,
    });
  } catch (error) {
    console.log(
      "UPDATE BOOKING STATUS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/*
|--------------------------------------------------------------------------
| DECLINE BROADCAST REQUEST
|--------------------------------------------------------------------------
|
| DO NOT cancel the booking.
|
| We only add the current worker to declinedBy.
| Other workers can still see and accept it.
|
*/

export const declineBookingRequest = async (
  req,
  res
) => {
  try {
    const booking =
      await bookingModel.findOneAndUpdate(
        {
          _id: req.params.id,
          professional: null,
          requestMode: "broadcast",
          status: "pending",
        },
        {
          $addToSet: {
            declinedBy: req.user.id,
          },
        },
        {
          new: true,
        }
      );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message:
          "Request is no longer available",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Request declined",
      booking,
    });
  } catch (error) {
    console.log(
      "DECLINE BOOKING REQUEST ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/*
|--------------------------------------------------------------------------
| CANCEL CUSTOMER BOOKING
|--------------------------------------------------------------------------
*/

export const cancelBooking = async (
  req,
  res
) => {
  try {
    const booking =
      await bookingModel.findOneAndUpdate(
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
      message:
        "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    console.log(
      "CANCEL BOOKING ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};