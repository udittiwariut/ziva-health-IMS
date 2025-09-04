const { getUserOrders, getCartCount } = require('../services/user.services');
const catchAsync = require('../utils/catchAsync');

const getOrders = catchAsync(async (req, res) => {
  const { userId } = req.params;

  const orders = await getUserOrders(userId);

  res.send(orders);
});

const getCartItemCount = catchAsync(async (req, res) => {
  const { userId } = req.params;

  const orders = await getCartCount(userId);

  res.send(orders);
});

module.exports = {
  getOrders,
  getCartItemCount,
};
