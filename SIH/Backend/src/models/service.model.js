import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    description: {
      type: String,
    },

    category: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      default: null,
    },

    startingPrice: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const serviceModel = mongoose.model("Service", serviceSchema);

export default serviceModel;