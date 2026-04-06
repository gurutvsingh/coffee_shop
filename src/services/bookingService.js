const { bookings } = require('../models/store');

const createBooking = (bookingPayload) => {
  const newBooking = {
    id: bookings.length + 1,
    createdAt: new Date().toISOString(),
    ...bookingPayload
  };

  bookings.push(newBooking);
  return newBooking;
};

const getAllBookings = () => bookings;

module.exports = {
  createBooking,
  getAllBookings
};
