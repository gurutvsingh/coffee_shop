const { orders } = require('../models/store');

const createOrder = (orderPayload) => {
  const newOrder = {
    id: orders.length + 1,
    createdAt: new Date().toISOString(),
    ...orderPayload
  };

  orders.push(newOrder);
  return newOrder;
};

const getAllOrders = () => orders;

module.exports = {
  createOrder,
  getAllOrders
};
