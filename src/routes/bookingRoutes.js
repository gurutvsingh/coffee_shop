const express = require('express');
const { createTableBooking, getBookings } = require('../controllers/bookingController');

const router = express.Router();

router.post('/booking', createTableBooking);
router.get('/bookings', getBookings);

module.exports = router;
