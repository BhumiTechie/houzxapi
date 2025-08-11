const Property = require('../models/Property'); // Adjust the path as necessary

const getFilteredProperties = async (req, res) => {
  try {
    const {
      city,
      minPrice,
      maxPrice,
      rooms,
      isSharedProperty,
      propertyType,
      furnishType,
    } = req.query;

    const filters = {};

    if (city) filters.city = new RegExp(city, 'i'); // case-insensitive search
    if (rooms) filters.rooms = parseInt(rooms);
    if (isSharedProperty !== undefined)
      filters.isSharedProperty = isSharedProperty === 'true';
    if (propertyType) filters.propertyType = propertyType;
    if (furnishType) filters.furnishType = furnishType;

    if (minPrice && maxPrice) {
      filters.price = {
        $gte: parseInt(minPrice),
        $lte: parseInt(maxPrice),
      };
    }

    const properties = await Property.find(filters);
    res.json(properties);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getFilteredProperties };
