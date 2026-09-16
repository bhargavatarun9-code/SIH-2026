import serviceModel from "../models/service.model.js";

/*
|--------------------------------------------------------------------------
| DEFAULT SERVICES
|--------------------------------------------------------------------------
|
| These are automatically created if MongoDB does not contain
| any active services.
|
*/

const DEFAULT_SERVICES = [
  {
    name: "Tap & Pipe Leak Repair",
    category: "plumbing",
    description:
      "Fix leaking taps, pipes, bathroom fittings and water leakage.",
    startingPrice: 299,
  },

  {
    name: "Full Home Wiring Check",
    category: "electrical",
    description:
      "Switchboard, wiring, short-circuit and basic electrical repair.",
    startingPrice: 349,
  },

  {
    name: "Deep Home Cleaning",
    category: "cleaning",
    description:
      "Full apartment and household deep cleaning service.",
    startingPrice: 999,
  },

  {
    name: "Washing Machine Repair",
    category: "appliance",
    description:
      "Diagnose and repair washing machines and other appliances.",
    startingPrice: 399,
  },

  {
    name: "Custom Furniture Repair",
    category: "carpentry",
    description:
      "Furniture repair, fitting and custom woodwork.",
    startingPrice: 499,
  },

  {
    name: "Interior Wall Painting",
    category: "painting",
    description:
      "Interior wall painting, touch-ups and finishing.",
    startingPrice: 1499,
  },
];

/*
|--------------------------------------------------------------------------
| CREATE SERVICE
|--------------------------------------------------------------------------
*/

export const createService = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      image,
      startingPrice,
    } = req.body;

    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message:
          "Name and category are required",
      });
    }

    const existingService =
      await serviceModel.findOne({ name });

    if (existingService) {
      return res.status(409).json({
        success: false,
        message:
          "Service already exists",
      });
    }

    const service =
      await serviceModel.create({
        name,
        description,
        category,
        image,
        startingPrice,
      });

    return res.status(201).json({
      success: true,
      message:
        "Service created successfully",
      service,
    });
  } catch (error) {
    console.error(
      "CREATE SERVICE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Internal server error",
    });
  }
};

/*
|--------------------------------------------------------------------------
| ENSURE DEFAULT SERVICES
|--------------------------------------------------------------------------
|
| This solves the main problem:
|
| MongoDB empty
|       ↓
| /api/services returns []
|       ↓
| Frontend says "Service unavailable"
|
| Now if no active services exist, the backend creates
| the default services automatically.
|
*/

const ensureDefaultServices = async () => {
  const activeCount =
    await serviceModel.countDocuments({
      isActive: true,
    });

  if (activeCount > 0) {
    return;
  }

  console.log(
    "No active services found. Creating default services..."
  );

  for (const defaultService of DEFAULT_SERVICES) {
    /*
     * If service exists but was previously disabled,
     * reactivate it instead of creating a duplicate.
     */

    const existing =
      await serviceModel.findOne({
        name: defaultService.name,
      });

    if (existing) {
      existing.category =
        defaultService.category;

      existing.description =
        defaultService.description;

      existing.startingPrice =
        defaultService.startingPrice;

      existing.isActive = true;

      await existing.save();

      console.log(
        `Reactivated service: ${existing.name}`
      );
    } else {
      const created =
        await serviceModel.create(
          defaultService
        );

      console.log(
        `Created service: ${created.name}`
      );
    }
  }
};

/*
|--------------------------------------------------------------------------
| GET ALL SERVICES
|--------------------------------------------------------------------------
*/

export const getServices = async (
  req,
  res
) => {
  try {
    /*
     * Make sure MongoDB always has usable services.
     */
    await ensureDefaultServices();

    const services =
      await serviceModel
        .find({
          isActive: true,
        })
        .sort({
          createdAt: 1,
        });

    return res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    console.error(
      "GET SERVICES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Internal server error",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET SINGLE SERVICE
|--------------------------------------------------------------------------
*/

export const getService = async (
  req,
  res
) => {
  try {
    const service =
      await serviceModel.findById(
        req.params.id
      );

    if (
      !service ||
      !service.isActive
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Service not found",
      });
    }

    return res.status(200).json({
      success: true,
      service,
    });
  } catch (error) {
    console.error(
      "GET SERVICE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Internal server error",
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE SERVICE
|--------------------------------------------------------------------------
*/

export const updateService = async (
  req,
  res
) => {
  try {
    const service =
      await serviceModel.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!service) {
      return res.status(404).json({
        success: false,
        message:
          "Service not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Service updated successfully",
      service,
    });
  } catch (error) {
    console.error(
      "UPDATE SERVICE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Internal server error",
    });
  }
};

/*
|--------------------------------------------------------------------------
| DELETE SERVICE
|--------------------------------------------------------------------------
|
| Soft delete.
|
*/

export const deleteService = async (
  req,
  res
) => {
  try {
    const service =
      await serviceModel.findByIdAndUpdate(
        req.params.id,
        {
          isActive: false,
        },
        {
          new: true,
        }
      );

    if (!service) {
      return res.status(404).json({
        success: false,
        message:
          "Service not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Service deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE SERVICE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Internal server error",
    });
  }
};