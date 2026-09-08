import professionalProfileModel from "../models/professionalProfile.model.js";

export const createProfessionalProfile = async (req, res) => {
  try {
    const { category, skills, experience, description, hourlyRate, location } =
      req.body;

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
      category,
      skills,
      experience,
      description,
      hourlyRate,
      location,
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

export const getProfessionals = async (req, res) => {
  try {
    const professionals = await professionalProfileModel
      .find()
      .populate("user", "name email phone profileImage");

    return res.status(200).json({
      success: true,
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

export const getProfessional = async (req, res) => {
  try {
    const professional = await professionalProfileModel
      .findById(req.params.id)
      .populate("user", "name email phone profileImage");

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

export const updateProfessionalProfile = async (req, res) => {
  try {
    const profile = await professionalProfileModel.findOneAndUpdate(
      { user: req.user.id },
      req.body,
      { new: true }
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
