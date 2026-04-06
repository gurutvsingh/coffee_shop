const { createOrder, getAllOrders } = require('../services/orderService');

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const isValidItem = (item) => {
  if (!item || typeof item !== 'object') {
    return false;
  }

  const hasName = isNonEmptyString(item.name);
  const hasValidQuantity = Number.isInteger(item.quantity) && item.quantity > 0;
  const hasValidPrice = typeof item.price === 'number' && item.price >= 0;

  return hasName && hasValidQuantity && hasValidPrice;
};

const placeOrder = (req, res, next) => {
  try {
    const { name, phone, address, orderType, items, total } = req.body;

    if (!isNonEmptyString(name) || !isNonEmptyString(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Name and phone are required.'
      });
    }

    if (orderType !== 'pickup' && orderType !== 'delivery') {
      return res.status(400).json({
        success: false,
        message: 'orderType must be either "pickup" or "delivery".'
      });
    }

    if (orderType === 'delivery' && !isNonEmptyString(address)) {
      return res.status(400).json({
        success: false,
        message: 'Address is required for delivery orders.'
      });
    }

    if (!Array.isArray(items) || items.length === 0 || !items.every(isValidItem)) {
      return res.status(400).json({
        success: false,
        message: 'Items must be a non-empty array of { name, quantity, price }.'
      });
    }

    if (typeof total !== 'number' || total < 0) {
      return res.status(400).json({
        success: false,
        message: 'Total must be a valid number.'
      });
    }

    const computedTotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

    if (Math.abs(computedTotal - total) > 0.01) {
      return res.status(400).json({
        success: false,
        message: 'Total does not match item price calculation.'
      });
    }

    const savedOrder = createOrder({
      name: name.trim(),
      phone: phone.trim(),
      address: orderType === 'delivery' ? address.trim() : '',
      orderType,
      items,
      total
    });

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      data: savedOrder
    });
  } catch (error) {
    return next(error);
  }
};

const getOrders = (_req, res, next) => {
  try {
    return res.json({
      success: true,
      count: getAllOrders().length,
      data: getAllOrders()
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  placeOrder,
  getOrders
};
