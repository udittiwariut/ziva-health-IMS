const httpStatus = require('http-status');

const catchAsync = require('../utils/catchAsync');
const {
  createNewOrder,
  fullFillOrder,
  cancelOrder,
  getOrderById,
  checkOrderStatus,
  fetchUserOrder,
} = require('../services/order.services');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');

const createOrder = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const jobId = await createNewOrder(userId);
  res.send({ jobId, message: 'Processing Your Order' });
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

  if (order.status === status) throw new ApiError(httpStatus.BAD_REQUEST, `Order Not Found`);

  if (status === 'confirmed') {
    await fullFillOrder(orderId);
    res.send({ message: 'Order Placed successfully' });
    return;
  }
  if (status === 'cancelled') {
    await cancelOrder(orderId);
    res.send({ message: 'Order Cancelled successfully' });
  }
});

// id is JOb ID
const getOrderStatus = catchAsync(async (req, res) => {
  const { id } = req.params;

  const status = await checkOrderStatus(id);

  return res.send(status);
});

// id is USER ID
const getUserOrder = catchAsync(async (req, res) => {
  const { userId } = req.params;

  const { status } = pick(req.query, ['status']);

  const orders = await fetchUserOrder(userId, status);

  return res.send(orders);
});

module.exports = {
  createOrder,
  getOrderDetailById,
  updateOrderStatus,
  getOrderStatus,
  getUserOrder,
};
