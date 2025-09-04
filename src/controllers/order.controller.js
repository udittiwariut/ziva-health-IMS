const catchAsync = require('../utils/catchAsync');
const { createNewOrder, fullFillOrder, cancelOrder, getOrderById } = require('../services/order.services');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

const createOrder = catchAsync(async (req, res) => {
  const { userId } = req.params;
  await createNewOrder(userId);

  res.send('Order Placed Successfully');
});

const getOrderDetailById = catchAsync(async (req, res) => {
  const { orderId } = req.params;

  const order = getOrderById(orderId);

  res.send(order);
});

const updateOrderStatus = catchAsync(async (req, res) => {
  const { orderId } = req.params;

  const { status } = pick(req.query, ['status']);

  const order = await getOrderById(orderId);

  if (order.status === 'cancelled')
    throw new ApiError(httpStatus.BAD_REQUEST, `Order is cancelled cannot rewrite it's status`);

  if (order.status === status) throw new ApiError(httpStatus.BAD_REQUEST, `Invalid Request`);

  if (status === 'confirmed') {
    fullFillOrder(orderId);
    res.send({ message: 'Order Placed successfully' });
    return;
  }
  if (status === 'cancelled') {
    cancelOrder(orderId);
    res.send({ message: 'Order Cancelled successfully' });
  }
});

const processOrder = async () => {};

module.exports = {
  createOrder,
  getOrderDetailById,
  updateOrderStatus,
  processOrder,
};
