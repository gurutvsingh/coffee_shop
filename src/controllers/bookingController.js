const { createBooking, getAllBookings } = require('../services/bookingService');

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const createTableBooking = (req, res, next) => {
  try {
    const { name, people, date, time } = req.body;

    if (!isNonEmptyString(name)) {
      return res.status(400).json({
        success: false,
        message: 'Name is required.'
      });
    }

    if (!Number.isInteger(people) || people <= 0) {
      return res.status(400).json({
        success: false,
        message: 'People must be a positive integer.'
      });
    }

    if (!isNonEmptyString(date) || !isNonEmptyString(time)) {
      return res.status(400).json({
        success: false,
        message: 'Date and time are required.'
      });
    }

    const savedBooking = createBooking({
      name: name.trim(),
      people,
      date: date.trim(),
      time: time.trim()
    });

    return res.status(201).json({
      success: true,
      message: 'Table booked successfully.',
      data: savedBooking
    });
  } catch (error) {
    return next(error);
  }
};

const getBookings = (_req, res, next) => {
  try {
    return res.json({
      success: true,
      count: getAllBookings().length,
      data: getAllBookings()
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createTableBooking,
  getBookings
};
