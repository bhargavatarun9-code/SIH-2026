import professionalProfileModel from "../models/professionalProfile.model.js";

export const createProfessionalProfile = async (req, res) => {
  try {
    const {
      category,
      skills,
      experience,
      description,
      hourlyRate,
      location,
    } = req.body;

    if (!category || !location) {
      return res.status(400).json({
        success: false,
        message: "Category and location are required",
      });
    }

    const existingProfile = await professionalProfileModel.findOne({
      user: req.user.id,
    });

    if (existingProfile) {
      return res.status(409).json({
        success: false,
        message: "Professional profile already exists",
      });
    }

    const profile = await professionalProfileModel.create({
      user: req.user.id,
      category: category.toLowerCase().trim(),
      skills: Array.isArray(skills) ? skills : [],
      experience: Number(experience) || 0,
      description: description || "",
      hourlyRate: Number(hourlyRate) || 500,
      location: location.trim(),
      rating: 0,
      isAvailable: true,
    });

    return res.status(201).json({
      success: true,
      message: "Professional profile created",
      profile,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ---------------------------------------------------------
// GET ALL / FILTERED PROFESSIONALS
// ---------------------------------------------------------
export const getProfessionals = async (req, res) => {
  try {
    const { category, location, available } = req.query;

    const filter = {};

    if (category && category !== "all") {
      filter.category = category.toLowerCase().trim();
    }

    if (location) {
      filter.location = {
        $regex: location.trim(),
        $options: "i",
      };
    }

    if (available === "true") {
      filter.isAvailable = true;
    }

    const professionals = await professionalProfileModel
      .find(filter)
      .populate("user", "name email phone profileImage address")
      .sort({
        rating: -1,
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: professionals.length,
      professionals,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ---------------------------------------------------------
// GET SINGLE PROFESSIONAL
// ---------------------------------------------------------
export const getProfessional = async (req, res) => {
  try {
    const professional = await professionalProfileModel
      .findById(req.params.id)
      .populate("user", "name email phone profileImage address");

    if (!professional) {
      return res.status(404).json({
        success: false,
        message: "Professional not found",
      });
    }

    return res.status(200).json({
      success: true,
      professional,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ---------------------------------------------------------
// UPDATE PROFESSIONAL PROFILE
// ---------------------------------------------------------
export const updateProfessionalProfile = async (req, res) => {
  try {
    const allowedFields = [
      "category",
      "skills",
      "experience",
      "description",
      "hourlyRate",
      "location",
      "isAvailable",
    ];

    const updateData = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    if (updateData.category) {
      updateData.category = updateData.category.toLowerCase().trim();
    }

    if (updateData.location) {
      updateData.location = updateData.location.trim();
    }

    if (updateData.hourlyRate !== undefined) {
      updateData.hourlyRate = Number(updateData.hourlyRate);
    }

    if (updateData.experience !== undefined) {
      updateData.experience = Number(updateData.experience);
    }

    const profile = await professionalProfileModel.findOneAndUpdate(
      { user: req.user.id },
      updateData,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Professional profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Professional profile updated",
      profile,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ---------------------------------------------------------
// DELETE PROFESSIONAL PROFILE
// ---------------------------------------------------------
export const deleteProfessionalProfile = async (req, res) => {
  try {
    const profile = await professionalProfileModel.findOneAndDelete({
      user: req.user.id,
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Professional profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Professional profile deleted",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};