const Property = require('../models/Property'); // Adjust path

const getFilteredProperties = async (req, res) => {
  try {
    let {
      city,
      minPrice,
      maxPrice,
      rooms,
      isSharedProperty,
      propertyType,
      furnishType,
      page = 1,
      limit = 10,
      sortBy = 'price',
      sortOrder = 'asc',
    } = req.query;

    const filters = {};

    // City filter (case-insensitive)
    if (city) filters.city = new RegExp(city, 'i');

    // Rooms filter
    if (rooms) filters.rooms = parseInt(rooms);

    // Shared/Whole filter
    if (isSharedProperty !== undefined)
      filters.isSharedProperty = isSharedProperty === 'true';

    // Property Type filter
    if (propertyType) filters.propertyType = propertyType;

    // Furnish Type filter
    if (furnishType) filters.furnishType = furnishType;

    // Price filter (flexible)
    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = parseInt(minPrice);
      if (maxPrice) filters.price.$lte = parseInt(maxPrice);
    }

    // Pagination
    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const properties = await Property.find(filters)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    const total = await Property.countDocuments(filters);

    res.json({
      page,
      totalPages: Math.ceil(total / limit),
      totalResults: total,
      properties,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getFilteredProperties };
