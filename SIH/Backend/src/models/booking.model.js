import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /*
     * For individual booking:
     * professional = selected worker
     *
     * For raised/broadcast request:
     * professional = null until a worker accepts it
     */
    professional: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
    },

    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    /*
     * individual = customer selected a specific worker
     * broadcast = request raised for all workers of category
     */
    requestMode: {
      type: String,
      enum: ["individual", "broadcast"],
      default: "individual",
    },

    /*
     * Workers who declined a broadcast request.
     * The request remains available to other workers.
     */
    declinedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    address: {
      type: String,
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    timeSlot: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    photos: {
      type: [String],
      default: [],
    },

    price: {
      type: Number,
      default: 0,
    },

    paymentMethod: {
      type: String,
      default: "Cash After Service",
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID"],
      default: "PENDING",
    },

    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "in_progress",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const bookingModel = mongoose.model(
  "Booking",
  bookingSchema
);

export default bookingModel;