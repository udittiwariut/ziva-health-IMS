const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { createNewOrder } = require('../services/order.services');

const createOrder = catchAsync(async (req, res) => {
  const order = await createNewOrder(req.body);
  res.status(httpStatus.CREATED).send(order);
});

const getOrderDetailById = async () => {};

const updateOrderStatus = async () => {};

const processOrder = async () => {};

module.exports = {
  createOrder,
  getOrderDetailById,
  updateOrderStatus,
  processOrder,
};
