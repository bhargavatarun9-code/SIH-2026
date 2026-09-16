import mongoose from "mongoose";

const professionalProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    category: {
      type: String,
      required: true,
    },

    skills: [String],

    experience: {
      type: Number,
      default: 0,
    },

    description: String,

    hourlyRate: Number,

    location: {
      type: String,
      required: true,
    },

    rating: {
      type: Number,
      default: 0,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const professionalProfileModel = mongoose.model(
  "ProfessionalProfile",
  professionalProfileSchema
);

export default professionalProfileModel;